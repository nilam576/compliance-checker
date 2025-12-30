"""
Vertex AI Verifier with Gemini Pro
Integrates with Google Cloud Vertex AI for production-grade LLM access
"""

import os
import json
from typing import Any, Dict, List
from google.cloud import aiplatform
from vertexai.generative_models import GenerativeModel, ChatSession
import vertexai


class VertexAIVerifier:
    """
    Vertex AI-based compliance verifier using Gemini Pro on Google Cloud.
    This provides enterprise-grade AI with better rate limits and features.
    """

    def __init__(self, project_id: str = None, location: str = "us-central1"):
        """
        Initialize Vertex AI with Google Cloud credentials.
        
        Args:
            project_id: Google Cloud project ID (from credentials file if not provided)
            location: GCP region for Vertex AI
        """
        self.project_id = project_id or os.getenv("GCP_PROJECT_ID", "reglex-ai")
        self.location = location
        self.model_name = "gemini-3-pro-preview"
        
        # Initialize Vertex AI
        try:
            vertexai.init(project=self.project_id, location=self.location)
            self.model = GenerativeModel(self.model_name)
            self.chat_sessions = {}  # Store chat sessions for conversational context
            print(f"✅ Vertex AI initialized: {self.project_id} in {self.location}")
        except Exception as e:
            print(f"⚠️ Vertex AI initialization error: {e}")
            raise

    def verify_compliance(
        self,
        clause: Dict[str, Any],
        retrieved_rules: List[Dict[str, Any]],
        chat_history: List[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Verify compliance using Vertex AI Gemini Pro with conversational context.
        
        Args:
            clause: The clause to verify
            retrieved_rules: List of relevant SEBI regulations from Elastic search
            chat_history: Previous conversation context for multi-turn dialogue
            
        Returns:
            Structured compliance verification result
        """
        try:
            # Build prompt
            prompt = self._build_verification_prompt(clause, retrieved_rules, chat_history)
            
            # Get or create chat session for conversational context
            session_id = clause.get('session_id', 'default')
            
            if session_id not in self.chat_sessions or not chat_history:
                # Create new chat session
                self.chat_sessions[session_id] = self.model.start_chat()
            
            chat_session = self.chat_sessions[session_id]
            
            # Send message to Vertex AI
            response = chat_session.send_message(prompt)
            
            # Parse response
            result = self._parse_response(response.text, clause)
            
            return result
            
        except Exception as e:
            print(f"⚠️ Vertex AI verification error: {e}")
            return {
                "clause_id": clause.get("id", "unknown"),
                "compliant": False,
                "confidence": 0.0,
                "explanation": f"Verification error: {str(e)}",
                "risk_level": "HIGH",
                "provider": "vertex_ai",
                "error": str(e)
            }

    def _build_verification_prompt(
        self,
        clause: Dict[str, Any],
        retrieved_rules: List[Dict[str, Any]],
        chat_history: List[Dict[str, str]] = None
    ) -> str:
        """Build a comprehensive prompt for Vertex AI."""
        
        # Format retrieved rules
        rules_text = "\n\n".join([
            f"Regulation {i+1}: {rule['rule_text']}"
            for i, rule in enumerate(retrieved_rules[:5])
        ])
        
        # Add chat history for context
        history_context = ""
        if chat_history:
            history_context = "\n\nPrevious Conversation:\n"
            for msg in chat_history[-3:]:  # Last 3 messages for context
                history_context += f"{msg['role']}: {msg['content']}\n"
        
        prompt = f"""You are a SEBI (Securities and Exchange Board of India) compliance expert assistant.
        
Analyze the following legal clause against SEBI regulations retrieved from our database.
{history_context}

CLAUSE TO VERIFY:
{clause.get('text_en', clause.get('text', 'N/A'))}

RELEVANT SEBI REGULATIONS (Retrieved via Elastic Hybrid Search):
{rules_text}

Provide a comprehensive compliance analysis in JSON format with the following structure:
{{
    "compliant": true/false,
    "confidence": 0.0-1.0,
    "explanation": "Detailed explanation of compliance status",
    "risk_level": "LOW/MEDIUM/HIGH",
    "risk_category": "LEGAL/FINANCIAL/OPERATIONAL/REPUTATIONAL",
    "violated_regulations": ["List of specific regulations violated, if any"],
    "recommendations": ["Actionable recommendations for compliance"],
    "affected_parties": ["List of stakeholders affected"],
    "timeline": "Timeline for compliance (e.g., 'Immediate', '30 days', '90 days')"
}}

Respond ONLY with valid JSON."""

        return prompt

    def _parse_response(self, response_text: str, clause: Dict[str, Any]) -> Dict[str, Any]:
        """Parse Vertex AI response into structured format."""
        try:
            # Extract JSON from response
            response_text = response_text.strip()
            
            # Handle markdown code blocks
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()
            
            result = json.loads(response_text)
            
            # Add metadata
            result["clause_id"] = clause.get("id", "unknown")
            result["provider"] = "vertex_ai"
            result["model"] = self.model_name
            
            return result
            
        except json.JSONDecodeError as e:
            print(f"⚠️ JSON parse error: {e}")
            print(f"Response: {response_text[:500]}")
            
            # Fallback parsing
            return {
                "clause_id": clause.get("id", "unknown"),
                "compliant": "compliant" in response_text.lower() and "not" not in response_text.lower()[:100],
                "confidence": 0.7,
                "explanation": response_text[:500],
                "risk_level": "MEDIUM",
                "provider": "vertex_ai",
                "raw_response": response_text
            }

    def chat(self, message: str, session_id: str = "default") -> str:
        """
        Conversational interface for asking follow-up questions.
        
        Args:
            message: User question
            session_id: Chat session identifier
            
        Returns:
            AI response
        """
        try:
            if session_id not in self.chat_sessions:
                self.chat_sessions[session_id] = self.model.start_chat()
            
            chat_session = self.chat_sessions[session_id]
            response = chat_session.send_message(message)
            
            return response.text
            
        except Exception as e:
            return f"Error in chat: {str(e)}"

    def clear_session(self, session_id: str = "default"):
        """Clear a chat session."""
        if session_id in self.chat_sessions:
            del self.chat_sessions[session_id]

    def get_embedding(self, text: str) -> List[float]:
        """
        Get text embeddings using Vertex AI.
        Useful for custom semantic search implementations.
        """
        try:
            from vertexai.language_models import TextEmbeddingModel
            
            embedding_model = TextEmbeddingModel.from_pretrained("textembedding-gecko@003")
            embeddings = embedding_model.get_embeddings([text])
            
            return embeddings[0].values
            
        except Exception as e:
            print(f"⚠️ Embedding error: {e}")
            return []

