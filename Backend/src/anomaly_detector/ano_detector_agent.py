from transformers import AutoTokenizer, AutoModel
import torch
import joblib
import numpy as np
import os

# Global variables for lazy loading
clf = None
tokenizer = None
model = None
MODEL_NAME = "nlpaueb/legal-bert-base-uncased"

def _load_models():
    """Lazy loading of models to avoid startup issues"""
    global clf, tokenizer, model
    
    if clf is None:
        try:
            clf_path = os.path.join(os.path.dirname(__file__), "..", "..", "isolation_forest.joblib")
            clf = joblib.load(clf_path)
        except Exception:
            # Fallback - create a dummy classifier
            from sklearn.ensemble import IsolationForest
            clf = IsolationForest(contamination=0.1, random_state=42)
    
    if tokenizer is None:
        try:
            tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        except Exception as e:
            print(f"Warning: Could not load tokenizer: {e}")
            return False
    
    if model is None:
        try:
            # Use trust_remote_code=False and safe loading
            model = AutoModel.from_pretrained(MODEL_NAME, trust_remote_code=False)
        except Exception as e:
            print(f"Warning: Could not load model: {e}")
            return False
    
    return True

# Assume clf is loaded globally (e.g., OneClassSVM, IsolationForest, etc.)
# clf = joblib.load("anomaly_detector.pkl")

def explain_clause(score, pred):
    score_val = float(score)
    pred_val = int(pred)

    if pred_val == -1:  # anomaly
        return f"Anomalous. Score={score_val:.3f}"
    else:
        return f"Normal. Score={score_val:.3f}"

def anomaly(text: str):
    """Run anomaly detection on a single clause string."""
    if not _load_models():
        return "Model loading failed", 1, 0.0
    
    try:
        inputs = tokenizer(
            text, return_tensors="pt",
            truncation=True, padding=True, max_length=512
        )

        with torch.no_grad():
            outputs = model(**inputs)
            embeddings = outputs.last_hidden_state.mean(dim=1).numpy()

        pred = clf.predict(embeddings)[0]
        score = clf.decision_function(embeddings)[0]
        explanation = explain_clause(score, pred)

        return explanation, pred, score
    except Exception as e:
        return f"Analysis failed: {str(e)}", 1, 0.0


def anomaly_detection_pipeline(clauses):
    """
    Process a list of clauses for anomaly detection.
    
    Args:
        clauses: List of dicts with clause_id and text_en
    
    Returns:
        List of dicts with anomaly analysis
    """
    results = []

    for clause in clauses:
        clause_id = clause.get("clause_id", "unknown")
        text = clause.get("text_en", "")

        if not text.strip():
            results.append({
                "clause_id": clause_id,
                "text": text,
                "anomaly_explanation": "Empty text - cannot analyze",
                "is_anomaly": False,
                "anomaly_score": 0.0
            })
            continue

        try:
            explanation, pred, score = anomaly(text)
            results.append({
                "clause_id": clause_id,
                "text": text,
                "anomaly_explanation": explanation,
                "is_anomaly": (pred == -1),
                "anomaly_score": float(score)
            })

        except Exception as e:
            results.append({
                "clause_id": clause_id,
                "text": text,
                "anomaly_explanation": f"Error during analysis: {str(e)}",
                "is_anomaly": False,
                "anomaly_score": 0.0
            })

    return results