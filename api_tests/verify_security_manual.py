# -*- coding: utf-8 -*-
"""
手工验证脚本：越权（IDOR）修复效果自查
=======================================

用途：改完代码后，想快速看一眼「权限到底对不对」，又不想开 Allure 的时候跑这个。

跑法（在项目根目录 C:\\Users\\33893\\QAgent 下执行）：
    .\\venv\\Scripts\\python.exe api_tests\\verify_security_manual.py

前提：后端服务要在跑（python manage.py runserver，监听 127.0.0.1:8000）

注意：文件名没有以 test_ 开头，所以 pytest 不会自动收集它，不影响你的自动化用例。
"""
import time
import requests

from qa_config import BASE_URL


def show(label, r):
    body = r.text[:110].replace("\n", " ")
    print(f"{label:<42} -> {r.status_code:<4} {body}")


def main():
    print("=" * 78)
    print("  QAgent 越权修复自查")
    print("=" * 78)

    username = f"smoke_{int(time.time())}"
    password = "Smoke@2026"

    # --- 1. 造一个全新账号 ---
    r = requests.post(f"{BASE_URL}/api/auth/register/", json={
        "username": username,
        "password": password,
        "password_confirm": password,
        "email": f"{username}@example.com",
    })
    show("1. 注册新用户（造数据）", r)
    if r.status_code != 201:
        print("注册失败，后面的检查没法继续。请确认后端服务在跑。")
        return
    uid = r.json()["user"]["id"]

    # --- 2. 登录拿令牌 ---
    r = requests.post(f"{BASE_URL}/api/auth/login/",
                      json={"username": username, "password": password})
    show("2. 登录拿 JWT 令牌", r)
    token = r.json()["access"]
    headers = {"Authorization": f"Bearer {token}"}

    print("-" * 78)
    print("  【应该被拒绝】越权行为（期望 403）")
    print("-" * 78)
    show("3. 不带令牌看用户列表（期望 401）",
         requests.get(f"{BASE_URL}/api/auth/users/"))
    show("4. 普通用户看用户列表（期望 403）",
         requests.get(f"{BASE_URL}/api/auth/users/", headers=headers))
    show("5. 读 admin(id=1) 的资料（期望 403）",
         requests.get(f"{BASE_URL}/api/auth/users/1/", headers=headers))
    show("6. 改 admin(id=1) 的资料（期望 403）",
         requests.patch(f"{BASE_URL}/api/auth/users/1/", headers=headers,
                        json={"phone": "13900000000"}))
    show("7. 删 admin(id=1) 的账号（期望 403）",
         requests.delete(f"{BASE_URL}/api/auth/users/1/", headers=headers))

    print("-" * 78)
    print("  【应该被允许】正常功能（期望 200 / 204），证明没改坏东西")
    print("-" * 78)
    show("8. 读自己的资料（期望 200）",
         requests.get(f"{BASE_URL}/api/auth/users/{uid}/", headers=headers))
    show("9. 改自己的资料（期望 200）",
         requests.patch(f"{BASE_URL}/api/auth/users/{uid}/", headers=headers,
                        json={"phone": "13712345678"}))
    show("10. 查当前登录用户 /auth/me/（期望 200）",
         requests.get(f"{BASE_URL}/api/auth/me/", headers=headers))

    # --- 收尾：删掉自己造的账号 ---
    print("-" * 78)
    show("11. 删自己账号（收尾，期望 204）",
         requests.delete(f"{BASE_URL}/api/auth/users/{uid}/", headers=headers))
    show("12. 删完再登（期望 400，证明真的删掉了）",
         requests.post(f"{BASE_URL}/api/auth/login/",
                       json={"username": username, "password": password}))
    print("=" * 78)


if __name__ == "__main__":
    main()
