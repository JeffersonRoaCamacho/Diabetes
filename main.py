from routers import webRouter

from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI


# ── App ────────────────────────────────────────────────────────────────────────
app = FastAPI(title="Crop Classifier API")
app.include_router(webRouter.router)

# ── CORS ───────────────────────────────────────────────────────────────────────
# Mientras pruebas localmente puedes dejar el "*" o agregar "http://localhost:3000"
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "             ",
    ],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)