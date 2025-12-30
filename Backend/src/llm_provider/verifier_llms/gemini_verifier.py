"""
Gemini Verifier

This module provides functionality to verify compliance using the Gemini LLM.
"""

from src.llm_provider.safe_json_helper import safe_json_response
import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()

def verify_with_gemini(system_prompt: str, user_prompt: str) -> dict:
    """
    Verify compliance using the Gemini LLM.
    Args:
        system_prompt (str): The system prompt to guide the LLM.
        user_prompt (str): The user prompt containing the query.
    Returns:
        dict: The verification result from the LLM.
    """
    genai.configure(api_key=os.getenv("GEMINI_API_KEY_2"))
    model = genai.GenerativeModel("gemini-3-pro-preview")
    response = model.generate_content(system_prompt + "\n" + user_prompt)
    raw = response.text
    return safe_json_response(raw)
