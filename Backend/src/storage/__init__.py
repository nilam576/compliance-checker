"""
Storage utilities for the SEBI compliance system
"""

from .gcs_client import GCSClient, get_gcs_client

__all__ = ['GCSClient', 'get_gcs_client']