import requests

url = "http://127.0.0.1:5000/api/signup"   # FIXED (likely)

data = {
    "username": "jawad",
    "password": "1234"
}

response = requests.post(url, json=data)

print("Status:", response.status_code)
print("Response:", response.text)