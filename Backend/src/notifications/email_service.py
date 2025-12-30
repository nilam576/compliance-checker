"""
Email Notification Service for RegLex AI

Sends email notifications for:
- High-risk compliance violations
- Document processing completion
- System alerts
"""

import os
import logging
from typing import List, Dict, Any
from datetime import datetime
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content

logger = logging.getLogger(__name__)

class EmailNotificationService:
    def __init__(self):
        """Initialize email service with SendGrid API key"""
        self.api_key = os.getenv("SENDGRID_API_KEY")
        self.from_email = os.getenv("NOTIFICATION_FROM_EMAIL", "noreply@reglex.ai")
        self.enabled = bool(self.api_key)
        
        if not self.enabled:
            logger.warning("[EMAIL] SendGrid API key not configured. Email notifications disabled.")
        else:
            self.sg = SendGridAPIClient(self.api_key)
            logger.info("[EMAIL] Email notification service initialized")
    
    def send_high_risk_alert(
        self,
        to_emails: List[str],
        document_name: str,
        document_id: str,
        risk_count: int,
        violations: List[Dict[str, Any]]
    ) -> bool:
        """
        Send alert for high-risk compliance violations
        """
        if not self.enabled:
            logger.info("[EMAIL] Notifications disabled - skipping high-risk alert")
            return False
        
        try:
            subject = f"🚨 High-Risk Compliance Alert: {document_name}"
            
            # Generate violation list
            violation_list = "\n".join([
                f"- {v.get('clause', 'Unknown')} (Risk: {v.get('risk_level', 'unknown')})"
                for v in violations[:5]  # Top 5 violations
            ])
            
            html_content = f"""
            <html>
            <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <div style="background-color: #dc2626; color: white; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                        <h2 style="margin: 0;">⚠️ High-Risk Compliance Alert</h2>
                    </div>
                    
                    <p>A document has been processed and <strong>{risk_count} high-risk compliance violations</strong> were detected.</p>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #333;">Document Details</h3>
                        <p><strong>Name:</strong> {document_name}</p>
                        <p><strong>Document ID:</strong> {document_id}</p>
                        <p><strong>Processed:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}</p>
                    </div>
                    
                    <h3>Top Violations:</h3>
                    <div style="background-color: #fef2f2; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        <pre style="font-family: monospace; font-size: 12px; line-height: 1.6; margin: 0;">{violation_list}</pre>
                    </div>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                        <p style="margin-bottom: 15px;"><strong>Immediate Action Required:</strong></p>
                        <ol style="line-height: 1.8; color: #555;">
                            <li>Review the document in the dashboard</li>
                            <li>Address high-risk violations immediately</li>
                            <li>Consult with legal/compliance team if needed</li>
                            <li>Re-upload corrected version for verification</li>
                        </ol>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="https://reglex-frontend-127310351608.us-central1.run.app/dashboard/analysis/{document_id}" 
                           style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                            View Full Analysis
                        </a>
                    </div>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #777; font-size: 12px; text-align: center;">
                        <p>This is an automated notification from RegLex AI Compliance Platform</p>
                        <p>Powered by Google Vertex AI & Elasticsearch</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            message = Mail(
                from_email=self.from_email,
                to_emails=to_emails,
                subject=subject,
                html_content=html_content
            )
            
            response = self.sg.send(message)
            logger.info(f"[EMAIL] High-risk alert sent to {len(to_emails)} recipients. Status: {response.status_code}")
            return True
            
        except Exception as e:
            logger.error(f"[EMAIL] Failed to send high-risk alert: {e}")
            return False
    
    def send_processing_complete(
        self,
        to_emails: List[str],
        document_name: str,
        document_id: str,
        compliance_rate: float,
        risk_level: str
    ) -> bool:
        """
        Send notification when document processing is complete
        """
        if not self.enabled:
            logger.info("[EMAIL] Notifications disabled - skipping completion email")
            return False
        
        try:
            subject = f"✅ Document Processed: {document_name}"
            
            # Risk level styling
            risk_colors = {
                "high": ("#dc2626", "🔴"),
                "medium": ("#f59e0b", "🟡"),
                "low": ("#10b981", "🟢")
            }
            risk_color, risk_emoji = risk_colors.get(risk_level.lower(), ("#6b7280", "⚪"))
            
            html_content = f"""
            <html>
            <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <div style="background-color: #2563eb; color: white; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                        <h2 style="margin: 0;">✅ Document Processing Complete</h2>
                    </div>
                    
                    <p>Your document has been successfully analyzed for SEBI compliance.</p>
                    
                    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #333;">Analysis Summary</h3>
                        <p><strong>Document:</strong> {document_name}</p>
                        <p><strong>Compliance Rate:</strong> <span style="color: {risk_color}; font-size: 24px; font-weight: bold;">{compliance_rate:.1f}%</span></p>
                        <p><strong>Risk Level:</strong> <span style="color: {risk_color}; font-weight: bold;">{risk_emoji} {risk_level.upper()}</span></p>
                        <p><strong>Processed:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}</p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://reglex-frontend-127310351608.us-central1.run.app/dashboard/analysis/{document_id}" 
                           style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                            View Detailed Report
                        </a>
                    </div>
                    
                    <div style="margin-top: 20px; padding: 15px; background-color: #eff6ff; border-left: 4px solid #2563eb; border-radius: 3px;">
                        <p style="margin: 0; font-size: 14px;"><strong>💡 Next Steps:</strong></p>
                        <ul style="margin: 10px 0 0 0; padding-left: 20px; font-size: 14px;">
                            <li>Review detailed clause-by-clause analysis</li>
                            <li>Address any compliance issues found</li>
                            <li>Export report for your records</li>
                        </ul>
                    </div>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #777; font-size: 12px; text-align: center;">
                        <p>RegLex AI - SEBI Compliance Platform</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            message = Mail(
                from_email=self.from_email,
                to_emails=to_emails,
                subject=subject,
                html_content=html_content
            )
            
            response = self.sg.send(message)
            logger.info(f"[EMAIL] Processing complete notification sent. Status: {response.status_code}")
            return True
            
        except Exception as e:
            logger.error(f"[EMAIL] Failed to send completion notification: {e}")
            return False
    
    def send_weekly_summary(
        self,
        to_emails: List[str],
        stats: Dict[str, Any]
    ) -> bool:
        """
        Send weekly compliance summary
        """
        if not self.enabled:
            logger.info("[EMAIL] Notifications disabled - skipping weekly summary")
            return False
        
        try:
            subject = f"📊 Weekly Compliance Summary - {datetime.now().strftime('%b %d, %Y')}"
            
            html_content = f"""
            <html>
            <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <div style="background-color: #7c3aed; color: white; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                        <h2 style="margin: 0;">📊 Weekly Compliance Summary</h2>
                    </div>
                    
                    <p>Here's your compliance activity summary for the past week.</p>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
                        <div style="background-color: #eff6ff; padding: 15px; border-radius: 5px; text-align: center;">
                            <div style="font-size: 32px; font-weight: bold; color: #2563eb;">{stats.get('documents_processed', 0)}</div>
                            <div style="color: #555; font-size: 14px;">Documents Processed</div>
                        </div>
                        <div style="background-color: #fef2f2; padding: 15px; border-radius: 5px; text-align: center;">
                            <div style="font-size: 32px; font-weight: bold; color: #dc2626;">{stats.get('high_risk_found', 0)}</div>
                            <div style="color: #555; font-size: 14px;">High-Risk Issues</div>
                        </div>
                    </div>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Key Metrics</h3>
                        <p>📈 Average Compliance Rate: <strong>{stats.get('avg_compliance_rate', 0):.1f}%</strong></p>
                        <p>⚠️ Total Violations: <strong>{stats.get('total_violations', 0)}</strong></p>
                        <p>✅ Compliant Documents: <strong>{stats.get('compliant_docs', 0)}</strong></p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="https://reglex-frontend-127310351608.us-central1.run.app/dashboard" 
                           style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                            View Full Dashboard
                        </a>
                    </div>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #777; font-size: 12px; text-align: center;">
                        <p>RegLex AI - Automated SEBI Compliance</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            message = Mail(
                from_email=self.from_email,
                to_emails=to_emails,
                subject=subject,
                html_content=html_content
            )
            
            response = self.sg.send(message)
            logger.info(f"[EMAIL] Weekly summary sent. Status: {response.status_code}")
            return True
            
        except Exception as e:
            logger.error(f"[EMAIL] Failed to send weekly summary: {e}")
            return False

# Global email service instance
email_service = EmailNotificationService()



