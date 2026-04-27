import requests
import pandas as pd
import pickle
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.linear_model import LinearRegression


# ----------------------------
# 1. Config
# ----------------------------
API_URL = "http://127.0.0.1:8000/ai/export-data"
TOKEN = "YOUR_TOKEN"
MODEL_PATH = "salary_model.pkl"


# ----------------------------
# 2. Fetch Data from API
# ----------------------------
def fetch_data():
    headers = {
        "Authorization": f"Bearer {TOKEN}"
    }

    try:
        response = requests.get(API_URL, headers=headers)
        response.raise_for_status()  # Raises error for bad status
        data = response.json()

        if not data:
            raise ValueError("⚠️ No data received from API")

        return pd.DataFrame(data)

    except Exception as e:
        print(f"❌ Error fetching data: {e}")
        return None


# ----------------------------
# 3. Train Model
# ----------------------------
def train_model(df):
    try:
        X = df[["location", "position"]]
        y = df["salary"]

        pipeline = Pipeline([
            ("preprocess", ColumnTransformer([
                ("cat", OneHotEncoder(handle_unknown="ignore"),
                 ["location", "position"])
            ])),
            ("model", LinearRegression())
        ])

        pipeline.fit(X, y)
        return pipeline

    except Exception as e:
        print(f"❌ Error training model: {e}")
        return None


# ----------------------------
# 4. Save Model
# ----------------------------
def save_model(model):
    try:
        with open(MODEL_PATH, "wb") as f:
            pickle.dump(model, f)
        print("✅ Model saved successfully!")

    except Exception as e:
        print(f"❌ Error saving model: {e}")


# ----------------------------
# 5. Main Execution
# ----------------------------
if __name__ == "__main__":
    df = fetch_data()

    if df is not None:
        model = train_model(df)

        if model:
            save_model(model)
            print("🎯 Model trained from API data successfully!")