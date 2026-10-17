import requests

url = "http://127.0.0.1:5000/api/predict"   # FIXED

data = {
    "text": "write python code for calculator"
}

response = requests.post(url, json=data)

print("Status:", response.status_code)
print("Response:", response.text)