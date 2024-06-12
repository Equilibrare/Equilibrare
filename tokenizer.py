from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
import pandas as pd
import json

# Langkah 1: Membaca Data CSV
data = pd.read_csv('resampled_data (4).csv')

data.dropna(subset=['clean', 'label'], inplace=True)
training_sentences = data['clean'].tolist()
tokenizer = Tokenizer(num_words=1000, oov_token="<OOV>")
tokenizer.fit_on_texts(training_sentences)

# Mengonversi kalimat dalam training_sentences menjadi urutan angka
training_sequences = tokenizer.texts_to_sequences(training_sentences)

# Padding pada urutan angka
max_length = 50  # Sesuaikan dengan panjang maksimal yang digunakan saat pelatihan model
padding_type = 'post'
trunc_type = 'post'
padded_training_sequences = pad_sequences(training_sequences, maxlen=max_length, padding=padding_type, truncating=trunc_type)

# Langkah 4: Menyimpan Tokenizer ke File JSON
padded_training_sequences_list = padded_training_sequences.tolist()
with open('tokenizer.json', 'w') as f:
    json.dump(padded_training_sequences_list, f)

print("Padded training sequences berhasil disimpan ke padded_training_sequences.json")
