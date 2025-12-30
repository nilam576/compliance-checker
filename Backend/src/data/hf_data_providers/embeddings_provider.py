"""
Embeddings Provider

This module provides an interface to interact with the 
embeddings stored in Hugging Face.
"""

import os
from huggingface_hub import hf_hub_download
from dotenv import load_dotenv
import numpy as np

load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN")

def load_embeddings() -> np.ndarray:
    emb_path = hf_hub_download(
        repo_id="SuriyaSureshkumar/sebi-clauses",
        filename="embeddings.npy",
        repo_type="dataset",
        token=HF_TOKEN
    )

    embeddings = np.load(emb_path)
    return embeddings