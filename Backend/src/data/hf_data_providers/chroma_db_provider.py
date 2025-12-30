"""
Chroma DB Provider

This module provides an interface to interact with a Chroma DB vector database
stored in Hugging Face.
"""

from dotenv import load_dotenv
from huggingface_hub import snapshot_download
import os

# Load environment variables
load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN")

class ChromaDBProvider:
    def load_vec_db() -> str:
        """
        This function loads the vector database from Hugging Face.
        Args:
            None
        Returns:
            str: The local directory path of the downloaded vector database.
        """
        local_dir = snapshot_download(
            repo_id="SuriyaSureshkumar/sebi-clauses",
            repo_type="dataset",
        token=HF_TOKEN
        )

        return local_dir
        