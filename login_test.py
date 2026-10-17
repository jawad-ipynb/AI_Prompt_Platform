import requests

url = "http://127.0.0.1:5000/api/login"

data = {
    "email": "jawad@szabist.edu",
    "password": "123456"
}

response = requests.post(url, json=data)

print(response.status_code)
print(response.json())