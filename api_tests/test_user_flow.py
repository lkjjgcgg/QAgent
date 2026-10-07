import allure
import requests

from qa_config import BASE_URL


@allure.epic("QAgent 接口测试")          # 最高层：整个项目
@allure.feature("用户认证")               # 中层：功能模块
class TestUserFlow:

    @allure.story("登录鉴权")             # 下层：用户故事
    @allure.title("带令牌查询当前用户，应返回自己的信息")
    @allure.severity(allure.severity_level.CRITICAL)
    def test_get_me(self, new_user, token):
        """带令牌查自己，应该拿到刚注册的那个用户名"""
        with allure.step("用令牌请求 GET /api/auth/me/"):
            r = requests.get(f"{BASE_URL}/api/auth/me/",
                             headers={"Authorization": f"Bearer {token}"})

        with allure.step("断言状态码为 200"):
            assert r.status_code == 200

        with allure.step("断言返回的用户名是刚注册的那个"):
            assert r.json()["username"] == new_user["username"]

    @allure.story("登录鉴权")
    @allure.title("不带令牌查询当前用户，应返回 401")
    @allure.severity(allure.severity_level.NORMAL)
    def test_get_me_without_token(self):
        """不带令牌，应该 401"""
        r = requests.get(f"{BASE_URL}/api/auth/me/")
        assert r.status_code == 401