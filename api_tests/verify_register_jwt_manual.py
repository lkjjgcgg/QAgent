# -*- coding: utf-8 -*-
"""
手工验证脚本：注册接口「认证机制统一」修复效果自查
=================================================

用途：改完代码后，想快速看一眼「注册接口返回的到底是不是 JWT」时跑这个。

跑法（在项目根目录 C:\\Users\\33893\\QAgent 下执行）：
    .\\venv\\Scripts\\python.exe api_tests\\verify_register_jwt_manual.py

前提：后端服务要在跑（python manage.py runserver，监听 127.0.0.1:8000）

注意：文件名没有以 test_ 开头，所以 pytest 不会自动收集它，不影响自动化用例。
"""
import time
import uuid

import requests

from qa_config import BASE_URL

# JWT 的 Base64 编码始终以这串字符开头（对应 {"alg": ...}），用它来肉眼识别
JWT_PREFIX = "eyJ"


def check(label, ok, detail=""):
    mark = "PASS" if ok else "FAIL"
    print(f"  [{mark}] {label:<46} {detail}")
    return ok


def main():
    print("=" * 78)
    print("  QAgent 注册接口认证机制自查（应为 JWT，且与登录接口一致）")
    print("=" * 78)

    username = f"jwtcheck_{int(time.time())}_{uuid.uuid4().hex[:6]}"
    password = "Tester@2026"

    # --- 1. 注册 ---
    r = requests.post(f"{BASE_URL}/api/auth/register/", json={
        "username": username,
        "password": password,
        "password_confirm": password,
        "email": f"{username}@example.com",
    })
    print(f"\n1. 注册新用户 -> HTTP {r.status_code}")
    if r.status_code != 201:
        print("   注册失败，后面的检查没法继续。请确认后端服务在跑。")
        print("   响应：", r.text[:200])
        return

    body = r.json()
    print("   响应字段：", sorted(body.keys()))

    results = []
    # --- 2. 结构是否与登录接口一致 ---
    print("\n2. 令牌结构（应与 /api/auth/login/ 一致）")
    results.append(check("响应含 access 字段", "access" in body))
    results.append(check("响应含 refresh 字段", "refresh" in body))
    results.append(check("不含遗留的 DRF Token 字段 token",
                         "token" not in body,
                         "" if "token" not in body else "← 仍是双机制！"))

    # --- 3. 是不是真 JWT ---
    print("\n3. 令牌真伪")
    access = body.get("access", "")
    results.append(check("access 是 JWT 格式（以 eyJ 开头）",
                         access.startswith(JWT_PREFIX), access[:24] + " ..."))
    results.append(check("不是占位假令牌 temp_token_*",
                         not access.startswith("temp_token_")))

    # --- 4. 真能用 ---
    print("\n4. 令牌可用性（拿注册返回的 access 直接访问受保护接口）")
    me = requests.get(f"{BASE_URL}/api/auth/me/",
                      headers={"Authorization": f"Bearer {access}"})
    results.append(check("/api/auth/me/ 鉴权通过", me.status_code == 200,
                         f"HTTP {me.status_code}"))
    if me.status_code == 200:
        results.append(check("返回的正是刚注册的用户",
                             me.json().get("username") == username,
                             me.json().get("username", "")))

    # --- 5. 该令牌刷新后仍可用（证明 refresh 也是统一体系） ---
    print("\n5. refresh 令牌可用性")
    rr = requests.post(f"{BASE_URL}/api/auth/token/refresh/",
                       json={"refresh": body.get("refresh", "")})
    results.append(check("/api/auth/token/refresh/ 刷新成功",
                         rr.status_code == 200, f"HTTP {rr.status_code}"))

    # --- 6. 清理 ---
    print("\n6. 清理测试数据")
    d = requests.delete(f"{BASE_URL}/api/auth/users/{body['user']['id']}/",
                        headers={"Authorization": f"Bearer {access}"})
    print(f"   删除用户 {username} -> HTTP {d.status_code}")

    print("\n" + "=" * 78)
    total, passed = len(results), sum(1 for x in results if x)
    print(f"  结果：{passed}/{total} 项通过")
    print("=" * 78)


if __name__ == "__main__":
    main()
