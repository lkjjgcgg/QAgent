"""
注册接口参数化测试：一条用例函数，覆盖多种输入场景
"""
import time
import uuid

import pytest
import requests

from qa_config import BASE_URL


def unique_username():
    """生成一个唯一的用户名（时间戳 + 随机数双保险）"""
    return f"tester_py_{int(time.time())}_{uuid.uuid4().hex[:6]}"


@pytest.mark.parametrize(
    "username, password, password_confirm, expected_code",
    [
        pytest.param(unique_username(), "Tester@2026", "Tester@2026", 201, id="正常注册"),
        pytest.param("tester01",        "Tester@2026", "Tester@2026", 400, id="用户名已存在"),
        pytest.param("",                "Tester@2026", "Tester@2026", 400, id="用户名为空"),
        pytest.param(unique_username(), "Test@",  "Test@",  400, id="密码5位-下界减1"),
        pytest.param(unique_username(), "Test@1", "Test@1", 201, id="密码6位-下界"),
        pytest.param(unique_username(), "Tester@2026", "Tester@999",  400, id="两次密码不一致"),
    ],
)
def test_register_param(cleanup, username, password, password_confirm, expected_code):   # ← ① 加 cleanup
    r = requests.post(f"{BASE_URL}/api/auth/register/", json={
        "username": username,
        "password": password,
        "password_confirm": password_confirm,
    })

    # ② 只有真的创建成功（201）才登记
    if r.status_code == 201:
        cleanup.append((r.json()["user"]["id"], username, password))

    assert r.status_code == expected_code, \
        f"期望 {expected_code}，实际 {r.status_code}，响应：{r.text}"