import requests
import json

try:
    response = requests.get("http://127.0.0.1:8003/health", timeout=5)
    print("Status Code:", response.status_code)
    print("Response:", json.dumps(response.json(), indent=2))
except Exception as e:
    print("Error:", str(e))