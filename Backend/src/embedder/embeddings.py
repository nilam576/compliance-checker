from transformers import AutoTokenizer, AutoModel
import torch
import numpy as np
import warnings

class EmbeddingModel:
    def __init__(self, model_name="nlpaueb/legal-bert-base-uncased"):
        try:
            # Suppress the torch.load warning
            with warnings.catch_warnings():
                warnings.filterwarnings("ignore", message=".*torch.load.*")
                self.tokenizer = AutoTokenizer.from_pretrained(model_name, local_files_only=False)
                self.model = AutoModel.from_pretrained(model_name, local_files_only=False)
        except Exception as e:
            print(f"Warning: Could not load embedding model: {e}")
            # Fallback to a simpler model or raise error
            raise RuntimeError(f"Failed to load embedding model: {e}")

    def encode(self, texts: list[str]) -> np.ndarray:
        """Generate embeddings for a list of texts using LegalBERT."""
        inputs = self.tokenizer(
            texts,
            padding=True,
            truncation=True,
            return_tensors="pt",
            max_length=512
        )

        with torch.no_grad():
            outputs = self.model(**inputs)
            # Mean pooling
            embeddings = outputs.last_hidden_state.mean(dim=1)

        return embeddings.cpu().numpy().astype("float32")
