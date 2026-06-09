import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import xgboost as xgb

class AnomalyDetector:
    def __init__(self):
        self.iso_forest = IsolationForest(contamination=0.05, random_state=42)
        self.scaler = StandardScaler()

    def build_features(self, prices: list[dict]) -> pd.DataFrame:
        df = pd.DataFrame(prices)
        if df.empty: return df
        df = df.sort_values("date")
        df["return"] = df["close"].pct_change()
        df["return_5d"] = df["close"].pct_change(5)
        df["volatility"] = df["return"].rolling(5).std()
        df["volume_change"] = df["volume"].pct_change()
        df["price_range"] = (df["high"] - df["low"]) / df["close"]
        df["ma_5"] = df["close"].rolling(5).mean()
        df["ma_20"] = df["close"].rolling(20).mean()
        df["ma_ratio"] = df["ma_5"] / df["ma_20"]
        return df.dropna()

    def detect(self, prices: list[dict]) -> dict:
        df = self.build_features(prices)
        if df.empty:
            return {"anomalies_detected": 0, "anomaly_dates": [], "latest_score": 0, "is_currently_anomalous": False}
        features = ["return", "return_5d", "volatility", "volume_change",
                    "price_range", "ma_ratio"]
        X = df[features].values
        X_scaled = self.scaler.fit_transform(X)

        # Isolation Forest anomaly scores
        scores = self.iso_forest.fit_predict(X_scaled)
        df["anomaly"] = (scores == -1).astype(int)
        df["anomaly_score"] = -self.iso_forest.score_samples(X_scaled)

        anomalies = df[df["anomaly"] == 1][["date", "close", "return",
                                            "anomaly_score"]].to_dict("records")
        latest = df.iloc[-1]
        return {
            "anomalies_detected": len(anomalies),
            "anomaly_dates": anomalies,
            "latest_score": float(latest["anomaly_score"]),
            "is_currently_anomalous": bool(latest["anomaly"]),
            "latest_return": float(latest["return"]),
            "latest_volatility": float(latest["volatility"])
        }

detector = AnomalyDetector()  # Singleton
