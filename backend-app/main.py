# from flask import Flask, request, jsonify
# import librosa
# import numpy as np
# import scipy.signal as signal

# app = Flask(__name__)
# PORT = 8000

# # Set the target sound file path
# target_sound_file = "slurp.wav"

# # Load the target sound file
# target_audio, sr = librosa.load(target_sound_file, sr=None, mono=True)

# # Calculate the spectrogram of the target sound
# _, _, target_spectrogram = signal.spectrogram(
#     target_audio, fs=sr, window="hann", nperseg=512, noverlap=256, mode="magnitude"
# )

# # Set the threshold for sound detection
# threshold = 0.8  # Adjust this value based on your requirements

# # Route to handle the voice identification request
# @app.route('/identify_voice', methods=['POST'])
# def identify_voice():
#     # Get the uploaded audio file
#     audio_file = request.files['audio']
#     audio_file.save('recorded.wav')

#     # Load the recorded audio
#     recorded_audio, sr = librosa.load('recorded.wav', sr=None, mono=True)

#     # Calculate the spectrogram of the recorded audio
#     _, _, spectrogram = signal.spectrogram(
#         recorded_audio, fs=sr, window="hann", nperseg=512, noverlap=256, mode="magnitude"
#     )

#     # Calculate the cross-correlation between the recorded audio and the target sound
#     cross_correlation = signal.correlate2d(
#         spectrogram, target_spectrogram, boundary="symm", mode="same"
#     )

#     # Find the maximum correlation value and its corresponding frequency
#     max_corr_value = np.max(cross_correlation)
#     max_corr_index = np.unravel_index(np.argmax(cross_correlation), cross_correlation.shape)
#     max_corr_frequency = max_corr_index[1] * (sr / 2) / cross_correlation.shape[1]

#     # Prepare the response
#     response = {
#         'detected': max_corr_value > threshold,
#         'frequency': max_corr_frequency
#     }

#     return jsonify(response)

# if __name__ == '__main__':
#     print(f"Server running on port {PORT}",)
#     app.run(port=PORT)


from flask import Flask, request, jsonify
import librosa
import numpy as np
from flask_cors import CORS

PORT = 8000

app = Flask(__name__)
CORS(app)

app.config['MAX_CONTENT_LENGTH'] = 160 * 1024 * 1024  # 16MB (adjust as needed)
print(app.config)

# Set the target sound file path
target_sound_file = "slurp.wav"

# Load the target sound file
target_audio, sr = librosa.load(target_sound_file, sr=None, mono=True)

# Set the threshold for sound detection
threshold = 0.8  # Adjust this value based on your requirements

# Route to handle the voice identification request
@app.route('/identify_voice', methods=['POST'])
def identify_voice():
    print("request.file", request.files)
    # Get the uploaded audio file
    audio_file = request.files['audio']
    # audio_file.content_type("audio/wave")
    audio_file.save('input.wav')

    # Load the input sound file
    input_audio, sr = librosa.load('input.wav', sr=None, mono=True)

    # Perform cross-correlation
    cross_correlation = np.correlate(input_audio, target_audio, mode='valid')

    # Find the maximum correlation value and its corresponding index
    max_corr_value = np.max(cross_correlation)
    max_corr_index = np.argmax(cross_correlation)

    # Calculate the time corresponding to the maximum correlation index
    max_corr_time = librosa.samples_to_time(max_corr_index, sr=sr)
    # max_corr_time = float(max_corr_time)  # Convert to Python float

    # Prepare the response
    response = {
        'detected': str(max_corr_value > threshold),
        'correlation_value': str(max_corr_value),
        'detection_time': str(max_corr_time)
    }

    print(response)

    return jsonify(response)

if __name__ == '__main__':
    print(f"Server running on port {PORT}",)
    app.run(port=PORT)
