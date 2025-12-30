"""
Conversational Compliance Agent
Multi-turn dialogue interface for compliance questions and document analysis
"""

import os
from typing import List, Dict, Any, Optional
from datetime import datetime


class ConversationalComplianceAgent:
    """
    An intelligent conversational agent that provides multi-turn dialogue
    for compliance questions, document analysis, and regulatory guidance.
    
    This showcases the Elastic + Google Cloud integration for interactive,
    context-aware compliance assistance.
    """
    
    def __init__(self, llm_verifier=None, retriever=None):
        """
        Initialize the conversational agent.
        
        Args:
            llm_verifier: LLM verifier instance (Vertex AI, Gemini, etc.)
            retriever: Regulation retriever with Elastic hybrid search
        """
        self.llm_verifier = llm_verifier
        self.retriever = retriever
        self.conversation_history = {}  # Store conversations by session_id
        self.max_history = 10  # Keep last 10 messages
        
    def start_session(self, session_id: str = None) -> str:
        """
        Start a new conversation session.
        
        Returns:
            session_id for this conversation
        """
        if session_id is None:
            session_id = f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        self.conversation_history[session_id] = {
            "messages": [],
            "context": {},
            "started_at": datetime.now().isoformat()
        }
        
        return session_id
    
    def chat(
        self,
        user_message: str,
        session_id: str = "default",
        document_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Process a user message in conversational context.
        
        Args:
            user_message: User's question or statement
            session_id: Conversation session identifier
            document_context: Optional document being analyzed
            
        Returns:
            Response with answer, context, and suggestions
        """
        # Ensure session exists
        if session_id not in self.conversation_history:
            self.start_session(session_id)
        
        session = self.conversation_history[session_id]
        
        # Add user message to history
        session["messages"].append({
            "role": "user",
            "content": user_message,
            "timestamp": datetime.now().isoformat()
        })
        
        # Update document context if provided
        if document_context:
            session["context"].update(document_context)
        
        # Analyze user intent
        intent = self._analyze_intent(user_message, session)
        
        # Generate response based on intent
        response = self._generate_response(
            user_message,
            intent,
            session,
            document_context
        )
        
        # Add assistant response to history
        session["messages"].append({
            "role": "assistant",
            "content": response["answer"],
            "timestamp": datetime.now().isoformat(),
            "intent": intent
        })
        
        # Trim history if too long
        if len(session["messages"]) > self.max_history * 2:
            session["messages"] = session["messages"][-self.max_history * 2:]
        
        return response
    
    def _analyze_intent(self, message: str, session: Dict) -> str:
        """
        Analyze user intent from message.
        
        Intents:
        - compliance_check: Check if clause is compliant
        - regulation_lookup: Find specific regulations
        - risk_assessment: Assess risks
        - clarification: Ask for more details
        - general_question: General compliance question
        """
        message_lower = message.lower()
        
        if any(word in message_lower for word in ["compliant", "comply", "violation", "violate"]):
            return "compliance_check"
        elif any(word in message_lower for word in ["regulation", "rule", "sebi", "provision"]):
            return "regulation_lookup"
        elif any(word in message_lower for word in ["risk", "danger", "consequence", "penalty"]):
            return "risk_assessment"
        elif any(word in message_lower for word in ["what", "why", "how", "explain", "clarify"]):
            return "clarification"
        else:
            return "general_question"
    
    def _generate_response(
        self,
        message: str,
        intent: str,
        session: Dict,
        document_context: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Generate contextual response based on intent."""
        
        response = {
            "answer": "",
            "intent": intent,
            "suggestions": [],
            "retrieved_regulations": [],
            "confidence": 0.0
        }
        
        # Use Elastic hybrid search to find relevant regulations
        if self.retriever and intent in ["compliance_check", "regulation_lookup", "risk_assessment"]:
            # Create a pseudo-clause for retrieval
            pseudo_clause = {
                "text_en": message,
                "id": f"query_{datetime.now().timestamp()}"
            }
            
            try:
                retrieval_results = self.retriever.retrieve_similar_rules(
                    [pseudo_clause],
                    top_k=3
                )
                
                if retrieval_results and len(retrieval_results) > 0:
                    response["retrieved_regulations"] = retrieval_results[0].get("matches", [])
            except Exception as e:
                print(f"⚠️ Retrieval error: {e}")
        
        # Use LLM for intelligent response generation
        if self.llm_verifier:
            try:
                # Build context from conversation history
                chat_history = [
                    {"role": msg["role"], "content": msg["content"]}
                    for msg in session["messages"][-6:]  # Last 3 exchanges
                ]
                
                # Generate response using Vertex AI chat
                if hasattr(self.llm_verifier, 'chat'):
                    llm_response = self.llm_verifier.chat(
                        self._build_contextual_prompt(message, intent, response["retrieved_regulations"], document_context),
                        session_id=session.get("session_id", "default")
                    )
                    response["answer"] = llm_response
                    response["confidence"] = 0.9
                else:
                    response["answer"] = self._fallback_response(message, intent, response["retrieved_regulations"])
                    response["confidence"] = 0.6
                    
            except Exception as e:
                print(f"⚠️ LLM error: {e}")
                response["answer"] = self._fallback_response(message, intent, response["retrieved_regulations"])
                response["confidence"] = 0.5
        else:
            response["answer"] = self._fallback_response(message, intent, response["retrieved_regulations"])
            response["confidence"] = 0.5
        
        # Add helpful suggestions
        response["suggestions"] = self._generate_suggestions(intent, document_context)
        
        return response
    
    def _build_contextual_prompt(
        self,
        message: str,
        intent: str,
        regulations: List[Dict],
        document_context: Optional[Dict]
    ) -> str:
        """Build a contextual prompt for the LLM."""
        
        prompt = f"""You are a helpful SEBI compliance assistant. 

User Intent: {intent}
User Question: {message}

"""
        
        if regulations:
            prompt += "\nRelevant SEBI Regulations (from Elastic Search):\n"
            for i, reg in enumerate(regulations[:3], 1):
                prompt += f"{i}. {reg.get('rule_text', 'N/A')}\n"
        
        if document_context:
            prompt += f"\nDocument Context: {document_context.get('name', 'Current document')}\n"
        
        prompt += """
Provide a clear, helpful response to the user's question. Include:
1. Direct answer to their question
2. Relevant regulatory references
3. Practical guidance
4. Any important warnings or considerations

Keep the response conversational and easy to understand."""

        return prompt
    
    def _fallback_response(
        self,
        message: str,
        intent: str,
        regulations: List[Dict]
    ) -> str:
        """Generate fallback response when LLM is unavailable."""
        
        if intent == "compliance_check":
            if regulations:
                return f"Based on SEBI regulations, here are relevant provisions:\n\n" + \
                       "\n\n".join([f"• {reg.get('rule_text', 'N/A')}" for reg in regulations[:2]]) + \
                       "\n\nI recommend reviewing these regulations against your specific clause."
            else:
                return "I couldn't find directly relevant regulations. Could you provide more specific details about the clause?"
        
        elif intent == "regulation_lookup":
            if regulations:
                return f"Here are the relevant SEBI regulations:\n\n" + \
                       "\n\n".join([f"{i+1}. {reg.get('rule_text', 'N/A')}" for i, reg in enumerate(regulations[:3])])
            else:
                return "I couldn't find specific regulations matching your query. Try rephrasing or being more specific."
        
        elif intent == "risk_assessment":
            return "Risk assessment requires detailed analysis. Please upload the document for comprehensive risk evaluation."
        
        else:
            return "I'm here to help with SEBI compliance questions. You can ask about:\n" + \
                   "• Specific regulations\n• Compliance verification\n• Risk assessment\n• Regulatory requirements"
    
    def _generate_suggestions(self, intent: str, document_context: Optional[Dict]) -> List[str]:
        """Generate helpful follow-up suggestions."""
        
        suggestions = []
        
        if intent == "compliance_check":
            suggestions = [
                "Would you like a detailed risk assessment?",
                "Should I check for related regulations?",
                "Do you want recommendations for compliance?"
            ]
        elif intent == "regulation_lookup":
            suggestions = [
                "Would you like to verify a clause against these regulations?",
                "Should I explain any specific regulation in detail?",
                "Do you need the official SEBI circular references?"
            ]
        elif intent == "risk_assessment":
            suggestions = [
                "Would you like mitigation strategies?",
                "Should I identify affected stakeholders?",
                "Do you need a compliance timeline?"
            ]
        else:
            suggestions = [
                "Would you like to upload a document for analysis?",
                "Do you have a specific clause to verify?",
                "Should I explain SEBI compliance requirements?"
            ]
        
        return suggestions
    
    def get_conversation_summary(self, session_id: str) -> Dict[str, Any]:
        """Get summary of conversation session."""
        
        if session_id not in self.conversation_history:
            return {"error": "Session not found"}
        
        session = self.conversation_history[session_id]
        
        return {
            "session_id": session_id,
            "started_at": session.get("started_at"),
            "message_count": len(session["messages"]),
            "intents_discussed": list(set([
                msg.get("intent", "unknown")
                for msg in session["messages"]
                if msg["role"] == "assistant"
            ])),
            "context": session.get("context", {})
        }
    
    def clear_session(self, session_id: str):
        """Clear a conversation session."""
        if session_id in self.conversation_history:
            del self.conversation_history[session_id]
            
            # Also clear LLM chat session if available
            if self.llm_verifier and hasattr(self.llm_verifier, 'clear_session'):
                self.llm_verifier.clear_session(session_id)

