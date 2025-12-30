"""
LLM Verification Agent

This agent verifies the compliance of clauses against regulations 
using a language model.
"""

import json
from src.llm_provider.verifier_llms import openai_verifier, gemini_verifier, claude_verifier, mistral_verifier

class LLMVerifier:
    def __init__(self, llm_client: str ='gemini'):
        """
        Initialize the LLMVerifier with a specific LLM client.
        """
        self.llm_client = llm_client

    def examine_clause(self, clause_obj: dict) -> dict:
        """
        This function examines a legal clause against regulatory rules.
        Args:
            clause_obj (dict): The clause object containing the clause text and metadata.

        Returns:
            dict: The verification result containing compliance status and matched rules.
        """

        # Construct system prompt
        system_prompt = """You are a compliance verification assistant.
        Compare the given clause against multiple candidate regulatory rules.
        You must:
        - Analyze each candidate rule carefully
        - Decide which (if any) rules actually apply
        - State whether the clause is compliant
        - Explain reasoning clearly

        Return JSON in format:
        {
          "clause": "...",
          "is_compliant": true/false,
          "matched_rules": [
              {
                "rule": "...", #Can be from your knowledge base
                "metadata": {...},
                "is_relevant": true/false,
                "reason": "..."
              }
          ],
          "final_reason": "Summary reasoning whether compliant or not",
          "Section": "Wealth/Banking/Insurance/Compliance"
        }
        """

        # Prepare candidate rules in a structured way
        candidate_rules = [
            {"rule": rule, "metadata": metadata}
            for rule, metadata in clause_obj["matches"]
        ]

        # Construct user prompt
        user_prompt = f"""
        Clause:
        {clause_obj['original_clause']}
        
        Candidate Rules:
        {json.dumps(candidate_rules, indent=2)}
        
        Check compliance. For each rule, mark whether it is relevant and why.
        Then decide overall if the clause is compliant.
        """

        # Call the appropriate verification function based on the LLM client
        if self.llm_client == "openai":
            return openai_verifier.verify_with_openai(system_prompt, user_prompt)
        elif self.llm_client == "gemini":
            return gemini_verifier.verify_with_gemini(system_prompt, user_prompt)
        elif self.llm_client == "mistral":
            return mistral_verifier.verify_with_mistral(system_prompt, user_prompt)
        elif self.llm_client == "claude":
            return claude_verifier.verify_with_claude(system_prompt, user_prompt)
        else:
            raise ValueError(f"Unsupported provider: {self.llm_client}")

    def verify_clauses(self, all_clause_objs: list[dict]) -> list[dict]:
        """
        This function verifies multiple legal clauses against regulatory rules.
        Args:
            all_clause_objs (list[dict]): A list of clause objects to verify.
        Returns:
            list[dict]: A list of verification results for each clause.
        """
        results = []
        for clause_obj in all_clause_objs:
            result = self.examine_clause(clause_obj)
            results.append(result)
        return results