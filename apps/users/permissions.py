# -*- coding: utf-8 -*-
"""
用户模块的自定义权限类

背景（为什么需要这个文件）：
DRF 内置的 IsAuthenticated 只检查「你登录了没有」（= 认证 Authentication），
不检查「这条数据归不归你」（= 授权 Authorization）。
两者缺一个，就会出现越权漏洞 —— 也就是本次测试发现的 IDOR。
"""
from rest_framework import permissions


class IsSelfOrAdmin(permissions.BasePermission):
    """
    对象级权限：只允许「本人」或「管理员」操作某个用户对象。

    放行条件（满足其一即可）：
      1. 请求者就是这条数据的主人：request.user.pk == obj.pk
      2. 请求者是管理员：is_staff = True

    其他已登录用户 -> 返回 403 Forbidden

    使用位置：UserDetailView
    （对应接口 GET / PUT / PATCH / DELETE  /api/auth/users/<id>/）
    """

    message = "无权操作其他用户的账号"

    def has_object_permission(self, request, view, obj):
        user = request.user
        # 没登录 -> 拒绝（正常情况下前面还有 IsAuthenticated 兜底）
        if not (user and user.is_authenticated):
            return False
        # 管理员 -> 放行
        if user.is_staff:
            return True
        # 本人 -> 放行，否则拒绝
        return obj.pk == user.pk
