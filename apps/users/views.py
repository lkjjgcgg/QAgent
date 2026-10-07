from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import login, logout
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import User
from .permissions import IsSelfOrAdmin
from .serializers import UserSerializer, UserCreateSerializer, LoginSerializer

# JWT 相关导入
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_current_user(request):
    """返回当前登录用户自己的信息。

    注：此处原本被重复定义了两遍（连同重复的 import），已清理为一份。
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all().order_by('username')
    serializer_class = UserCreateSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        """
        【认证机制统一修复】

        原实现返回的是 DRF authtoken（`rest_framework.authtoken`）—— 一套与
        登录接口完全不同的认证机制。问题有三：
          1. 登录返回 JWT(access/refresh)，注册返回 DRF Token，同一个 API 模块
             出现两种令牌，前端无法统一处理；
          2. 前端（web/src/services/api.js）统一用 `Authorization: Bearer <JWT>`
             发请求，根本不消费这个 `token` 字段，等于白白签发；
          3. 兜底分支 `except ImportError` 会返回 `temp_token_<id>` —— 一个
             假令牌，却被当成真令牌返回给调用方。

        现在统一为 JWT：注册成功即签发 access + refresh，响应结构与
        /api/auth/login/ 完全一致，调用方一套逻辑即可处理登录与注册。
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)

        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),   # JWT access token
            'refresh': str(refresh),               # JWT refresh token
            'message': '注册成功',
        }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
@csrf_exempt
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.validated_data['user']
    login(request, user)

    # JWT Token (优先使用JWT)
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    refresh_token = str(refresh)

    return Response({
        'user': UserSerializer(user).data,
        'access': access_token,       # JWT access token
        'refresh': refresh_token,     # JWT refresh token
        'message': '登录成功'
    })

@api_view(['POST'])
@csrf_exempt
def logout_view(request):
    """用户退出登录，将refresh token加入黑名单"""
    if request.user.is_authenticated:
        try:
            # 尝试将refresh token加入黑名单
            refresh_token = request.data.get('refresh')
            if refresh_token:
                from rest_framework_simplejwt.tokens import RefreshToken as JWTRefreshToken
                try:
                    token = JWTRefreshToken(refresh_token)
                    token.blacklist()
                except Exception as e:
                    print(f"Blacklist error: {e}")
        except Exception as e:
            print(f"Logout error: {e}")

        # 注：此处原有 `request.user.auth_token.delete()`（清理 DRF authtoken）。
        # 该令牌机制已随注册接口一并移除，全项目不再签发 authtoken，故删除。

        logout(request)

    return Response({'message': '退出成功'})

@api_view(['GET'])
def profile_view(request):
    if not request.user.is_authenticated:
        return Response({'error': '未登录'}, status=status.HTTP_401_UNAUTHORIZED)
    
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

class UserListView(generics.ListCreateAPIView):
    """
    用户列表接口： /api/auth/users/

    【安全修复】原实现用的是 IsAuthenticated，任何登录用户都能拉到全站用户名单
    （含 email、手机号等），属于信息泄露。
    经排查，前端并不使用这个接口（前端用的是 /api-testing/users/），
    因此这里收紧为「仅管理员（is_staff）可访问」。
    """
    queryset = User.objects.all().order_by('username')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    单个用户接口： /api/auth/users/<id>/

    【安全修复 - IDOR 越权】
    原实现只有 IsAuthenticated，只检查「你登录了吗」，没检查「这条数据归不归你」，
    导致任何登录用户都能读取 / 修改 / 删除别人的账号
    （实测：拿普通用户令牌 DELETE 他人账号返回 204，受害者账号真被删除）。

    现在加上 IsSelfOrAdmin：本人或管理员放行，其他登录用户返回 403。
    """
    queryset = User.objects.all().order_by('username')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsSelfOrAdmin]
