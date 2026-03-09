"""ML Model Predictor — loads the trained XGBoost model and serves predictions.

Implements a singleton pattern so the model is loaded only once at startup,
keeping inference fast (~0.1ms per prediction).

Usage
-----
>>> from backend.ml.predictor import PhishingPredictor
>>> predictor = PhishingPredictor()
>>> probability = predictor.predict(featureVector)  # 0.0 – 1.0
>>> isPhishing = predictor.classify(featureVector)  # True / False
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from threading import Lock
from typing import Optional

import numpy as np
import xgboost as xgb

logger = logging.getLogger(__name__)

MODEL_DIR = Path(__file__).resolve().parent / "models"
MODEL_PATH = MODEL_DIR / "phishingModel.json"
METADATA_PATH = MODEL_DIR / "modelMetadata.json"

PHISHING_THRESHOLD = 0.5


class PhishingPredictor:
    """Singleton XGBoost predictor for phishing URL classification.

    Thread-safe: uses a lock for model loading. After initialisation
    the model is immutable and can be read from multiple threads
    without synchronisation.
    """

    _instance: Optional[PhishingPredictor] = None
    _lock: Lock = Lock()

    def __new__(cls) -> PhishingPredictor:
        """Return the singleton instance, creating it on first call."""
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    instance = super().__new__(cls)
                    instance._initialise()
                    cls._instance = instance
        return cls._instance

    def _initialise(self) -> None:
        """Load the model and metadata from disk."""
        self._model: Optional[xgb.XGBClassifier] = None
        self._featureNames: list[str] = []
        self._featureCount: int = 0
        self._isLoaded: bool = False

        if not MODEL_PATH.exists():
            logger.warning(
                "No trained model found at %s — predictor will use fallback scoring",
                MODEL_PATH,
            )
            return

        try:
            self._model = xgb.XGBClassifier()
            self._model.load_model(str(MODEL_PATH))

            if METADATA_PATH.exists():
                with open(METADATA_PATH, encoding="utf-8") as metaFile:
                    metadata = json.load(metaFile)
                self._featureNames = metadata.get("featureNames", [])
                self._featureCount = metadata.get("featureCount", 0)
            else:
                self._featureCount = 21

            self._isLoaded = True
            logger.info(
                "PhishingPredictor loaded: %d features, model=%s",
                self._featureCount,
                MODEL_PATH.name,
            )
        except Exception:
            logger.exception("Failed to load ML model")
            self._model = None
            self._isLoaded = False

    @property
    def isLoaded(self) -> bool:
        """Whether a trained model is available."""
        return self._isLoaded

    @property
    def featureNames(self) -> list[str]:
        """The canonical feature names the model expects."""
        return self._featureNames

    def predict(self, featureVector: np.ndarray) -> float:
        """Return the phishing probability for a single feature vector.

        Parameters
        ----------
        featureVector : np.ndarray
            Shape ``(n_features,)`` or ``(1, n_features)`` matching the
            model's expected feature set.

        Returns
        -------
        float
            Probability that the input is phishing (0.0 – 1.0).
            Returns 0.5 (uncertain) if no model is loaded.
        """
        if not self._isLoaded or self._model is None:
            return 0.5

        vector = np.asarray(featureVector, dtype=np.float64)
        if vector.ndim == 1:
            vector = vector.reshape(1, -1)

        probabilities = self._model.predict_proba(vector)
        return float(probabilities[0, 1])

    def classify(
        self,
        featureVector: np.ndarray,
        threshold: float = PHISHING_THRESHOLD,
    ) -> bool:
        """Return True if the feature vector is classified as phishing."""
        return self.predict(featureVector) >= threshold

    def predictWithDetails(
        self,
        featureVector: np.ndarray,
    ) -> dict:
        """Return probability, classification, and feature names.

        Useful for the API layer where full context is needed.
        """
        probability = self.predict(featureVector)
        return {
            "probability": probability,
            "isPhishing": probability >= PHISHING_THRESHOLD,
            "modelLoaded": self._isLoaded,
            "featureCount": self._featureCount,
        }
