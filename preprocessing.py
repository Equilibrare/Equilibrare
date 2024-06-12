import sys
import json
import re
import numpy as np
import pandas as pd
import tensorflow as tf
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from tensorflow.keras.preprocessing.sequence import pad_sequences

# Redirect TensorFlow logs to stderr
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
tf.get_logger().setLevel('ERROR')

# Load data formal dan slang dari file CSV
csv_path = "colloquial-indonesian-lexicon.csv"
data = pd.read_csv(csv_path)

# Buat kamus untuk penggantian slang
slang_dict = dict(zip(data['slang'], data['formal']))

# Inisialisasi proses preprocessing
lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('indonesian'))

def clean_text(text):
    text = text.lower()
    text = re.sub(r'http\S+', '', text)
    text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def replace_slang(text):
    tokens = word_tokenize(text)
    tokens = [slang_dict[token] if token in slang_dict else token for token in tokens]
    return ' '.join(tokens)

def preprocess_text(text, tokenizer, max_length, padding_type, trunc_type):
    replaced_text = replace_slang(text)
    cleaned_text = clean_text(replaced_text)
    sequences = tokenizer.texts_to_sequences([cleaned_text])
    padded = pad_sequences(sequences, maxlen=max_length, padding=padding_type, truncating=trunc_type)
    return padded

def predict_anxiety(input_text, model, tokenizer, max_length, padding_type, trunc_type, threshold=0.5):
    try:
        preprocessed_text = preprocess_text(input_text, tokenizer, max_length, padding_type, trunc_type)
        if model is not None:
            prediction = model.predict(preprocessed_text)[0][0]
            prediction = float(prediction)
            result = 'Terdeteksi Anxiety' if prediction > threshold else 'Normal'
            return prediction, result
        else:
            return None, None
    except Exception as e:
        return None, None

if __name__ == '__main__':
    try:
        input_text = sys.argv[1]

        # Load model
        model_path = 'modelbanget.h5'
        model = tf.keras.models.load_model(model_path)
        
        # Load tokenizer
        tokenizer_path = 'tokenizer.json'
        tokenizer = tf.keras.preprocessing.text.tokenizer_from_json(open(tokenizer_path).read())

        # Set parameters for padding
        max_length = 50
        padding_type = 'post'
        trunc_type = 'post'

        prediction, result = predict_anxiety(input_text, model, tokenizer, max_length, padding_type, trunc_type)
        output = {
            "prediction_result": prediction,
            "result": result
        }
        print(json.dumps(output))
    except Exception as e:
        output = {
            "error": str(e)
        }
        print(json.dumps(output), file=sys.stderr)
