import librosa
import numpy as np

# Set the target sound file path
target_sound_file = "slurp.wav"

# Load the target sound file
target_audio, sr = librosa.load(target_sound_file, sr=None, mono=True)

# Set the threshold for sound detection
threshold = 0.8  # Adjust this value based on your requirements

# Load the input sound file for detection
input_sound_file = "input-slurp-1.wav"

# Load the input sound file
input_audio, sr = librosa.load(input_sound_file, sr=None, mono=True)

# Perform cross-correlation
cross_correlation = np.correlate(input_audio, target_audio, mode='valid')

# Find the maximum correlation value and its corresponding index
max_corr_value = np.max(cross_correlation)
max_corr_index = np.argmax(cross_correlation)

# Calculate the time corresponding to the maximum correlation index
max_corr_time = librosa.samples_to_time(max_corr_index, sr=sr)

# Check if the maximum correlation value exceeds the threshold
if max_corr_value > threshold:
    print("Slurp sound detected!")
    print("Maximum correlation value:", max_corr_value)
    print("Time of detection:", max_corr_time, "seconds")
else:
    print("Slurp sound not detected.")
