"""
Mistral Verifier

This module provides functionality to verify compliance using the Mistral LLM.
"""

from src.llm_provider.safe_json_helper import safe_json_response
from mistralai.client import MistralClient
import os
from dotenv import load_dotenv

load_dotenv()

def verify_with_mistral(system_prompt: str, user_prompt: str) -> dict:
    """
    Verify compliance using the Mistral LLM.
    Args:
        system_prompt (str): The system prompt to guide the LLM.
        user_prompt (str): The user prompt containing the query.
    Returns:
        dict: The verification result from the LLM.
    """
    llm_client = MistralClient(api_key=os.getenv("MISTRAL_API_KEY"))

    response = llm_client.chat(
        model="mistral-large",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt + "\nReturn ONLY valid JSON."}
        ]
    )
    raw = response["choices"][0]["message"]["content"]
    return safe_json_response(raw)
