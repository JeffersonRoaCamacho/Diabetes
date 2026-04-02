from schemas.webSchemas import PredictRequest, PredictResponse

from fastapi import APIRouter, HTTPException
from pathlib import Path
import pickle


router = APIRouter()

# ── Cargar Modelos ────────────────────────────────────────────────────────────────
MODELS_DIR = Path(__file__).parent.parent / "models"


def load_model(filename: str):
    path = MODELS_DIR / filename
    if not path.exists():
        raise FileNotFoundError(f"Modelo no encontrado: {path}")
    with open(path, "rb") as f:
        return pickle.load(f)


models = {
    "svm": load_model("SVMCosecha.pkl"),
    "random_forest": load_model("RFCosecha.pkl"),
}


@router.get("/")
async def health():
    return {"status": "Funciona!!!", "modelos": list(models.keys())}


@router.post("/predict", response_model=PredictResponse)
async def predict(req: PredictRequest):

    # Condicionales para el manejo de excepciones
    if req.model not in models:
        raise HTTPException(
            status_code=400,
            detail=f"Modelo '{req.model}' no disponible. Opciones: {list(models.keys())}",
        )

    if len(req.features) != 7:
        raise HTTPException(
            status_code=422,
            detail=f"Se esperan 7 características, se recibieron {len(req.features)}",
        )

    # Pasar el modelo elegido y los datos requeridos en el formulario
    clf = models[req.model]
    X = [req.features]
    # Almacenar la salida de la prediccion
    prediction = clf.predict(X)[0]

    probability = None
    if hasattr(clf, "predict_proba"):
        probability = clf.predict_proba(X)[0].tolist()

    return PredictResponse(
        model=req.model,
        prediction=prediction,
        probability=probability,
    )