import streamlit as st
import re

# ----------------------------
# 1. Sentiment Dictionary
# ----------------------------
positive_words = {
    "good", "great", "awesome", "excellent", "amazing",
    "happy", "love", "nice", "fantastic", "best",
    "positive", "enjoy", "wonderful", "delightful",
    "pleased", "satisfied", "liked"
}

negative_words = {
    "bad", "worst", "terrible", "awful", "hate",
    "poor", "sad", "disappointed", "negative",
    "boring", "unhappy"
}

# ----------------------------
# 2. Text Preprocessing
# ----------------------------
def clean_text(text):
    text = text.lower()
    text = re.sub(r"[^a-z\s]", "", text)
    return text.split()

# ----------------------------
# 3. Prediction Function
# ----------------------------
def predict_sentiment(text):
    words = clean_text(text)

    pos_count = 0
    neg_count = 0

    for word in words:
        if word in positive_words:
            pos_count += 1
        elif word in negative_words:
            neg_count += 1

    if pos_count > neg_count:
        return "Positive 😊"
    elif neg_count > pos_count:
        return "Negative 😡"
    else:
        return "Neutral 😐"

# ----------------------------
# 4. Streamlit UI
# ----------------------------
st.set_page_config(page_title="Sentiment Analyzer", layout="centered")

st.title("💬 Sentiment Analysis App")
st.write("Enter a sentence to analyze its sentiment (Dictionary-Based)")

user_input = st.text_area("Enter your text here:")

if st.button("Analyze Sentiment"):
    if user_input.strip() == "":
        st.warning("Please enter some text!")
    else:
        result = predict_sentiment(user_input)

        if "Positive" in result:
            st.success(result)
        elif "Negative" in result:
            st.error(result)
        else:
            st.info(result)