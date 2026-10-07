"""
注册接口的 pytest 测试用例
"""
import time
import uuid

import requests

from qa_config import BASE_URL


def test_register_success(cleanup):
    """正向：用全新的用户名注册，应该成功返回 201"""
    username = f"tester_py_{int(time.time())}_{uuid.uuid4().hex[:6]}"

    r = requests.post(f"{BASE_URL}/api/auth/register/", json={
        "username": username,
        "password": "Tester@2026",
        "password_confirm": "Tester@2026",
        "email": f"{username}@example.com",
    })

    assert r.status_code == 201, f"期望 201，实际 {r.status_code}，响应：{r.text}"
    assert r.json()["user"]["username"] == username

    # 登记：这条用例造的数据，交给 cleanup 在跑完后删掉
    cleanup.append((r.json()["user"]["id"], username, "Tester@2026"))


def test_register_duplicate_username():
    """负向：用已存在的用户名注册，应该返回 400"""
    r = requests.post(f"{BASE_URL}/api/auth/register/", json={
        "username": "tester01",
        "password": "Tester@2026",
        "password_confirm": "Tester@2026",
    })

    assert r.status_code == 400, f"期望 400，实际 {r.status_code}"
    assert "已存在" in r.json()["username"][0]


def test_register_returns_jwt(cleanup):
    """
    回归用例：注册接口必须与登录接口返回同一种令牌（JWT）。

    背景：原实现返回的是 DRF authtoken（另一套认证机制），且 authtoken 未安装时
    会返回假令牌 `temp_token_<id>`。此用例锁死修复后的契约：
      1. 响应含 access / refresh，结构与 /api/auth/login/ 一致；
      2. 不含遗留的 token 字段（防止双机制回归）；
      3. access 不是占位假令牌；
      4. access 能立即通过受保护接口 /api/auth/me/ 的鉴权。
    """
    username = f"tester_py_{int(time.time())}_{uuid.uuid4().hex[:6]}"

    r = requests.post(f"{BASE_URL}/api/auth/register/", json={
        "username": username,
        "password": "Tester@2026",
        "password_confirm": "Tester@2026",
        "email": f"{username}@example.com",
    })
    assert r.status_code == 201, f"期望 201，实际 {r.status_code}，响应：{r.text}"
    body = r.json()
    cleanup.append((body["user"]["id"], username, "Tester@2026"))

    # 1) 结构与登录接口一致
    assert "access" in body and "refresh" in body, \
        f"注册接口未返回 JWT，实际字段：{sorted(body.keys())}"

    # 2) 不得再出现遗留的 DRF Token 字段
    assert "token" not in body, "注册接口仍返回遗留的 DRF Token 字段"

    # 3) 不得是占位假令牌
    assert not body["access"].startswith("temp_token_"), "注册返回了占位假令牌"

    # 4) 拿注册返回的 access 直接访问受保护接口，必须通过
    me = requests.get(
        f"{BASE_URL}/api/auth/me/",
        headers={"Authorization": f"Bearer {body['access']}"},
    )
    assert me.status_code == 200, f"注册返回的令牌无法鉴权：{me.status_code} {me.text}"
    assert me.json()["username"] == username