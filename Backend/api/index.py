import os
import sys
from pathlib import Path

# Add the Backend directory to the path for imports
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))
sys.path.insert(0, str(backend_dir / 'src'))

print(f"🔧 Python version: {sys.version}")
print(f"📁 Working directory: {os.getcwd()}")
print(f"🔧 Environment: {os.getenv('ENVIRONMENT', 'not_set')}")
print(f"🔧 PYTHONPATH: {os.getenv('PYTHONPATH', 'not_set')}")

try:
    print("📦 Importing FastAPI app...")
    from src.pipeline.run_pipeline import app
    print("✅ Successfully imported FastAPI app")
except ImportError as e:
    print(f"❌ Import error: {e}")
    print(f"❌ Python path: {sys.path}")
    # Create a minimal app for debugging
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware

    app = FastAPI(
        title="SEBI Compliance API - Debug Mode",
        description="Minimal FastAPI app for debugging Vercel deployment"
    )

    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/")
    async def root():
        return {
            "message": "SEBI Compliance API - Debug Mode",
            "status": "minimal_app",
            "error": str(e),
            "python_version": sys.version,
            "working_directory": os.getcwd(),
            "environment": os.getenv('ENVIRONMENT', 'not_set')
        }

    @app.get("/health")
    async def health():
        return {
            "status": "minimal",
            "message": "Debug mode active",
            "error": str(e),
            "timestamp": "2025-01-01T00:00:00Z"
        }

    @app.get("/debug")
    async def debug():
        return {
            "status": "debug_info",
            "python_version": sys.version,
            "working_directory": os.getcwd(),
            "python_path": sys.path,
            "environment_vars": dict(os.environ),
            "import_error": str(e)
        }

# Export the FastAPI app for Vercel
print("🚀 FastAPI app ready for Vercel deployment")
