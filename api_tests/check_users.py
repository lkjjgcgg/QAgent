"""
查看数据库里所有用户 —— 确认测试数据堆积情况
"""
import os
import sys
import django

# 让 Python 找到项目根目录（本文件在 api_tests\ 里，往上一层就是 QAgent 根目录）
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

print("TOTAL:", User.objects.count())
print("-" * 40)
for u in User.objects.all().order_by("id"):
    print(u.id, repr(u.username))

# ===== 确认上面的清单没问题后，把下面两行的 # 去掉再跑一次，即可清理垃圾数据 =====
#print("deleted tester_*    :", User.objects.filter(username__startswith="tester_").delete())
#print('deleted {{username}}:', User.objects.filter(username="{{username}}").delete())