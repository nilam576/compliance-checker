"""
Compliance Agent

This agent uses all the agents under it to ensure compliance 
with regulatory requirements by analyzing and verifying relevant data.
"""

from src.compliance_checker.regulation_retriever import RegulationRetriever
from src.compliance_checker.llm_verifier import LLMVerifier
from src.compliance_checker.risk_explainer_agent import RiskExplainer

class ComplianceAgent:
    def __init__(self, llm_client: str ="gemini"):
        """
        Initialize the ComplianceAgent with the specified LLM client and vector database.
        """
        self.regulation_retriever = RegulationRetriever("faiss_index.bin", "metadata.pkl")
        self.llm_verifier = LLMVerifier(llm_client=llm_client)
        self.risk_explainer = RiskExplainer()

    def ensure_compliance(self, clauses):
        """
        Ensure compliance of the given clauses with regulatory requirements.
        Args:
            clauses: A list of legal clauses to verify.
        Returns:
            A dictionary containing verification results and risk explanations.
        """
        relevant_rules = self.regulation_retriever.retrieve_similar_rules(clauses)
        verification_results = self.llm_verifier.verify_clauses(relevant_rules)
        risk_explanations = self.risk_explainer.explain_all(verification_results)

        return {
            "verification_results": verification_results,
            "risk_explanations": risk_explanations
        }