import time
import uuid

import requests

from qa_config import BASE_URL

# ★ 每次运行都生成一个唯一用户名（时间戳 + 随机数，双保险）
username = f"tester_py_{int(time.time())}_{uuid.uuid4().hex[:6]}"

payload = {
    "username": username,
    "password": "Tester@2026",
    "password_confirm": "Tester@2026",
    "email": f"{username}@example.com",
}

r = requests.post(f"{BASE_URL}/api/auth/register/", json=payload)

print("username:", username)
print("status  :", r.status_code)
print("body    :", r.json())

assert r.status_code == 201, f"expect 201, got {r.status_code}"
assert r.json()["user"]["username"] == username

print("PASS")