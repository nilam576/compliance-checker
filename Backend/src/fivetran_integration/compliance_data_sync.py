"""
Compliance Data Sync Service
Automatically syncs compliance analysis to Fivetran/BigQuery
"""

import os
from typing import Dict, Any
from datetime import datetime
import uuid


class ComplianceDataSync:
    """
    Service to sync compliance data to BigQuery via Fivetran.
    Demonstrates the full data pipeline for hackathon.
    """
    
    def __init__(self):
        """Initialize sync service."""
        from .fivetran_connector import FivetranConnector
        
        self.connector = FivetranConnector()
        self.sync_enabled = os.getenv("ENABLE_FIVETRAN_SYNC", "false").lower() == "true"
    
    def sync_analysis_results(
        self,
        document_name: str,
        results: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Sync compliance analysis results to BigQuery.
        
        Args:
            document_name: Name of analyzed document
            results: Analysis results from compliance agent
            
        Returns:
            Sync status and metadata
        """
        try:
            # Generate IDs
            analysis_id = str(uuid.uuid4())
            document_id = f"doc_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            # Sync to Fivetran/BigQuery
            success = self.connector.sync_compliance_analysis(
                analysis_id=analysis_id,
                document_id=document_id,
                document_name=document_name,
                results=results
            )
            
            if success:
                return {
                    "status": "synced",
                    "analysis_id": analysis_id,
                    "document_id": document_id,
                    "destination": "BigQuery via Fivetran",
                    "timestamp": datetime.utcnow().isoformat(),
                    "message": "Data synced for advanced analytics"
                }
            else:
                return {
                    "status": "sync_disabled",
                    "message": "Fivetran sync is disabled. Enable with ENABLE_FIVETRAN_SYNC=true"
                }
                
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
                "message": "Sync failed but analysis completed successfully"
            }
    
    def get_analytics(self) -> Dict[str, Any]:
        """Get analytics from BigQuery."""
        try:
            return self.connector.get_analytics_summary()
        except Exception as e:
            return {"error": str(e)}

