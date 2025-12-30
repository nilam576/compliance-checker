"""
OpenAI Verifier

This module provides functionality to verify compliance using the OpenAI LLM.
"""

import json
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

def verify_with_openai(system_prompt: str, user_prompt: str) -> dict:
    """
    Verify compliance using the OpenAI LLM.
    Args:
        system_prompt (str): The system prompt to guide the LLM.
        user_prompt (str): The user prompt containing the query.
    Returns:
        dict: The verification result from the LLM.
    """
    llm_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    response = llm_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        response_format={"type": "json_object"}
    )
    return json.loads(response.choices[0].message.content)