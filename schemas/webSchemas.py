from pydantic import BaseModel

class PredictRequest(BaseModel):
    model:    str          # "svm" | "random_forest"
    features: list[float]  # 7 valores numéricos

class PredictResponse(BaseModel):
    model:       str
    prediction:  int | str
    probability: list[float] | None = None