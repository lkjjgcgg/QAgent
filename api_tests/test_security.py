"""
安全测试：越权访问（IDOR）
被测接口：apps/users/views.py:117  UserDetailView
"""
import time
import uuid

import requests

from qa_config import BASE_URL


def register_temp_user():
    """造一个一次性账号，返回 (id, username, password)"""
    username = f"tester_idor_{int(time.time())}_{uuid.uuid4().hex[:6]}"
    password = "Tester@2026"
    r = requests.post(f"{BASE_URL}/api/auth/register/", json={
        "username": username,
        "password": password,
        "password_confirm": password,
        "email": f"{username}@example.com",
    })
    assert r.status_code == 201, f"造账号失败: {r.text}"
    return r.json()["user"]["id"], username, password


def login(username, password):
    """登录，返回 access 令牌"""
    r = requests.post(f"{BASE_URL}/api/auth/login/", json={
        "username": username, "password": password,
    })
    assert r.status_code == 200, f"登录失败: {r.text}"
    return r.json()["access"]


def test_read_other_user(cleanup):
    """越权读取：攻击者不应该能看别人（尤其管理员）的资料"""
    victim_id, victim_name, victim_pwd = register_temp_user()
    attacker_id, attacker_name, attacker_pwd = register_temp_user()
    cleanup.append((victim_id, victim_name, victim_pwd))
    cleanup.append((attacker_id, attacker_name, attacker_pwd))

    attacker_token = login(attacker_name, attacker_pwd)

    # --- 实验组：攻击者的令牌，读受害者的资料 ---
    r = requests.get(f"{BASE_URL}/api/auth/users/{victim_id}/",
                     headers={"Authorization": f"Bearer {attacker_token}"})
    print(f"\n[实验组] 攻击者读受害者 -> {r.status_code}")
    print(f"         拿到的内容: {r.text[:150]}")

    # --- 加码：攻击者的令牌，读管理员（id=1）的资料 ---
    r_admin = requests.get(f"{BASE_URL}/api/auth/users/1/",
                           headers={"Authorization": f"Bearer {attacker_token}"})
    print(f"[加码]   攻击者读 admin(id=1) -> {r_admin.status_code}")
    print(f"         拿到的内容: {r_admin.text[:150]}")

    assert r.status_code in (403, 404), \
        f"越权读取！{attacker_name} 读到了 {victim_name} 的资料"


def test_delete_other_user(cleanup):
    """越权删除：攻击者不应该能删掉别人的账号"""
    victim_id, victim_name, victim_pwd = register_temp_user()
    attacker_id, attacker_name, attacker_pwd = register_temp_user()
    cleanup.append((victim_id, victim_name, victim_pwd))
    cleanup.append((attacker_id, attacker_name, attacker_pwd))

    attacker_token = login(attacker_name, attacker_pwd)

    # --- 对照组：不带令牌去删（验证鉴权本身是开着的）---
    no_auth = requests.delete(f"{BASE_URL}/api/auth/users/{victim_id}/")
    print(f"\n[对照组] 不带令牌删除 -> {no_auth.status_code}")

    # --- 实验组：攻击者的令牌，去删受害者 ---
    del_other = requests.delete(
        f"{BASE_URL}/api/auth/users/{victim_id}/",
        headers={"Authorization": f"Bearer {attacker_token}"},
    )
    print(f"[实验组] 攻击者删受害者 -> {del_other.status_code}")

    # --- 取证：受害者现在还登得上吗？---
    check = requests.post(f"{BASE_URL}/api/auth/login/", json={
        "username": victim_name, "password": victim_pwd,
    })
    print(f"[取证]   受害者再登录 -> {check.status_code} {check.text[:100]}")

    assert del_other.status_code in (403, 404), \
        f"越权删除！{attacker_name} 删掉了 {victim_name}"


def test_update_other_user(cleanup):
    """越权修改：攻击者不应该能改掉别人的资料"""
    victim_id, victim_name, victim_pwd = register_temp_user()
    attacker_id, attacker_name, attacker_pwd = register_temp_user()
    cleanup.append((victim_id, victim_name, victim_pwd))
    cleanup.append((attacker_id, attacker_name, attacker_pwd))

    attacker_token = login(attacker_name, attacker_pwd)

    # --- 实验组：攻击者的令牌，改受害者的资料 ---
    r = requests.patch(
        f"{BASE_URL}/api/auth/users/{victim_id}/",
        headers={"Authorization": f"Bearer {attacker_token}"},
        json={"phone": "13900000000"},
    )
    print(f"\n[实验组] 攻击者改受害者资料 -> {r.status_code}")
    print(f"         返回内容: {r.text[:150]}")

    assert r.status_code in (403, 404), \
        f"越权修改！{attacker_name} 改掉了 {victim_name} 的资料"


def test_update_self_ok(cleanup):
    """对照组：改【自己】的资料应该成功
    —— 用来证明修复没有误伤正常功能（这条必须一直是绿的）
    """
    uid, uname, upwd = register_temp_user()
    cleanup.append((uid, uname, upwd))

    token = login(uname, upwd)

    r = requests.patch(
        f"{BASE_URL}/api/auth/users/{uid}/",
        headers={"Authorization": f"Bearer {token}"},
        json={"phone": "13712345678"},
    )
    print(f"\n[对照组] 改自己的资料 -> {r.status_code}")

    assert r.status_code == 200, f"正常功能被误伤！改自己资料的返回是 {r.status_code}"
    assert r.json()["phone"] == "13712345678"
