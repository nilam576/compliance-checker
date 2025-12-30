import os
import google.generativeai as genai
from dotenv import load_dotenv
from sympy import re

load_dotenv()

# Configure API keys
API = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=API)

def return_api_key():
    print(API)

def summarize_with_gemini(text: str, lang: str) -> str:
    try:
        model = genai.GenerativeModel("gemini-3-pro-preview")
        prompt = f"""
        You are an advanced text analysis system. Your task is to carefully read and process the following text, 
        then produce a comprehensive, structured output in JSON format.

        Your responsibilities:
        1. **Summarization**: Create a detailed and cohesive summary that preserves all key facts, events, and context. 
           - The summary must not be overly brief. 
           - Avoid redundancy and filler. 
           - Ensure clarity, flow, and readability in {lang}.

        2. **Timelines**: Extract chronological events and represent them as structured timeline entries. 
           - Each timeline entry must include a start, an end (if applicable), and a description. 
           - If exact dates are unavailable, use approximate references (e.g., "early 2000s", "ancient period"). 
           - Maintain chronological order. 
           - If no timelines are present, return an empty object {{}}.

        3. **Clauses**: Identify distinct clauses, rules, or provisions in the text. 
           - Each clause should have a unique `"clause_id"` in the format `"C-1"`, `"C-2"`, etc.
           - Provide the extracted clause text in English under `"text_en"`. 
           - Ensure clauses are semantically meaningful and not just random sentence splits. 
           - If no clauses exist, return an empty list [].

        ---

        ### Input Text:
        {text}

        ---

        ### Output JSON Schema (strictly follow this structure):
        {{
            "summary": "A detailed summary of the text, covering all major points, facts, and context in a cohesive narrative.",
            "Timelines": {{
                "timeline1": {{
                    "start": "Exact or approximate start date",
                    "end": "Exact or approximate end date or null",
                    "description": "Explanation of events in this period"
                }},
                "timeline2": {{
                    "start": "...",
                    "end": "...",
                    "description": "..."
                }}
            }},
            "Clauses": [
                {{
                    "clause_id": "C-1",
                    "text_en": "..."
                }},
                {{
                    "clause_id": "C-2",
                    "text_en": "..."
                }}
            ] #Limit to 8 clauses
        }}

        ---

        ### Guidelines:
        - Follow the JSON schema strictly.
        - Don't give it as a markdown return it as a json.
        - Always provide a `"summary"` field.
        - Ensure JSON is **valid and parsable** (no trailing commas, properly quoted strings).
        - If timelines or clauses are missing, return `"Timelines": {{}}` or `"Clauses": []` respectively.
        - The `"summary"` must be at least 3–4 well-structured paragraphs, not a single abstract line.
        - Use consistent naming for `"clause_id"` in sequential order.
        - Do not add extra keys or fields outside the specified schema.
        """
        response = model.generate_content(prompt, generation_config={"temperature": 0.1})
        return response.text.strip()
    
    except Exception as e:
        print(f"[ERROR] Gemini summarization failed: {e}")
        return None

# def summarize_with_openai(text: str) -> str:
#     try:
#         response = openai.ChatCompletion.create(
#             model="gpt-4o-mini",
#             messages=[{"role": "system", "content": "You are a summarizer."},
#                      {"role": "user", "content": f"Summarize:\n{text}"}]
#         )
#         return response["choices"][0]["message"]["content"].strip()
#     except Exception as e:
#         print(f"[ERROR] OpenAI summarization failed: {e}")
#         return None

def generate_summary(text: str, lang: str) -> str:
    # Try Gemini first
    summary = summarize_with_gemini(text, lang)
    if summary:
        return summary
    
    # Fallback to OpenAI
    # if os.getenv("OPENAI_API_KEY"):
    #     summary = summarize_with_openai(text)
    #     if summary:
    #         return summary
    
    # Fallback: Return a minimal valid JSON structure
    print("[FALLBACK] Using fallback summary structure")
    import json
    fallback_summary = {
        "summary": f"Document contains {len(text.split())} words. Analysis could not be completed automatically. Please review manually.",
        "Timelines": {},
        "Clauses": [
            {
                "clause_id": "C-1",
                "text_en": "Full document text requires manual review"
            }
        ]
    }
    return json.dumps(fallback_summary)
