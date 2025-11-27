import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from starlette.middleware.sessions import SessionMiddleware
from authlib.integrations.starlette_client import OAuth
from app.config import settings
from app.api.v1.api import api_router
import logging

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add Session Middleware (MUST be before CORS for cookies to work)
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SESSION_SECRET,
    session_cookie="session",
    max_age=3600 * 24,  # 24 hours
    same_site="lax",
    https_only=False  # Set to True in production with HTTPS
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Configure OAuth with Authlib
oauth = OAuth()
oauth.register(
    name='appid',
    client_id=settings.IBM_CLIENT_ID,
    client_secret=settings.IBM_CLIENT_SECRET,
    server_metadata_url=settings.IBM_DISCOVERY_ENDPOINT,
    client_kwargs={
        'scope': 'openid email profile'
    }
)

# ===== IMPORTANT: Include API router BEFORE static files and catch-all =====
app.include_router(api_router, prefix=settings.API_V1_PREFIX)

@app.get("/")
async def root():
    return {
        "message": "Solution Offering API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# ===== Mount static files AFTER API routes =====
from fastapi.staticfiles import StaticFiles
app.mount("/static", StaticFiles(directory="frontend/build/static"), name="static")

# ===== Catch-all route MUST be last =====
@app.get("/{path_name:path}")
async def spa_fallback(path_name: str):
    # Extra safety: don't serve index.html for API routes
    if path_name.startswith("api/"):
        return {"error": "Not Found"}, 404
    
    index_path = os.path.join("frontend", "build", "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"error": "Frontend not found"}, 404

@app.on_event("startup")
async def startup_event():
    logger.info("=" * 80)
    logger.info("APPLICATION STARTING")
    logger.info(f"Frontend URL: {settings.FRONTEND_URL}")
    logger.info(f"Client ID: {settings.IBM_CLIENT_ID}")
    logger.info(f"Discovery Endpoint: {settings.IBM_DISCOVERY_ENDPOINT}")
    logger.info("=" * 80)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
