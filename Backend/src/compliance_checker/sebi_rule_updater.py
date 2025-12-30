"""
SEBI Regulation Auto-Update Service

Automatically fetches and updates SEBI regulations from official sources:
- SEBI Official Website (https://www.sebi.gov.in)
- SEBI Circulars and Guidelines
- Legal Updates Feed

Runs as a scheduled job to keep compliance rules current.
"""

import os
import logging
import json
import requests
from datetime import datetime, timedelta
from typing import List, Dict, Any
from bs4 import BeautifulSoup
from elasticsearch import Elasticsearch
from src.embedder.embeddings import EmbeddingModel

logger = logging.getLogger(__name__)

class SEBIRuleUpdater:
    def __init__(self):
        """Initialize SEBI rule updater"""
        self.sebi_base_url = "https://www.sebi.gov.in"
        self.update_log_file = "sebi_updates.log"
        
        # Initialize Elasticsearch
        self.es_url = os.getenv("ELASTICSEARCH_URL")
        self.es_api_key = os.getenv("ELASTICSEARCH_API_KEY")
        self.es_index = "sebi_compliance_index"
        
        if self.es_url and self.es_api_key:
            self.es = Elasticsearch(self.es_url, api_key=self.es_api_key)
            logger.info("[UPDATER] Elasticsearch connected for rule updates")
        else:
            self.es = None
            logger.warning("[UPDATER] Elasticsearch not configured")
        
        # Initialize embedding model
        try:
            self.embedding_model = EmbeddingModel("nlpaueb/legal-bert-base-uncased")
            logger.info("[UPDATER] Legal-BERT embedding model loaded")
        except Exception as e:
            logger.error(f"[UPDATER] Failed to load embedding model: {e}")
            self.embedding_model = None
    
    def check_for_updates(self) -> Dict[str, Any]:
        """
        Check SEBI website for new regulations and circulars
        """
        logger.info("[UPDATER] Checking for SEBI regulation updates...")
        
        updates = {
            "checked_at": datetime.now().isoformat(),
            "new_regulations": [],
            "amendments": [],
            "circulars": [],
            "total_updates": 0
        }
        
        try:
            # Check SEBI Legal Framework page
            updates_found = self._check_legal_framework()
            updates["new_regulations"].extend(updates_found)
            
            # Check SEBI Circulars
            circulars = self._check_circulars()
            updates["circulars"].extend(circulars)
            
            # Check amendments
            amendments = self._check_amendments()
            updates["amendments"].extend(amendments)
            
            updates["total_updates"] = (
                len(updates["new_regulations"]) +
                len(updates["amendments"]) +
                len(updates["circulars"])
            )
            
            logger.info(f"[UPDATER] Found {updates['total_updates']} updates")
            
            return updates
            
        except Exception as e:
            logger.error(f"[UPDATER] Error checking for updates: {e}")
            return updates
    
    def _check_legal_framework(self) -> List[Dict[str, Any]]:
        """
        Check SEBI Legal Framework section for new regulations
        """
        new_regulations = []
        
        try:
            # SEBI legal framework URLs
            urls_to_check = [
                f"{self.sebi_base_url}/legal/regulations.html",
                f"{self.sebi_base_url}/legal/master-circulars.html"
            ]
            
            for url in urls_to_check:
                try:
                    response = requests.get(url, timeout=30)
                    if response.status_code == 200:
                        soup = BeautifulSoup(response.content, 'html.parser')
                        
                        # Find regulation links (this will vary based on SEBI website structure)
                        regulation_links = soup.find_all('a', href=True)
                        
                        for link in regulation_links[:10]:  # Check latest 10
                            if 'regulation' in link.text.lower() or 'lodr' in link.text.lower():
                                regulation = {
                                    "title": link.text.strip(),
                                    "url": link['href'] if link['href'].startswith('http') else f"{self.sebi_base_url}{link['href']}",
                                    "type": "regulation",
                                    "found_date": datetime.now().isoformat()
                                }
                                new_regulations.append(regulation)
                                
                except Exception as e:
                    logger.warning(f"[UPDATER] Failed to check {url}: {e}")
                    continue
                    
        except Exception as e:
            logger.error(f"[UPDATER] Error checking legal framework: {e}")
        
        return new_regulations
    
    def _check_circulars(self) -> List[Dict[str, Any]]:
        """
        Check for new SEBI circulars issued in the last 30 days
        """
        circulars = []
        
        try:
            # SEBI Circulars API or page
            circulars_url = f"{self.sebi_base_url}/sebi_data/allcirculars.html"
            
            response = requests.get(circulars_url, timeout=30)
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Parse circular table (structure may vary)
                tables = soup.find_all('table')
                for table in tables[:1]:  # Check first table
                    rows = table.find_all('tr')[1:]  # Skip header
                    
                    for row in rows[:20]:  # Latest 20 circulars
                        cols = row.find_all('td')
                        if len(cols) >= 2:
                            circular = {
                                "title": cols[1].text.strip() if len(cols) > 1 else "Unknown",
                                "date": cols[0].text.strip() if len(cols) > 0 else "Unknown",
                                "type": "circular",
                                "found_date": datetime.now().isoformat()
                            }
                            
                            # Check if it's recent (last 30 days)
                            if self._is_recent(circular.get("date")):
                                circulars.append(circular)
                                
        except Exception as e:
            logger.error(f"[UPDATER] Error checking circulars: {e}")
        
        return circulars
    
    def _check_amendments(self) -> List[Dict[str, Any]]:
        """
        Check for amendments to existing regulations
        """
        amendments = []
        
        try:
            amendments_url = f"{self.sebi_base_url}/legal/amendments.html"
            
            response = requests.get(amendments_url, timeout=30)
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Find amendment links
                links = soup.find_all('a', href=True)
                
                for link in links[:10]:
                    if 'amendment' in link.text.lower():
                        amendment = {
                            "title": link.text.strip(),
                            "url": link['href'] if link['href'].startswith('http') else f"{self.sebi_base_url}{link['href']}",
                            "type": "amendment",
                            "found_date": datetime.now().isoformat()
                        }
                        amendments.append(amendment)
                        
        except Exception as e:
            logger.error(f"[UPDATER] Error checking amendments: {e}")
        
        return amendments
    
    def _is_recent(self, date_str: str, days: int = 30) -> bool:
        """
        Check if a date string represents a recent date (within specified days)
        """
        try:
            # Try to parse various date formats
            for fmt in ['%d-%m-%Y', '%d/%m/%Y', '%Y-%m-%d', '%d %b %Y']:
                try:
                    date_obj = datetime.strptime(date_str.strip(), fmt)
                    cutoff = datetime.now() - timedelta(days=days)
                    return date_obj >= cutoff
                except:
                    continue
            return False
        except:
            return False
    
    def fetch_and_index_regulation(self, regulation_url: str, regulation_data: Dict[str, Any]) -> bool:
        """
        Fetch full text of a regulation and index it in Elasticsearch
        """
        if not self.es or not self.embedding_model:
            logger.warning("[UPDATER] Cannot index regulation - ES or embeddings not available")
            return False
        
        try:
            logger.info(f"[UPDATER] Fetching regulation: {regulation_data.get('title', 'Unknown')}")
            
            # Fetch regulation content
            response = requests.get(regulation_url, timeout=30)
            if response.status_code != 200:
                logger.error(f"[UPDATER] Failed to fetch regulation from {regulation_url}")
                return False
            
            # Parse content
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract text (this will vary based on document structure)
            text_content = soup.get_text(separator='\n', strip=True)
            
            # Split into clauses/sections
            clauses = self._split_into_clauses(text_content)
            
            # Index each clause
            indexed_count = 0
            for i, clause in enumerate(clauses):
                if len(clause.strip()) < 50:  # Skip very short clauses
                    continue
                
                # Generate embedding
                embedding = self.embedding_model.get_embeddings([clause])[0]
                
                # Prepare document for Elasticsearch
                doc = {
                    "rule_text": clause,
                    "source": regulation_data.get("title", "SEBI Regulation"),
                    "url": regulation_url,
                    "type": regulation_data.get("type", "regulation"),
                    "clause_number": i + 1,
                    "indexed_date": datetime.now().isoformat(),
                    "embedding": embedding.tolist()
                }
                
                # Index in Elasticsearch
                self.es.index(
                    index=self.es_index,
                    document=doc
                )
                indexed_count += 1
            
            logger.info(f"[UPDATER] Indexed {indexed_count} clauses from {regulation_data.get('title')}")
            return True
            
        except Exception as e:
            logger.error(f"[UPDATER] Error indexing regulation: {e}")
            return False
    
    def _split_into_clauses(self, text: str) -> List[str]:
        """
        Split regulation text into individual clauses
        """
        # Simple splitting by paragraph for now
        # Can be enhanced with more sophisticated NLP
        paragraphs = text.split('\n\n')
        
        clauses = []
        for para in paragraphs:
            para = para.strip()
            if len(para) > 50:  # Minimum clause length
                clauses.append(para)
        
        return clauses
    
    def update_all_regulations(self, updates: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process and index all found updates
        """
        results = {
            "processed": 0,
            "successful": 0,
            "failed": 0,
            "skipped": 0
        }
        
        all_updates = (
            updates.get("new_regulations", []) +
            updates.get("amendments", []) +
            updates.get("circulars", [])
        )
        
        for update in all_updates:
            results["processed"] += 1
            
            url = update.get("url")
            if not url:
                results["skipped"] += 1
                continue
            
            # Check if already indexed (to avoid duplicates)
            if self._is_already_indexed(update):
                logger.info(f"[UPDATER] Skipping already indexed: {update.get('title')}")
                results["skipped"] += 1
                continue
            
            # Fetch and index
            success = self.fetch_and_index_regulation(url, update)
            
            if success:
                results["successful"] += 1
                self._log_update(update)
            else:
                results["failed"] += 1
        
        logger.info(f"[UPDATER] Update complete: {results}")
        return results
    
    def _is_already_indexed(self, update: Dict[str, Any]) -> bool:
        """
        Check if this regulation/circular is already in the index
        """
        if not self.es:
            return False
        
        try:
            query = {
                "query": {
                    "match": {
                        "source": update.get("title", "")
                    }
                }
            }
            
            response = self.es.search(index=self.es_index, body=query, size=1)
            return response['hits']['total']['value'] > 0
            
        except:
            return False
    
    def _log_update(self, update: Dict[str, Any]):
        """
        Log successful update to file
        """
        try:
            with open(self.update_log_file, 'a') as f:
                log_entry = {
                    "timestamp": datetime.now().isoformat(),
                    "title": update.get("title"),
                    "type": update.get("type"),
                    "url": update.get("url")
                }
                f.write(json.dumps(log_entry) + '\n')
        except Exception as e:
            logger.warning(f"[UPDATER] Failed to write log: {e}")
    
    def run_update_cycle(self) -> Dict[str, Any]:
        """
        Run a complete update cycle
        """
        logger.info("[UPDATER] Starting SEBI regulation update cycle")
        
        # Check for updates
        updates = self.check_for_updates()
        
        if updates["total_updates"] == 0:
            logger.info("[UPDATER] No new updates found")
            return {
                "status": "no_updates",
                "checked_at": updates["checked_at"]
            }
        
        # Process and index updates
        results = self.update_all_regulations(updates)
        
        return {
            "status": "completed",
            "checked_at": updates["checked_at"],
            "updates_found": updates["total_updates"],
            "processing_results": results
        }

# Global updater instance
sebi_updater = SEBIRuleUpdater()



