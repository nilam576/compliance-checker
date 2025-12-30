import json
import re

def safe_json_response(text: str):
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Try to extract JSON-like substring
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            raw_json = match.group(0)
            # Escape invalid backslashes
            safe_json = re.sub(r'\\(?![\\/"bfnrtu])', r'\\\\', raw_json)
            return json.loads(safe_json)
        raise