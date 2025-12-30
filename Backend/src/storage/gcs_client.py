"""
Google Cloud Storage client for handling document storage and metadata
"""
import os
import json
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from google.cloud import storage
from google.cloud.exceptions import NotFound, GoogleCloudError
from src.compliance_checker.compliance_agent import ComplianceAgent
from src.extraction.extract_pipeline import _extract_text_from_pdf
import json
import base64
from io import BytesIO

logger = logging.getLogger(__name__)

class GCSClient:
    """Google Cloud Storage client for SEBI compliance system"""
    
    def __init__(self):
        """Initialize GCS client with credentials from environment"""
        try:
            self.bucket_name = os.getenv('GCS_BUCKET_NAME', 'sebi-hack')

            # Initialize the storage client
            # Credentials are loaded from GOOGLE_APPLICATION_CREDENTIALS env var
            self.client = storage.Client()
            self.bucket = self.client.bucket(self.bucket_name)

            logger.info(f"[GCS] Initialized client for bucket: {self.bucket_name}")

        except Exception as e:
            logger.error(f"[GCS] Failed to initialize client: {e}")
            logger.error("[GCS] Please ensure GOOGLE_APPLICATION_CREDENTIALS is set correctly")
            raise
    
    def upload_document_metadata(self, document_id: str, metadata: Dict[str, Any]) -> bool:
        """
        Upload document processing metadata to GCS
        
        Args:
            document_id: Unique identifier for the document
            metadata: Dictionary containing document processing details
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            # Create blob path for metadata
            blob_name = f"documents/{document_id}/metadata.json"
            blob = self.bucket.blob(blob_name)
            
            # Add timestamp and processing info
            enriched_metadata = {
                **metadata,
                "stored_at": datetime.now(timezone.utc).isoformat(),
                "gcs_bucket": self.bucket_name,
                "gcs_path": blob_name,
                "document_id": document_id
            }
            
            # Upload as JSON
            blob.upload_from_string(
                json.dumps(enriched_metadata, indent=2),
                content_type='application/json'
            )
            
            logger.info(f"[GCS] Uploaded metadata for document {document_id} to {blob_name}")
            return True
            
        except GoogleCloudError as e:
            logger.error(f"[GCS] Failed to upload metadata for {document_id}: {e}")
            return False
        except Exception as e:
            logger.error(f"[GCS] Unexpected error uploading metadata for {document_id}: {e}")
            return False
    
    def upload_processing_results(self, document_id: str, results: Dict[str, Any]) -> bool:
        """
        Upload document processing results to GCS
        
        Args:
            document_id: Unique identifier for the document
            results: Dictionary containing processing results (summary, clauses, compliance, etc.)
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            # Create blob path for results
            blob_name = f"documents/{document_id}/results.json"
            blob = self.bucket.blob(blob_name)
            
            # Add processing timestamp
            enriched_results = {
                **results,
                "processed_at": datetime.now(timezone.utc).isoformat(),
                "gcs_bucket": self.bucket_name,
                "gcs_path": blob_name,
                "document_id": document_id
            }
            
            # Upload as JSON
            blob.upload_from_string(
                json.dumps(enriched_results, indent=2, default=str),
                content_type='application/json'
            )
            
            logger.info(f"[GCS] Uploaded results for document {document_id} to {blob_name}")
            return True
            
        except GoogleCloudError as e:
            logger.error(f"[GCS] Failed to upload results for {document_id}: {e}")
            return False
        except Exception as e:
            logger.error(f"[GCS] Unexpected error uploading results for {document_id}: {e}")
            return False
    
    def upload_document_file(self, document_id: str, file_content: bytes, filename: str) -> bool:
        """
        Upload the actual document file to GCS
        
        Args:
            document_id: Unique identifier for the document
            file_content: Raw file bytes
            filename: Original filename
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            # Create blob path for the file
            file_extension = filename.split('.')[-1] if '.' in filename else 'pdf'
            blob_name = f"documents/{document_id}/original.{file_extension}"
            blob = self.bucket.blob(blob_name)
            
            # Set content type based on extension
            content_type = 'application/pdf' if file_extension.lower() == 'pdf' else 'application/octet-stream'
            
            # Upload file
            blob.upload_from_string(file_content, content_type=content_type)
            
            # Set metadata
            blob.metadata = {
                'document_id': document_id,
                'original_filename': filename,
                'uploaded_at': datetime.now(timezone.utc).isoformat()
            }
            blob.patch()
            
            logger.info(f"[GCS] Uploaded file for document {document_id} to {blob_name}")
            return True
            
        except GoogleCloudError as e:
            logger.error(f"[GCS] Failed to upload file for {document_id}: {e}")
            return False
        except Exception as e:
            logger.error(f"[GCS] Unexpected error uploading file for {document_id}: {e}")
            return False
    
    def get_document_metadata(self, document_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve document metadata from GCS
        
        Args:
            document_id: Unique identifier for the document
            
        Returns:
            Dictionary containing metadata or None if not found
        """

        try:
            blob_name = f"documents/{document_id}/metadata.json"
            blob = self.bucket.blob(blob_name)

            if not blob.exists():
                logger.warning(f"[GCS] Metadata not found for document {document_id}")
                return None

            content = blob.download_as_text()
            metadata = json.loads(content)

            # Ensure all required fields are present with defaults for dashboard
            enhanced_metadata = {
                "document_id": metadata.get("document_id", document_id),
                "filename": metadata.get("filename", "Unknown Document"),
                "file_size": metadata.get("file_size", 0),
                "content_type": metadata.get("content_type", "application/pdf"),
                "language": metadata.get("language", "English"),
                "uploaded_at": metadata.get("uploaded_at", datetime.now(timezone.utc).isoformat()),
                "processed_at": metadata.get("processed_at", metadata.get("uploaded_at")),
                "processing_status": metadata.get("processing_status", "unknown"),
                "total_clauses": metadata.get("total_clauses", 0),
                "compliant_count": metadata.get("compliant_count", 0),
                "non_compliant_count": metadata.get("non_compliant_count", 0),
                "high_risk_count": metadata.get("high_risk_count", 0),
                "medium_risk_count": metadata.get("medium_risk_count", 0),
                "low_risk_count": metadata.get("low_risk_count", 0),
                "compliance_rate": metadata.get("compliance_rate", 0),
                "overall_score": metadata.get("overall_score", metadata.get("compliance_rate", 0)),
                "stored_at": metadata.get("stored_at", datetime.now(timezone.utc).isoformat()),
                "gcs_bucket": metadata.get("gcs_bucket", self.bucket_name),
                "gcs_path": metadata.get("gcs_path", blob_name)
            }

            logger.info(f"[GCS] Retrieved enhanced metadata for document {document_id}")
            return enhanced_metadata
            
        except NotFound:
            logger.warning(f"[GCS] Document {document_id} not found")
            return None
        except Exception as e:
            logger.error(f"[GCS] Failed to retrieve metadata for {document_id}: {e}")
            return None

    def get_dashboard_summary(self) -> Dict[str, Any]:
        """
        Get comprehensive dashboard summary data from all documents in GCS

        Returns:
            Dictionary containing dashboard summary statistics
        """
        try:
            document_ids = self.list_documents(limit=10000)

            summary = {
                "total_documents": len(document_ids),
                "processed_documents": 0,
                "compliant_documents": 0,
                "high_risk_documents": 0,
                "medium_risk_documents": 0,
                "low_risk_documents": 0,
                "total_compliance_rate": 0.0,
                "avg_processing_time": 0,
                "recent_uploads": [],
                "compliance_trend": {},
                "risk_distribution": {
                    "high": 0,
                    "medium": 0,
                    "low": 0,
                    "compliant": 0
                }
            }

            processing_times = []
            compliant_rates = []

            for doc_id in document_ids:
                metadata = self.get_document_metadata(doc_id)
                if metadata:
                    processing_status = metadata.get("processing_status", "unknown")

                    # Count processed documents
                    if processing_status == "completed":
                        summary["processed_documents"] += 1

                        # Compliance data
                        compliance_rate = metadata.get("compliance_rate", 0)
                        compliant_rates.append(compliance_rate)

                        if compliance_rate >= 80:
                            summary["compliant_documents"] += 1

                        # Risk distribution
                        high_risk = metadata.get("high_risk_count", 0)
                        medium_risk = metadata.get("medium_risk_count", 0)

                        if high_risk > 0:
                            summary["high_risk_documents"] += 1
                            summary["risk_distribution"]["high"] += 1
                        elif medium_risk > 0:
                            summary["medium_risk_documents"] += 1
                            summary["risk_distribution"]["medium"] += 1
                        elif compliance_rate >= 80:
                            summary["risk_distribution"]["compliant"] += 1
                        else:
                            summary["risk_distribution"]["low"] += 1

                        # Processing time (mock for now, could be tracked)
                        processing_times.append(2000 + (high_risk * 500))

                    # Recent uploads
                    uploaded_at = metadata.get("uploaded_at", "")
                    if uploaded_at:
                        summary["recent_uploads"].append({
                            "document_id": doc_id,
                            "filename": metadata.get("filename", "Unknown"),
                            "uploaded_at": uploaded_at,
                            "status": processing_status
                        })

            # Calculate averages
            if compliant_rates:
                summary["total_compliance_rate"] = round(sum(compliant_rates) / len(compliant_rates), 1)

            if processing_times:
                summary["avg_processing_time"] = int(sum(processing_times) / len(processing_times))

            # Sort recent uploads by date
            summary["recent_uploads"].sort(key=lambda x: x["uploaded_at"], reverse=True)
            summary["recent_uploads"] = summary["recent_uploads"][:5]  # Last 5 uploads

            logger.info(f"[GCS] Generated dashboard summary for {len(document_ids)} documents")
            return summary

        except Exception as e:
            logger.error(f"[GCS] Failed to generate dashboard summary: {e}")
            raise

    def analyze_document_compliance(self, document_id: str) -> Dict[str, Any]:
        """
        Perform real-time compliance analysis on a stored document

        Args:
            document_id: Unique identifier for the document

        Returns:
            Dictionary containing detailed compliance analysis
        """

        try:
            # Get document metadata
            metadata = self.get_document_metadata(document_id)
            if not metadata:
                return {"error": "Document metadata not found"}

            # Try to get stored document content, fallback to stored results
            document_content = self.get_document_content(document_id)
            clauses = []

            # If no content but we have stored results, use those
            if not document_content:
                stored_results = self.get_processing_results(document_id)
                if stored_results and "clauses" in stored_results:
                    logger.info(f"[GCS] Using stored results for {document_id}")
                    clauses = stored_results["clauses"]
                else:
                    return {"error": "Document content and stored results not found"}
            else:
                # Extract text from document if it's a PDF
                if metadata.get("content_type") == "application/pdf":
                    try:
                        # Convert base64 content back to bytes
                        content_bytes = base64.b64decode(document_content)

                        # Extract text from PDF
                        extracted_text = _extract_text_from_pdf(content_bytes)

                        # Split text into clauses (simple approach - split by newlines)
                        clauses = [clause.strip() for clause in extracted_text.split('\n\n') if clause.strip()]
                        if not clauses:
                            return {"error": "No clauses found in document"}

                    except Exception as e:
                        logger.error(f"[GCS] Failed to extract text from PDF {document_id}: {e}")
                        return {"error": f"PDF processing failed: {str(e)}"}
                else:
                    # For non-PDF documents, try to extract clauses from stored data
                    stored_results = self.get_processing_results(document_id)
                    if stored_results and "clauses" in stored_results:
                        clauses = stored_results["clauses"]
                    else:
                        return {"error": "No clause data available for analysis"}

            # Perform compliance analysis
            compliance_agent = ComplianceAgent(llm_client="gemini")
            compliance_results = compliance_agent.ensure_compliance(clauses)

            # Extract compliance statistics
            verification_results = compliance_results.get("verification_results", [])
            risk_explanations = compliance_results.get("risk_explanations", [])

            total_clauses = len(verification_results)
            compliant_count = sum(1 for result in verification_results if result.get("is_compliant", False))
            non_compliant_count = total_clauses - compliant_count

            # Calculate risk distribution
            high_risk_count = sum(1 for risk in risk_explanations if risk and risk.get("severity") == "High")
            medium_risk_count = sum(1 for risk in risk_explanations if risk and risk.get("severity") == "Medium")
            low_risk_count = sum(1 for risk in risk_explanations if risk and risk.get("severity") == "Low")

            compliance_rate = round((compliant_count / total_clauses * 100), 2) if total_clauses > 0 else 0

            # Calculate overall risk score (weighted by severity)
            risk_score = (high_risk_count * 3) + (medium_risk_count * 2) + (low_risk_count * 1)
            max_possible_risk = total_clauses * 3
            normalized_risk_score = round((risk_score / max_possible_risk * 100), 2) if max_possible_risk > 0 else 0

            analysis_result = {
                "document_id": document_id,
                "filename": metadata.get("filename", "Unknown"),
                "analysis_timestamp": datetime.now(timezone.utc).isoformat(),
                "compliance_analysis": {
                    "total_clauses": total_clauses,
                    "compliant_clauses": compliant_count,
                    "non_compliant_clauses": non_compliant_count,
                    "compliance_rate": compliance_rate,
                    "high_risk_clauses": high_risk_count,
                    "medium_risk_clauses": medium_risk_count,
                    "low_risk_clauses": low_risk_count
                },
                "risk_assessment": {
                    "overall_risk_score": normalized_risk_score,
                    "risk_level": "High" if normalized_risk_score > 70 else "Medium" if normalized_risk_score > 40 else "Low",
                    "risk_factors": risk_explanations
                },
                "detailed_results": {
                    "verification_results": verification_results,
                    "risk_explanations": risk_explanations,
                    "extracted_clauses": clauses
                },
                "processing_status": "analyzed"
            }

            logger.info(f"[GCS] Completed real-time compliance analysis for {document_id}")
            return analysis_result

        except Exception as e:
            logger.error(f"[GCS] Failed to analyze document compliance for {document_id}: {e}")
            return {"error": str(e)}

    def get_document_content(self, document_id: str) -> Optional[str]:
        """
        Retrieve the original document content from GCS

        Args:
            document_id: Unique identifier for the document

        Returns:
            Base64 encoded document content or None if not found
        """
        try:
            # First try the new path structure (original.{extension})
            metadata = self.get_document_metadata(document_id)
            if metadata:
                filename = metadata.get("filename", "")
                if filename:
                    file_extension = filename.split('.')[-1] if '.' in filename else 'pdf'
                    blob_name = f"documents/{document_id}/original.{file_extension}"
                    blob = self.bucket.blob(blob_name)

                    if blob.exists():
                        content = blob.download_as_bytes()
                        encoded_content = base64.b64encode(content).decode('utf-8')
                        logger.info(f"[GCS] Retrieved document content for {document_id} from {blob_name}")
                        return encoded_content

            # Fallback to old path structure for backward compatibility
            blob_name = f"documents/{document_id}/content.bin"
            blob = self.bucket.blob(blob_name)

            if not blob.exists():
                logger.warning(f"[GCS] Document content not found for {document_id}")
                return None

            content = blob.download_as_bytes()
            encoded_content = base64.b64encode(content).decode('utf-8')

            logger.info(f"[GCS] Retrieved document content for {document_id}")
            return encoded_content

        except Exception as e:
            logger.error(f"[GCS] Failed to retrieve document content for {document_id}: {e}")
            return None

    def analyze_all_documents_compliance(self, limit: int = 50) -> Dict[str, Any]:
        """
        Perform compliance analysis on all stored documents

        Args:
            limit: Maximum number of documents to analyze

        Returns:
            Comprehensive analysis results for all documents
        """
        try:
            document_ids = self.list_documents(limit=limit)
            analysis_results = []
            summary_stats = {
                "total_documents": len(document_ids),
                "analyzed_documents": 0,
                "total_compliance_rate": 0.0,
                "avg_risk_score": 0.0,
                "high_risk_documents": 0,
                "total_clauses_analyzed": 0,
                "total_compliant_clauses": 0
            }

            for doc_id in document_ids:
                analysis = self.analyze_document_compliance(doc_id)

                if "error" not in analysis:
                    analysis_results.append(analysis)
                    summary_stats["analyzed_documents"] += 1

                    # Update summary statistics
                    compliance = analysis["compliance_analysis"]
                    risk = analysis["risk_assessment"]

                    summary_stats["total_compliance_rate"] += compliance["compliance_rate"]
                    summary_stats["avg_risk_score"] += risk["overall_risk_score"]
                    summary_stats["total_clauses_analyzed"] += compliance["total_clauses"]
                    summary_stats["total_compliant_clauses"] += compliance["compliant_clauses"]

                    if risk["risk_level"] == "High":
                        summary_stats["high_risk_documents"] += 1

            # Calculate averages
            if summary_stats["analyzed_documents"] > 0:
                summary_stats["total_compliance_rate"] = round(
                    summary_stats["total_compliance_rate"] / summary_stats["analyzed_documents"], 2
                )
                summary_stats["avg_risk_score"] = round(
                    summary_stats["avg_risk_score"] / summary_stats["analyzed_documents"], 2
                )

            result = {
                "summary": summary_stats,
                "document_analyses": analysis_results,
                "generated_at": datetime.now(timezone.utc).isoformat()
            }

            logger.info(f"[GCS] Completed compliance analysis for {len(analysis_results)} documents")
            return result

        except Exception as e:
            logger.error(f"[GCS] Failed to analyze all documents: {e}")
            return {"error": str(e)}

    def get_processing_results(self, document_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve processing results from GCS
        
        Args:
            document_id: Unique identifier for the document
            
        Returns:
            Dictionary containing processing results or None if not found
        """
        try:
            blob_name = f"documents/{document_id}/results.json"
            blob = self.bucket.blob(blob_name)
            
            if not blob.exists():
                logger.warning(f"[GCS] Results not found for document {document_id}")
                return None
                
            content = blob.download_as_text()
            results = json.loads(content)
            
            logger.info(f"[GCS] Retrieved results for document {document_id}")
            return results
            
        except NotFound:
            logger.warning(f"[GCS] Results for document {document_id} not found")
            return None
        except Exception as e:
            logger.error(f"[GCS] Failed to retrieve results for {document_id}: {e}")
            return None
    
    def list_documents(self, limit: int = 100) -> list:
        """
        List all documents in the bucket

        Args:
            limit: Maximum number of documents to return

        Returns:
            List of document IDs
        """
        try:
            document_ids = set()
            blobs = self.client.list_blobs(self.bucket, prefix="documents/", max_results=limit * 3)

            for blob in blobs:
                # Extract document ID from path like "documents/doc_123/metadata.json"
                path_parts = blob.name.split('/')
                if len(path_parts) >= 3 and path_parts[0] == "documents":
                    document_ids.add(path_parts[1])

                if len(document_ids) >= limit:
                    break

            logger.info(f"[GCS] Listed {len(document_ids)} documents")
            return list(document_ids)

        except Exception as e:
            logger.error(f"[GCS] Failed to list documents: {e}")
            return []
    
    def delete_document(self, document_id: str) -> bool:
        """
        Delete all files associated with a document

        Args:
            document_id: Unique identifier for the document

        Returns:
            bool: True if successful, False otherwise
        """
        try:
            # Delete all blobs with the document prefix
            blobs = self.client.list_blobs(self.bucket, prefix=f"documents/{document_id}/")
            deleted_count = 0

            for blob in blobs:
                blob.delete()
                deleted_count += 1

            logger.info(f"[GCS] Deleted {deleted_count} files for document {document_id}")
            return True

        except Exception as e:
            logger.error(f"[GCS] Failed to delete document {document_id}: {e}")
            return False

    def export_compliance_reports(self, start_date: Optional[str] = None, end_date: Optional[str] = None) -> Dict[str, Any]:
        """
        Export detailed compliance reports from GCS

        Args:
            start_date: Start date for filtering reports (ISO format)
            end_date: End date for filtering reports (ISO format)

        Returns:
            Dictionary containing comprehensive compliance report data
        """
        try:
            compliance_data = {
                "report_type": "Compliance Reports",
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "date_range": {
                    "start": start_date,
                    "end": end_date
                },
                "documents": [],
                "summary": {
                    "total_documents": 0,
                    "compliant_documents": 0,
                    "non_compliant_documents": 0,
                    "high_risk_count": 0,
                    "medium_risk_count": 0,
                    "low_risk_count": 0
                },
                "compliance_rate": 0.0,
                "risk_distribution": {}
            }

            # Get all documents
            document_ids = self.list_documents(limit=1000)

            for doc_id in document_ids:
                metadata = self.get_document_metadata(doc_id)
                results = self.get_processing_results(doc_id)

                if metadata and results:
                    doc_data = {
                        "document_id": doc_id,
                        "filename": metadata.get("filename", ""),
                        "uploaded_at": metadata.get("uploaded_at", ""),
                        "processed_at": metadata.get("processed_at", ""),
                        "file_size": metadata.get("file_size", 0),
                        "compliance_status": results.get("overall_compliance", "Unknown"),
                        "risk_level": results.get("risk_level", "Unknown"),
                        "clauses_analyzed": results.get("total_clauses", 0),
                        "compliant_clauses": results.get("compliant_clauses", 0),
                        "violations": results.get("violations", []),
                        "recommendations": results.get("recommendations", [])
                    }

                    compliance_data["documents"].append(doc_data)

                    # Update summary statistics
                    compliance_data["summary"]["total_documents"] += 1
                    if doc_data["compliance_status"] == "Compliant":
                        compliance_data["summary"]["compliant_documents"] += 1

                    risk_level = doc_data["risk_level"]
                    if risk_level == "High":
                        compliance_data["summary"]["high_risk_count"] += 1
                    elif risk_level == "Medium":
                        compliance_data["summary"]["medium_risk_count"] += 1
                    elif risk_level == "Low":
                        compliance_data["summary"]["low_risk_count"] += 1

            # Calculate compliance rate
            total = compliance_data["summary"]["total_documents"]
            compliant = compliance_data["summary"]["compliant_documents"]
            compliance_data["compliance_rate"] = (compliant / total * 100) if total > 0 else 0.0

            logger.info(f"[GCS] Exported compliance report for {total} documents")
            return compliance_data

        except Exception as e:
            logger.error(f"[GCS] Failed to export compliance reports: {e}")
            return {"error": str(e)}

    def export_risk_analysis(self, start_date: Optional[str] = None, end_date: Optional[str] = None) -> Dict[str, Any]:
        """
        Export detailed risk analysis reports from GCS

        Args:
            start_date: Start date for filtering reports (ISO format)
            end_date: End date for filtering reports (ISO format)

        Returns:
            Dictionary containing comprehensive risk analysis data
        """
        try:
            risk_data = {
                "report_type": "Risk Analysis",
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "date_range": {
                    "start": start_date,
                    "end": end_date
                },
                "risk_categories": {
                    "high": [],
                    "medium": [],
                    "low": []
                },
                "risk_trends": [],
                "mitigation_strategies": [],
                "summary": {
                    "total_risks": 0,
                    "critical_risks": 0,
                    "high_risks": 0,
                    "medium_risks": 0,
                    "low_risks": 0
                }
            }

            # Get all documents and analyze risks
            document_ids = self.list_documents(limit=1000)

            for doc_id in document_ids:
                results = self.get_processing_results(doc_id)

                if results and "risk_assessment" in results:
                    risk_assessment = results["risk_assessment"]

                    risk_entry = {
                        "document_id": doc_id,
                        "filename": results.get("filename", ""),
                        "risk_level": risk_assessment.get("severity", "Unknown"),
                        "risk_score": risk_assessment.get("score", 0),
                        "violations": risk_assessment.get("violations", []),
                        "recommendations": risk_assessment.get("recommendations", []),
                        "affected_clauses": risk_assessment.get("affected_clauses", [])
                    }

                    risk_level = risk_entry["risk_level"].lower()
                    if risk_level in risk_data["risk_categories"]:
                        risk_data["risk_categories"][risk_level].append(risk_entry)

                    # Update summary
                    risk_data["summary"]["total_risks"] += 1
                    if risk_level == "critical":
                        risk_data["summary"]["critical_risks"] += 1
                    elif risk_level == "high":
                        risk_data["summary"]["high_risks"] += 1
                    elif risk_level == "medium":
                        risk_data["summary"]["medium_risks"] += 1
                    elif risk_level == "low":
                        risk_data["summary"]["low_risks"] += 1

            logger.info(f"[GCS] Exported risk analysis for {risk_data['summary']['total_risks']} risks")
            return risk_data

        except Exception as e:
            logger.error(f"[GCS] Failed to export risk analysis: {e}")
            return {"error": str(e)}

    def export_trend_analysis(self, period: str = "30d") -> Dict[str, Any]:
        """
        Export trend analysis reports from GCS

        Args:
            period: Time period for trend analysis (7d, 30d, 90d, 1y)

        Returns:
            Dictionary containing trend analysis data
        """
        try:
            trend_data = {
                "report_type": "Trend Analysis",
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "period": period,
                "compliance_trends": [],
                "risk_trends": [],
                "document_volume_trends": [],
                "summary": {
                    "period_start": "",
                    "period_end": "",
                    "total_documents": 0,
                    "compliance_improvement": 0.0,
                    "risk_reduction": 0.0
                }
            }

            # Get all documents for trend analysis
            document_ids = self.list_documents(limit=1000)

            # Group documents by date for trend analysis
            date_groups = {}

            for doc_id in document_ids:
                metadata = self.get_document_metadata(doc_id)
                results = self.get_processing_results(doc_id)

                if metadata and results:
                    upload_date = metadata.get("uploaded_at", "")
                    if upload_date:
                        date_key = upload_date.split("T")[0]  # Get date part only

                        if date_key not in date_groups:
                            date_groups[date_key] = []

                        date_groups[date_key].append({
                            "document_id": doc_id,
                            "compliance_status": results.get("overall_compliance", "Unknown"),
                            "risk_level": results.get("risk_level", "Unknown")
                        })

            # Calculate trends
            sorted_dates = sorted(date_groups.keys())

            for date in sorted_dates:
                docs = date_groups[date]
                compliant_count = sum(1 for doc in docs if doc["compliance_status"] == "Compliant")
                total_count = len(docs)

                compliance_rate = (compliant_count / total_count * 100) if total_count > 0 else 0

                trend_data["compliance_trends"].append({
                    "date": date,
                    "compliance_rate": compliance_rate,
                    "total_documents": total_count
                })

                trend_data["document_volume_trends"].append({
                    "date": date,
                    "count": total_count
                })

            trend_data["summary"]["total_documents"] = len(document_ids)
            trend_data["summary"]["period_start"] = sorted_dates[0] if sorted_dates else ""
            trend_data["summary"]["period_end"] = sorted_dates[-1] if sorted_dates else ""

            logger.info(f"[GCS] Exported trend analysis for {len(sorted_dates)} days")
            return trend_data

        except Exception as e:
            logger.error(f"[GCS] Failed to export trend analysis: {e}")
            return {"error": str(e)}

    def export_custom_report(self, filters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Export custom reports based on specific filters

        Args:
            filters: Dictionary containing filter criteria

        Returns:
            Dictionary containing custom report data
        """
        try:
            custom_data = {
                "report_type": "Custom Report",
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "filters": filters,
                "documents": [],
                "summary": {
                    "total_matching_documents": 0,
                    "filtered_by": []
                }
            }

            # Apply filters to get matching documents
            document_ids = self.list_documents(limit=1000)

            for doc_id in document_ids:
                metadata = self.get_document_metadata(doc_id)
                results = self.get_processing_results(doc_id)

                if metadata and results:
                    # Apply custom filters
                    matches_filters = True

                    if "compliance_status" in filters:
                        if results.get("overall_compliance") != filters["compliance_status"]:
                            matches_filters = False

                    if "risk_level" in filters:
                        if results.get("risk_level") != filters["risk_level"]:
                            matches_filters = False

                    if "date_range" in filters:
                        upload_date = metadata.get("uploaded_at", "")
                        if upload_date:
                            if not (filters["date_range"]["start"] <= upload_date <= filters["date_range"]["end"]):
                                matches_filters = False

                    if matches_filters:
                        doc_data = {
                            "document_id": doc_id,
                            "filename": metadata.get("filename", ""),
                            "uploaded_at": metadata.get("uploaded_at", ""),
                            "compliance_status": results.get("overall_compliance", "Unknown"),
                            "risk_level": results.get("risk_level", "Unknown"),
                            "clauses_analyzed": results.get("total_clauses", 0),
                            "violations": results.get("violations", [])
                        }

                        custom_data["documents"].append(doc_data)
                        custom_data["summary"]["total_matching_documents"] += 1

            custom_data["summary"]["filtered_by"] = list(filters.keys())

            logger.info(f"[GCS] Exported custom report for {custom_data['summary']['total_matching_documents']} documents")
            return custom_data

        except Exception as e:
            logger.error(f"[GCS] Failed to export custom report: {e}")
            return {"error": str(e)}

# Global GCS client instance
_gcs_client = None

def get_gcs_client() -> GCSClient:
    """Get or create global GCS client instance"""
    global _gcs_client
    if _gcs_client is None:
        _gcs_client = GCSClient()
    return _gcs_client