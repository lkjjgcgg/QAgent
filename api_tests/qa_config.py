# -*- coding: utf-8 -*-
"""
接口测试的公共配置
==================

在这之前，`http://127.0.0.1:8000` 被硬编码在 6 个测试文件里，带来两个问题：
  1. 换端口、换环境（本地 / CI / 测试服）要挨个文件改，容易漏；
  2. CI 跑在另一台机器上，没法把地址指过去。

现在统一从这里读取，允许用环境变量覆盖：

    # 本地默认，不用配任何东西
    pytest api_tests -q

    # 指向别的地址（CI、远程测试服）
    QAGENT_BASE_URL=http://127.0.0.1:8001 pytest api_tests -q
"""

import os

# 被测后端服务的基地址。
# 末尾的 "/" 会被去掉，避免拼出 "//api/auth/login/" 这种双斜杠地址。
BASE_URL = os.environ.get("QAGENT_BASE_URL", "http://127.0.0.1:8000").rstrip("/")

# ---------------------------------------------------------------
# 「已存在」基准账号
# ---------------------------------------------------------------
# 有两条用例的输入必须是一个**已经存在**的用户名（验证「重复注册应返回 400」）：
#   - test_register.py::test_register_duplicate_username
#   - test_register_param.py  参数 id="用户名已存在"
# 在全新的空数据库（例如 CI 容器）上这个账号并不存在，用例会误报失败。
# 因此由 conftest.py 里 session 级的 ensure_fixture_user fixture 幂等创建。
FIXTURE_USERNAME = "tester01"
FIXTURE_PASSWORD = "Tester@2026"
