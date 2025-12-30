"""
Claude Verifier

This module provides functionality to verify compliance using the Claude LLM.
"""

from src.llm_provider.safe_json_helper import safe_json_response
from anthropic import Anthropic
import os
from dotenv import load_dotenv

load_dotenv() 

def verify_with_claude(system_prompt: str, user_prompt: str) -> dict:
    """
    Verify compliance using the Claude LLM.
    Args:
        system_prompt (str): The system prompt to guide the LLM.
        user_prompt (str): The user prompt containing the query.
    Returns:
        dict: The verification result from the LLM.
    """
    llm_client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

    response = llm_client.messages.create(
        model="claude-3-opus-20240229",
        max_tokens=1000,
        system=system_prompt,
        messages=[{"role": "user", "content": user_prompt}]
    )
    raw = response.content[0].text
    return safe_json_response(raw)
