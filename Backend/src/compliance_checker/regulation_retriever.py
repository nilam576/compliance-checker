"""
Regulation Retrieval Agent (Elastic Hybrid Search based)

This agent extracts the top k relevant rules 
from a Elasticsearch index based on input legal clauses.
"""

import os
import pickle
import faiss
from elasticsearch import Elasticsearch
from src.embedder.embeddings import EmbeddingModel

class RegulationRetriever:
    def __init__(self, faiss_index_path: str, metadata_path: str, model_name: str = "nlpaueb/legal-bert-base-uncased"):
        """
        Initialize the RegulationRetriever with Elasticsearch.
        
        Args:
            metadata_path: Path to metadata pickle file
        """
        self.faiss_index_path = None
        self.metadata_path = metadata_path
        self.model_name = model_name
        self.index = None
        self.es = None
        self.metadata = None
        self.embedding_model = None
    
    def _get_es_index(self) -> Elasticsearch:
        """
        Get the Elasticsearch index and ingest metadata and embeddings if not present.
        """
        try:
            # Load metadata and generate embeddings
            if self.metadata is None:
                try:
                    with open(self.metadata_path, "rb") as f:
                        self.metadata = pickle.load(f)
                except Exception as e:
                    print(f"Warning: Could not load metadata: {e}")
                    return False
            
            # Initialize embedding model
            if self.embedding_model is None:
                try:
                    self.embedding_model = EmbeddingModel(self.model_name)
                except Exception as e:
                    print(f"Warning: Could not load embedding model: {e}")
                    return False
                
            # Initialize Elasticsearch client
            ELASTICSEARCH_URL = os.getenv("ELASTICSEARCH_URL", "http://localhost:9200")
            ELASTICSEARCH_API_KEY = os.getenv("ELASTICSEARCH_API_KEY", None)

            if ELASTICSEARCH_API_KEY is not None:
                self.es = Elasticsearch(
                    ELASTICSEARCH_URL,
                    api_key=ELASTICSEARCH_API_KEY
                )
            else:
                print("Warning: ELASTICSEARCH_API_KEY not set")
                return False
            if not self.es.ping():
                print("Warning: Could not connect to Elasticsearch")
                return False
            self.index = "sebi_compliance_index"
            
            # Check if index exists
            if not self.es.indices.exists(index=self.index):
                # Create index with embedding mapping
                mapping = {
                "mappings": {
                    "properties": {
                    "text": {"type": "text"},
                    "doc_id": {"type": "keyword"},
                    "clause_id": {"type": "keyword"},
                    "chunk_id": {"type": "keyword"},
                    "embedding": {
                        "type": "dense_vector",
                        "dims": 768  # Legal-BERT dimension
                    }
                    }
                }
                }
                self.es.indices.create(index=self.index, body=mapping)
                
                # Generate embeddings and ingest data
                try:
                    # Load embeddings from FAISS index
                    faiss_index = faiss.read_index('faiss_index.bin')
                    embeddings = faiss_index.reconstruct_n(0, faiss_index.ntotal)
                    
                    for doc, embedding in zip(self.metadata, embeddings):
                        self.es.index(
                        index=self.index,
                        document={
                            "text": doc["text"],
                            "doc_id": doc["doc_id"],
                            "clause_id": doc["clause_id"],
                            "chunk_id": doc["chunk_id"],
                            "embedding": embedding.tolist()
                        }
                        )
                    self.es.indices.refresh(index=self.index)
                except Exception as e:
                    print(f"Warning: Failed to ingest data: {e}")
                    return False
                
        except Exception as e:
            print(f"Warning: Could not initialize Elasticsearch: {e}")
            return False
        
        return True

    def retrieve_similar_rules(self, clauses: list[dict], top_k: int = 5) -> list[dict]:
        """
        Retrieve top k similar rules for each clause using Elasticsearch.
        """
        if not self._get_es_index():
            # Return dummy results if loading fails
            return [{
                "original_clause": clause,
                "matches": [{"rule_text": "Retrieval error: Could not connect to Elasticsearch", "metadata": {}}]
            } for clause in clauses]
        
        try:
            query_texts = [clause["text_en"] for clause in clauses]
            query_embeddings = self.embedding_model.encode(query_texts)
            
            # Perform hybrid search for each query
            results = []
            for clause, query_vector in zip(clauses, query_embeddings):
                query_text = clause["text_en"]
                
                # Hybrid search: keyword + vector
                query_body = {
                    "size": top_k,
                    "query": {
                        "bool": {
                            "should": [
                                {"match": {"text": query_text}},
                                {
                                    "script_score": {
                                        "query": {"match_all": {}},
                                        "script": {
                                            "source": "cosineSimilarity(params.query_vector, 'embedding') + 1.0",
                                            "params": {"query_vector": query_vector.tolist()}
                                        }
                                    }
                                }
                            ]
                        }
                    }
                }

                response = self.es.search(index=self.index, body=query_body)

                matches = []
                for hit in response["hits"]["hits"]:
                    src = hit["_source"]
                    matches.append({
                        "rule_text": src["text"],
                        "metadata": {
                            "doc_id": src.get("doc_id"),
                            "clause_id": src.get("clause_id"), 
                            "chunk_id": src.get("chunk_id"),
                            "score": hit["_score"]
                        }
                    })

                results.append({
                    "original_clause": clause,
                    "matches": matches
                })

            return results
        except Exception as e:
            print(f"Warning: Elasticsearch retrieval failed: {e}")
            return [{
                "original_clause": clause,
                "matches": [{"rule_text": f"Retrieval error: {str(e)}", "metadata": {}}]
            } for clause in clauses]
