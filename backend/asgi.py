"""
ASGI config for backend project.

当前仅提供 HTTP 服务。
项目未实现 WebSocket 实时推送（没有 consumers，也没有 routing.py）。
如需启用，需先实现 routing.py，并安装 channels 与 daphne。
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

application = get_asgi_application()