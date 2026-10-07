# 核心功能模块 (Core App)

## 概述

`apps.core` 存放跨模块复用的通用能力：统一通知配置、定时任务调度器、动态变量解析。

## 功能清单

### 1. 统一通知配置

- **模型**: `UnifiedNotificationConfig`
- **接口**: `/api/core/notification-configs/`

统一管理邮件 / Webhook 机器人通知配置，供 API 测试的定时任务在
执行完成后发送结果通知。

| 字段 | 说明 |
|---|---|
| `name` | 配置名称 |
| `config_type` | 配置类型 |
| `webhook_bots` | Webhook 机器人列表（JSON，含类型、名称、启用状态、适用场景） |
| `is_default` | 是否为默认配置 |
| `is_active` | 是否启用 |

### 2. 定时任务调度器

- **命令**: `python manage.py run_all_scheduled_tasks`

轮询扫描 `apps.api_testing.models.ScheduledTask` 中到期的定时任务并执行。
采用**轮询式**实现（进程内循环），不是常驻后台服务，需要在服务器上手动启动该进程。

```bash
# 默认每 60 秒检查一次
python manage.py run_all_scheduled_tasks

# 自定义检查间隔（例如 30 秒）
python manage.py run_all_scheduled_tasks --interval 30

# 只执行一次检查，不循环（适合配合系统级 crontab 使用）
python manage.py run_all_scheduled_tasks --once
```

### 3. 动态变量解析

- **类**: `apps.core.variable_resolver.VariableResolver`

解析接口测试请求参数中的动态表达式（时间戳、随机数等），
使同一份测试用例可以在不同时间重复执行而参数不重复。

## 目录结构

```
apps/core/
├── models.py                             # UnifiedNotificationConfig
├── serializers.py                        # 通知配置序列化器
├── views.py                              # 通知配置 ViewSet
├── urls.py                               # 路由注册
├── variable_resolver.py                  # 动态变量解析
└── management/commands/
    └── run_all_scheduled_tasks.py        # 定时任务调度命令
```
