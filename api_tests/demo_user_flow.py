"""
用户完整流程：注册 -> 登录 -> 带 token 查询当前用户
"""
import time
import uuid

import requests

from qa_config import BASE_URL

# ========== 第 1 步：注册一个全新的账号 ==========
username = f"tester_py_{int(time.time())}_{uuid.uuid4().hex[:6]}"
password = "Tester@2026"

reg = requests.post(f"{BASE_URL}/api/auth/register/", json={
    "username": username,
    "password": password,
    "password_confirm": password,
    "email": f"{username}@example.com",
})
print("[注册]", reg.status_code, reg.json())
assert reg.status_code == 201, f"注册失败: {reg.status_code}"

# ========== 第 2 步：用刚注册的账号登录 ==========
login = requests.post(f"{BASE_URL}/api/auth/login/", json={
    "username": username,
    "password": password,
})
print("[登录]", login.status_code, login.json())
assert login.status_code == 200, f"登录失败: {login.status_code}"

# ★★★ 关键：把 token 从响应里"提取"出来，存进变量（= Apifox 的"提取变量"）
token = login.json()["access"]
print("[token]", token[:30], "...")
assert token, "access 令牌为空"

# ========== 第 3 步：带着 token 查询当前用户 ==========
me = requests.get(
    f"{BASE_URL}/api/auth/me/",
    headers={"Authorization": f"Bearer {token}"},   # = Apifox 的 Bearer {{token}}
)
print("[查询当前用户]", me.status_code, me.json())
assert me.status_code == 200, f"鉴权失败: {me.status_code}"

# ★ 最有价值的一条断言：返回的必须是我刚注册的那个人
assert me.json()["username"] == username, "返回的用户不是刚注册的那个"

print("\nPASS - 用户完整流程全部通过")