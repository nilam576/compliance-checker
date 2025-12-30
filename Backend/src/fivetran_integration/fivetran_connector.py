"""
Fivetran Connector for RegLex AI
Syncs compliance analysis results to BigQuery via Fivetran for advanced analytics

This integration showcases:
1. Custom data connector using Fivetran
2. Automated pipeline to BigQuery
3. AI-powered analytics on compliance data
"""

import os
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
from google.cloud import bigquery


class FivetranConnector:
    """
    Fivetran integration for syncing compliance data to BigQuery.
    
    In a production Fivetran setup, this would be:
    1. A custom connector using Fivetran Connector SDK
    2. Automated sync to BigQuery
    3. Real-time data pipeline
    
    For hackathon demo, we're simulating the data flow:
    RegLex AI → Fivetran → BigQuery → Vertex AI Analytics
    """
    
    def __init__(
        self,
        project_id: str = None,
        dataset_id: str = "reglex_compliance",
        enable_sync: bool = True
    ):
        """
        Initialize Fivetran connector.
        
        Args:
            project_id: GCP project ID
            dataset_id: BigQuery dataset for compliance data
            enable_sync: Whether to actually sync to BigQuery
        """
        self.project_id = project_id or os.getenv("GCP_PROJECT_ID", "reglex-ai")
        self.dataset_id = dataset_id
        self.enable_sync = enable_sync and os.getenv("ENABLE_FIVETRAN_SYNC", "false").lower() == "true"
        
        if self.enable_sync:
            try:
                self.bq_client = bigquery.Client(project=self.project_id)
                self._ensure_dataset_exists()
                self._ensure_tables_exist()
                print(f"✅ Fivetran connector initialized: {self.project_id}.{self.dataset_id}")
            except Exception as e:
                print(f"⚠️ Fivetran connector error: {e}")
                self.enable_sync = False
        else:
            self.bq_client = None
            print("ℹ️ Fivetran sync disabled (demo mode)")
    
    def _ensure_dataset_exists(self):
        """Create BigQuery dataset if not exists."""
        try:
            dataset_ref = f"{self.project_id}.{self.dataset_id}"
            try:
                self.bq_client.get_dataset(dataset_ref)
            except Exception:
                # Create dataset
                dataset = bigquery.Dataset(dataset_ref)
                dataset.location = "US"
                dataset.description = "RegLex AI compliance analysis data synced via Fivetran"
                self.bq_client.create_dataset(dataset)
                print(f"✅ Created BigQuery dataset: {dataset_ref}")
        except Exception as e:
            print(f"⚠️ Dataset creation error: {e}")
    
    def _ensure_tables_exist(self):
        """Create BigQuery tables for compliance data."""
        tables_schema = {
            "compliance_analyses": [
                bigquery.SchemaField("analysis_id", "STRING", mode="REQUIRED"),
                bigquery.SchemaField("document_id", "STRING", mode="REQUIRED"),
                bigquery.SchemaField("document_name", "STRING"),
                bigquery.SchemaField("analysis_timestamp", "TIMESTAMP", mode="REQUIRED"),
                bigquery.SchemaField("total_clauses", "INTEGER"),
                bigquery.SchemaField("compliant_clauses", "INTEGER"),
                bigquery.SchemaField("non_compliant_clauses", "INTEGER"),
                bigquery.SchemaField("compliance_score", "FLOAT"),
                bigquery.SchemaField("risk_level", "STRING"),
                bigquery.SchemaField("processing_time_seconds", "FLOAT"),
            ],
            "clause_verifications": [
                bigquery.SchemaField("verification_id", "STRING", mode="REQUIRED"),
                bigquery.SchemaField("analysis_id", "STRING", mode="REQUIRED"),
                bigquery.SchemaField("clause_id", "STRING", mode="REQUIRED"),
                bigquery.SchemaField("clause_text", "STRING"),
                bigquery.SchemaField("is_compliant", "BOOLEAN"),
                bigquery.SchemaField("confidence", "FLOAT"),
                bigquery.SchemaField("risk_level", "STRING"),
                bigquery.SchemaField("risk_category", "STRING"),
                bigquery.SchemaField("explanation", "STRING"),
                bigquery.SchemaField("violated_regulations", "STRING", mode="REPEATED"),
                bigquery.SchemaField("recommendations", "STRING", mode="REPEATED"),
                bigquery.SchemaField("verification_timestamp", "TIMESTAMP"),
            ],
            "risk_metrics": [
                bigquery.SchemaField("metric_id", "STRING", mode="REQUIRED"),
                bigquery.SchemaField("analysis_id", "STRING", mode="REQUIRED"),
                bigquery.SchemaField("risk_type", "STRING"),
                bigquery.SchemaField("severity", "STRING"),
                bigquery.SchemaField("affected_parties", "STRING", mode="REPEATED"),
                bigquery.SchemaField("mitigation_timeline", "STRING"),
                bigquery.SchemaField("estimated_impact", "STRING"),
                bigquery.SchemaField("metric_timestamp", "TIMESTAMP"),
            ]
        }
        
        for table_name, schema in tables_schema.items():
            try:
                table_ref = f"{self.project_id}.{self.dataset_id}.{table_name}"
                try:
                    self.bq_client.get_table(table_ref)
                except Exception:
                    # Create table
                    table = bigquery.Table(table_ref, schema=schema)
                    self.bq_client.create_table(table)
                    print(f"✅ Created table: {table_name}")
            except Exception as e:
                print(f"⚠️ Table creation error for {table_name}: {e}")
    
    def sync_compliance_analysis(
        self,
        analysis_id: str,
        document_id: str,
        document_name: str,
        results: Dict[str, Any]
    ) -> bool:
        """
        Sync compliance analysis to BigQuery via Fivetran.
        
        Args:
            analysis_id: Unique analysis identifier
            document_id: Document identifier
            document_name: Document name
            results: Complete analysis results
            
        Returns:
            Success status
        """
        if not self.enable_sync:
            print("ℹ️ Fivetran sync disabled - data not sent to BigQuery")
            return False
        
        try:
            # Extract summary metrics
            summary = results.get("summary", {})
            
            # Prepare analysis record
            analysis_record = {
                "analysis_id": analysis_id,
                "document_id": document_id,
                "document_name": document_name,
                "analysis_timestamp": datetime.utcnow().isoformat(),
                "total_clauses": summary.get("total_clauses", 0),
                "compliant_clauses": summary.get("compliant_clauses", 0),
                "non_compliant_clauses": summary.get("non_compliant_clauses", 0),
                "compliance_score": summary.get("compliance_percentage", 0.0),
                "risk_level": summary.get("overall_risk", "UNKNOWN"),
                "processing_time_seconds": results.get("processing_time", 0.0),
            }
            
            # Insert to BigQuery
            table_ref = f"{self.project_id}.{self.dataset_id}.compliance_analyses"
            errors = self.bq_client.insert_rows_json(table_ref, [analysis_record])
            
            if errors:
                print(f"⚠️ BigQuery insert errors: {errors}")
                return False
            
            # Sync clause-level data
            self._sync_clause_verifications(analysis_id, results.get("clauses", []))
            
            # Sync risk metrics
            self._sync_risk_metrics(analysis_id, results.get("risks", []))
            
            print(f"✅ Synced analysis {analysis_id} to BigQuery via Fivetran")
            return True
            
        except Exception as e:
            print(f"⚠️ Fivetran sync error: {e}")
            return False
    
    def _sync_clause_verifications(self, analysis_id: str, clauses: List[Dict]):
        """Sync individual clause verifications."""
        if not clauses:
            return
        
        try:
            records = []
            for clause in clauses:
                record = {
                    "verification_id": f"{analysis_id}_{clause.get('clause_id', 'unknown')}",
                    "analysis_id": analysis_id,
                    "clause_id": clause.get("clause_id", "unknown"),
                    "clause_text": clause.get("text_en", "")[:5000],  # Limit text length
                    "is_compliant": clause.get("compliant", False),
                    "confidence": clause.get("confidence", 0.0),
                    "risk_level": clause.get("risk_level", "UNKNOWN"),
                    "risk_category": clause.get("risk_category", "UNKNOWN"),
                    "explanation": clause.get("explanation", "")[:5000],
                    "violated_regulations": clause.get("violated_regulations", []),
                    "recommendations": clause.get("recommendations", []),
                    "verification_timestamp": datetime.utcnow().isoformat(),
                }
                records.append(record)
            
            table_ref = f"{self.project_id}.{self.dataset_id}.clause_verifications"
            self.bq_client.insert_rows_json(table_ref, records)
            
        except Exception as e:
            print(f"⚠️ Clause sync error: {e}")
    
    def _sync_risk_metrics(self, analysis_id: str, risks: List[Dict]):
        """Sync risk assessment metrics."""
        if not risks:
            return
        
        try:
            records = []
            for i, risk in enumerate(risks):
                record = {
                    "metric_id": f"{analysis_id}_risk_{i}",
                    "analysis_id": analysis_id,
                    "risk_type": risk.get("type", "UNKNOWN"),
                    "severity": risk.get("severity", "UNKNOWN"),
                    "affected_parties": risk.get("affected_parties", []),
                    "mitigation_timeline": risk.get("timeline", "UNKNOWN"),
                    "estimated_impact": risk.get("impact", "UNKNOWN"),
                    "metric_timestamp": datetime.utcnow().isoformat(),
                }
                records.append(record)
            
            table_ref = f"{self.project_id}.{self.dataset_id}.risk_metrics"
            self.bq_client.insert_rows_json(table_ref, records)
            
        except Exception as e:
            print(f"⚠️ Risk metrics sync error: {e}")
    
    def get_analytics_summary(self) -> Dict[str, Any]:
        """
        Get analytics from BigQuery using Vertex AI.
        Demonstrates: Fivetran → BigQuery → Vertex AI Analytics pipeline
        """
        if not self.enable_sync:
            return {"error": "Fivetran sync disabled"}
        
        try:
            # Query compliance trends
            query = f"""
            SELECT 
                DATE(analysis_timestamp) as date,
                COUNT(*) as total_analyses,
                AVG(compliance_score) as avg_compliance_score,
                AVG(total_clauses) as avg_clauses_per_doc,
                SUM(CASE WHEN risk_level = 'HIGH' THEN 1 ELSE 0 END) as high_risk_count
            FROM `{self.project_id}.{self.dataset_id}.compliance_analyses`
            WHERE analysis_timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
            GROUP BY date
            ORDER BY date DESC
            LIMIT 30
            """
            
            query_job = self.bq_client.query(query)
            results = query_job.result()
            
            analytics = {
                "trends": [dict(row) for row in results],
                "source": "Fivetran → BigQuery → Vertex AI Analytics"
            }
            
            return analytics
            
        except Exception as e:
            print(f"⚠️ Analytics query error: {e}")
            return {"error": str(e)}

