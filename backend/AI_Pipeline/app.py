import streamlit as st
import numpy as np
import pandas as pd

from sklearn.linear_model import LinearRegression

# -------------------------------
# STEP 1: Create Dummy Dataset
# -------------------------------
data = {
    "area": [1000, 1500, 2000, 2500, 3000],
    "bedrooms": [2, 3, 3, 4, 5],
    "bathrooms": [1, 2, 2, 3, 4],
    "floors": [1, 2, 2, 2, 3],
    "age": [10, 5, 3, 2, 1],
    "price": [50, 75, 100, 150, 200]  # in lakhs
}

df = pd.DataFrame(data)

X = df.drop("price", axis=1)
y = df["price"]

# -------------------------------
# STEP 2: Train Model
# -------------------------------
model = LinearRegression()
model.fit(X, y)

# -------------------------------
# STEP 3: Streamlit UI
# -------------------------------
st.title("House Price Prediction App")

st.write("Enter house details to predict House price")

# Inputs
area = st.number_input("Area (sq ft)", 500, 5000, 1000)
bedrooms = st.number_input("Bedrooms", 1, 10, 2)
bathrooms = st.number_input("Bathrooms", 1, 10, 1)
floors = st.number_input("Floors", 1, 5, 1)
age = st.number_input("Age of House (years)", 0, 50, 5)

# -------------------------------
# STEP 4: Prediction
# -------------------------------
if st.button("Predict Price"):
    input_data = np.array([[area, bedrooms, bathrooms, floors, age]])
    prediction = model.predict(input_data)

    st.success(f"Estimated House Price: ₹ {prediction[0]:.2f} Lakhs")
