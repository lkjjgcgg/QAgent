import time
import uuid
import pytest
import requests

from qa_config import BASE_URL, FIXTURE_PASSWORD, FIXTURE_USERNAME


@pytest.fixture(scope="session", autouse=True)
def ensure_fixture_user():
    """整个测试会话开始前，幂等地确保「已存在」基准账号就绪。

    为什么需要：
        test_register.py 和 test_register_param.py 里有「用已存在的用户名注册，
        应返回 400」的用例，它们的输入必须是一个真的已存在的账号。此前这条
        隐式依赖是人工在本地数据库里建好的，一旦在全新的空数据库上跑（例如
        CI 容器）就会误报失败。

    做法：直接调用注册接口尝试创建。已存在时接口返回 400，同样视为正常。
    幂等 —— 重复执行不会有副作用，本地已有该账号时也不会改动它。
    """
    r = requests.post(f"{BASE_URL}/api/auth/register/", json={
        "username": FIXTURE_USERNAME,
        "password": FIXTURE_PASSWORD,
        "password_confirm": FIXTURE_PASSWORD,
        "email": f"{FIXTURE_USERNAME}@example.com",
    })
    # 201 = 本次新建；400 = 已存在。两者都说明「前置条件已满足」。
    if r.status_code not in (201, 400):
        raise RuntimeError(
            f"基准账号 {FIXTURE_USERNAME} 准备失败："
            f"HTTP {r.status_code} {r.text[:200]}\n"
            f"请确认后端服务已在 {BASE_URL} 运行。"
        )
    yield


@pytest.fixture
def new_user():
    """准备：注册一个临时用户；清理：用例结束后删掉它"""
    username = f"tester_fix_{int(time.time())}_{uuid.uuid4().hex[:6]}"
    password = "Tester@2026"

    # ---------- yield 之前：准备（setup）----------
    r = requests.post(f"{BASE_URL}/api/auth/register/", json={
        "username": username,
        "password": password,
        "password_confirm": password,
        "email": f"{username}@example.com",
    })
    assert r.status_code == 201, f"fixture 注册失败: {r.text}"

    user = {"id": r.json()["user"]["id"], "username": username, "password": password}
    print(f"\n[准备] 已创建用户 {username} (id={user['id']})")

    yield user          # ← 分界线：把 user 交给测试函数

    # ---------- yield 之后：清理（teardown）----------
    login = requests.post(f"{BASE_URL}/api/auth/login/", json={
        "username": username, "password": password,
    })
    token = login.json()["access"]

    d = requests.delete(
        f"{BASE_URL}/api/auth/users/{user['id']}/",
        headers={"Authorization": f"Bearer {token}"},
    )
    print(f"[清理] 删除用户 {username} -> {d.status_code}")


@pytest.fixture
def token(new_user):
    """登录拿 access 令牌（依赖 new_user，所以 new_user 一定先跑）"""
    r = requests.post(f"{BASE_URL}/api/auth/login/", json={
        "username": new_user["username"],
        "password": new_user["password"],
    })
    assert r.status_code == 200, f"fixture 登录失败: {r.text}"
    return r.json()["access"]


@pytest.fixture
def cleanup():
    """登记处：用例把造出来的账号登记进来，跑完自动删除"""
    accounts = []
    yield accounts

    # ---------- 以下在用例跑完后执行 ----------
    for user_id, username, password in accounts:
        # 用这个账号【自己的】令牌删自己（最小权限原则）
        login = requests.post(f"{BASE_URL}/api/auth/login/", json={
            "username": username, "password": password,
        })
        if login.status_code != 200:
            print(f"[清理] {username} 登录失败({login.status_code})，跳过")
            continue
        tk = login.json()["access"]
        d = requests.delete(f"{BASE_URL}/api/auth/users/{user_id}/",
                            headers={"Authorization": f"Bearer {tk}"})
        print(f"[清理] 删除 {username} (id={user_id}) -> {d.status_code}")