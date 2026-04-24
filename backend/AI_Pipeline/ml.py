# sentiment_dict.py

import re

# ----------------------------
# 1. Sentiment Dictionary
# ----------------------------
positive_words = {
    "good", "great", "awesome", "excellent", "amazing",
    "happy", "love", "nice", "fantastic", "best", "positive", "enjoy", "wonderful", "delightful", "pleased", "satisfied","liked"
}

negative_words = {
    "bad", "worst", "terrible", "awful", "hate",
    "poor", "sad", "disappointed", "negative", "boring", "unhappy", "hate", "bad", "terrible"
}

# ----------------------------
# 2. Text Preprocessing
# ----------------------------
def clean_text(text):
    text = text.lower()
    text = re.sub(r"[^a-z\s]", "", text)
    return text.split()   # tokenization

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

    # Decision Logic
    if pos_count > neg_count:
        return "Positive 😊"
    elif neg_count > pos_count:
        return "Negative 😡"
    else:
        return "Neutral 😐"

# ----------------------------
# 4. Testing Loop
# ----------------------------
if __name__ == "__main__":
    print("=== Dictionary-Based Sentiment Analysis ===")

    while True:
        user_input = input("\nEnter text (or type 'exit'): ")

        if user_input.lower() == "exit":
            break

        result = predict_sentiment(user_input)
        print("Sentiment:", result)