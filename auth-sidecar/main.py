"""
MicroWorkouts Auth Sidecar
Minimal FastAPI app that mounts jgf-auth and exposes it over HTTP.
The Cloudflare Workers app proxies auth requests here and verifies JWTs locally.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from jgf_auth.routes.auth_route import router as auth_router
from jgf_auth.routes.workouts_route import router as workouts_router

app = FastAPI(title="MicroWorkouts Auth", version="1.0.0")

# Allow the Cloudflare Pages dev server (and production URL) to call this sidecar.
# In production, update ALLOWED_ORIGINS via environment variable or just list the CF Pages URL.
import os
_raw = os.getenv("ALLOWED_ORIGINS", "http://localhost:8788")
ALLOWED_ORIGINS = [o.strip() for o in _raw.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(workouts_router)


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}
