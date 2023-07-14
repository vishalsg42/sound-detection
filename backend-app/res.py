# from flask import Flask, request, jsonify

# response = {
#     'detected': True,
#     'correlation_value': 9.066479,
#     'detection_time': 4.909625
# }

# app = Flask(__name__)
# PORT = 8000

# @app.route('/identify_voice', methods=['POST'])
# def identify_voice():
#     response = {
#         'detected': True,
#         'correlation_value': 9.066479,
#         'detection_time': 4.909625
#     }
#     json_response = jsonify(response)
#     print(json_response)

# identify_voice()