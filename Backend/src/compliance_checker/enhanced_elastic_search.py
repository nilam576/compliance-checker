"""
Enhanced Elastic Hybrid Search Features
Showcases advanced Elasticsearch capabilities for the hackathon
"""

import os
from typing import List, Dict, Any, Optional
from elasticsearch import Elasticsearch
from datetime import datetime


class EnhancedElasticSearch:
    """
    Advanced Elastic search features demonstrating:
    1. Hybrid search (BM25 + Vector similarity)
    2. Multi-field search
    3. Aggregations and analytics
    4. Fuzzy matching for typos
    5. Boosting and relevance tuning
    """
    
    def __init__(self, embedding_model=None):
        """Initialize Enhanced Elastic Search."""
        self.es = None
        self.index = "sebi_compliance_index"
        self.embedding_model = embedding_model
        self._connect()
    
    def _connect(self):
        """Connect to Elasticsearch."""
        try:
            ELASTICSEARCH_URL = os.getenv("ELASTICSEARCH_URL")
            ELASTICSEARCH_API_KEY = os.getenv("ELASTICSEARCH_API_KEY")
            
            if ELASTICSEARCH_API_KEY:
                self.es = Elasticsearch(
                    ELASTICSEARCH_URL,
                    api_key=ELASTICSEARCH_API_KEY
                )
                
                if self.es.ping():
                    print("✅ Enhanced Elastic Search connected")
                else:
                    print("⚠️ Elasticsearch ping failed")
            else:
                print("⚠️ ELASTICSEARCH_API_KEY not set")
                
        except Exception as e:
            print(f"⚠️ Elasticsearch connection error: {e}")
    
    def hybrid_search(
        self,
        query_text: str,
        query_vector: Optional[List[float]] = None,
        filters: Optional[Dict] = None,
        top_k: int = 10,
        keyword_weight: float = 0.5,
        vector_weight: float = 0.5
    ) -> List[Dict[str, Any]]:
        """
        Advanced hybrid search combining multiple strategies:
        1. BM25 keyword search
        2. Dense vector similarity
        3. Fuzzy matching for typos
        4. Field boosting
        
        Args:
            query_text: Search query
            query_vector: Dense vector representation
            filters: Additional filters (e.g., date range, doc_type)
            top_k: Number of results
            keyword_weight: Weight for keyword score (0-1)
            vector_weight: Weight for vector score (0-1)
            
        Returns:
            List of search results with scores
        """
        if not self.es or not self.es.ping():
            return []
        
        try:
            # Build query combining multiple strategies
            should_queries = []
            
            # 1. BM25 Keyword Search with boosting
            should_queries.append({
                "multi_match": {
                    "query": query_text,
                    "fields": ["text^2", "doc_id", "clause_id"],  # Boost text field
                    "type": "best_fields",
                    "boost": keyword_weight
                }
            })
            
            # 2. Fuzzy matching for typo tolerance
            should_queries.append({
                "match": {
                    "text": {
                        "query": query_text,
                        "fuzziness": "AUTO",
                        "boost": keyword_weight * 0.7
                    }
                }
            })
            
            # 3. Vector similarity (if vector provided)
            if query_vector:
                should_queries.append({
                    "script_score": {
                        "query": {"match_all": {}},
                        "script": {
                            "source": f"{vector_weight} * (cosineSimilarity(params.query_vector, 'embedding') + 1.0)",
                            "params": {"query_vector": query_vector}
                        }
                    }
                })
            
            # Build final query
            query_body = {
                "size": top_k,
                "query": {
                    "bool": {
                        "should": should_queries,
                        "minimum_should_match": 1
                    }
                },
                "_source": ["text", "doc_id", "clause_id", "chunk_id"],
                "highlight": {
                    "fields": {
                        "text": {
                            "pre_tags": ["<mark>"],
                            "post_tags": ["</mark>"],
                            "fragment_size": 150,
                            "number_of_fragments": 3
                        }
                    }
                }
            }
            
            # Add filters if provided
            if filters:
                query_body["query"]["bool"]["filter"] = []
                for field, value in filters.items():
                    query_body["query"]["bool"]["filter"].append({
                        "term": {field: value}
                    })
            
            # Execute search
            response = self.es.search(index=self.index, body=query_body)
            
            # Format results
            results = []
            for hit in response["hits"]["hits"]:
                result = {
                    "text": hit["_source"]["text"],
                    "doc_id": hit["_source"].get("doc_id"),
                    "clause_id": hit["_source"].get("clause_id"),
                    "chunk_id": hit["_source"].get("chunk_id"),
                    "score": hit["_score"],
                    "highlights": hit.get("highlight", {}).get("text", [])
                }
                results.append(result)
            
            return results
            
        except Exception as e:
            print(f"⚠️ Hybrid search error: {e}")
            return []
    
    def semantic_search(
        self,
        query_text: str,
        top_k: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Pure semantic search using vector similarity.
        Demonstrates Elastic's vector search capabilities.
        """
        if not self.embedding_model:
            print("⚠️ Embedding model not available")
            return []
        
        try:
            # Generate query vector
            query_vector = self.embedding_model.encode([query_text])[0]
            
            # Vector-only search
            query_body = {
                "size": top_k,
                "query": {
                    "script_score": {
                        "query": {"match_all": {}},
                        "script": {
                            "source": "cosineSimilarity(params.query_vector, 'embedding') + 1.0",
                            "params": {"query_vector": query_vector.tolist()}
                        }
                    }
                }
            }
            
            response = self.es.search(index=self.index, body=query_body)
            
            results = []
            for hit in response["hits"]["hits"]:
                result = {
                    "text": hit["_source"]["text"],
                    "metadata": {
                        "doc_id": hit["_source"].get("doc_id"),
                        "clause_id": hit["_source"].get("clause_id"),
                        "score": hit["_score"]
                    }
                }
                results.append(result)
            
            return results
            
        except Exception as e:
            print(f"⚠️ Semantic search error: {e}")
            return []
    
    def get_analytics(self) -> Dict[str, Any]:
        """
        Get analytics about the compliance database.
        Showcases Elasticsearch aggregation capabilities.
        """
        if not self.es or not self.es.ping():
            return {}
        
        try:
            # Aggregation query
            agg_query = {
                "size": 0,
                "aggs": {
                    "total_documents": {
                        "cardinality": {
                            "field": "doc_id.keyword"
                        }
                    },
                    "total_clauses": {
                        "cardinality": {
                            "field": "clause_id.keyword"
                        }
                    },
                    "documents_breakdown": {
                        "terms": {
                            "field": "doc_id.keyword",
                            "size": 10
                        }
                    },
                    "avg_text_length": {
                        "avg": {
                            "script": "doc['text.keyword'].value.length()"
                        }
                    }
                }
            }
            
            response = self.es.search(index=self.index, body=agg_query)
            
            analytics = {
                "total_documents": response["aggregations"]["total_documents"]["value"],
                "total_clauses": response["aggregations"]["total_clauses"]["value"],
                "total_chunks": response["hits"]["total"]["value"],
                "documents": [
                    {
                        "doc_id": bucket["key"],
                        "chunk_count": bucket["doc_count"]
                    }
                    for bucket in response["aggregations"]["documents_breakdown"]["buckets"]
                ]
            }
            
            return analytics
            
        except Exception as e:
            print(f"⚠️ Analytics error: {e}")
            return {}
    
    def find_similar_clauses(
        self,
        clause_text: str,
        similarity_threshold: float = 0.7,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Find similar clauses across all documents.
        Useful for identifying patterns and inconsistencies.
        """
        if not self.embedding_model:
            return []
        
        try:
            # Generate embedding
            query_vector = self.embedding_model.encode([clause_text])[0]
            
            # Search with minimum score threshold
            query_body = {
                "size": top_k,
                "min_score": similarity_threshold,
                "query": {
                    "script_score": {
                        "query": {"match_all": {}},
                        "script": {
                            "source": "cosineSimilarity(params.query_vector, 'embedding') + 1.0",
                            "params": {"query_vector": query_vector.tolist()}
                        }
                    }
                }
            }
            
            response = self.es.search(index=self.index, body=query_body)
            
            results = []
            for hit in response["hits"]["hits"]:
                # Normalize score (cosineSimilarity + 1.0 ranges from 0 to 2)
                normalized_score = (hit["_score"] - 1.0)
                
                result = {
                    "text": hit["_source"]["text"],
                    "similarity": round(normalized_score, 3),
                    "doc_id": hit["_source"].get("doc_id"),
                    "clause_id": hit["_source"].get("clause_id")
                }
                results.append(result)
            
            return results
            
        except Exception as e:
            print(f"⚠️ Similarity search error: {e}")
            return []
    
    def search_with_context(
        self,
        query_text: str,
        context_window: int = 2,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Search and return results with surrounding context.
        Useful for understanding clause context.
        """
        # First, do hybrid search
        results = self.hybrid_search(query_text, top_k=top_k)
        
        # Then fetch surrounding chunks for context
        enriched_results = []
        for result in results:
            doc_id = result.get("doc_id")
            chunk_id = result.get("chunk_id")
            
            if doc_id and chunk_id:
                # Fetch surrounding chunks
                context = self._get_surrounding_chunks(doc_id, chunk_id, context_window)
                result["context"] = context
            
            enriched_results.append(result)
        
        return enriched_results
    
    def _get_surrounding_chunks(
        self,
        doc_id: str,
        chunk_id: str,
        window: int
    ) -> Dict[str, List[str]]:
        """Get surrounding chunks for context."""
        try:
            # This is a simplified version
            # In production, you'd need to track chunk ordering
            query_body = {
                "size": window * 2 + 1,
                "query": {
                    "bool": {
                        "must": [
                            {"term": {"doc_id.keyword": doc_id}}
                        ]
                    }
                },
                "sort": [{"chunk_id.keyword": "asc"}]
            }
            
            response = self.es.search(index=self.index, body=query_body)
            
            chunks = [hit["_source"]["text"] for hit in response["hits"]["hits"]]
            
            return {
                "before": chunks[:window] if len(chunks) > window else [],
                "after": chunks[-window:] if len(chunks) > window else []
            }
            
        except Exception as e:
            print(f"⚠️ Context retrieval error: {e}")
            return {"before": [], "after": []}

