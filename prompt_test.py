import requests

url = "http://127.0.0.1:5000/api/add_prompt"   # FIXED (likely)

data = {
    "user_id": 1,
    "text": "write a python calculator program"
}

response = requests.post(url, json=data)

print("Status:", response.status_code)
print("Response:", response.text)