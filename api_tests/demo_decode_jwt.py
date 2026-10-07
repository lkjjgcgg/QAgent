import base64
import json

# ★ 把刚才运行时打印出来的 access 令牌整段粘到这里
token = "'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzkxMzYxNTA3LCJpYXQiOjE3OTEzNTc5MDcsImp0aSI6IjlkMDQ5ZGY5Yzc1YjRkMTliMzlhYjk1ZDEyZmYzNGZmIiwidXNlcl9pZCI6IjMzIn0.q3LOxkeQU3l__DEtWuAG3uWqj_-xaJ7tJBFjY11YkfQ"

header, payload, signature = token.split(".")

def decode(part):
    part += "=" * (-len(part) % 4)      # 补齐 Base64 长度（否则会报错）
    return json.loads(base64.urlsafe_b64decode(part))

print("header   :", decode(header))
print("payload  :", decode(payload))
print("signature:", signature[:20], "...")