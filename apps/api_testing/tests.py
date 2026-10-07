"""
api_testing 的单元测试。

【本文件为什么存在】
前端「请求历史」页的「重试」按钮一直在调
    POST /api/api-testing/histories/{id}/retry/
但后端从来没有这个动作 —— 这是一条「前端在调、后端没有」的断链，点一次就 404 一次。
本次补齐了动作（见 views.py 的 RequestHistoryViewSet.retry），并用下面这些用例
把它的行为锁住：重试要新增一条历史、环境要按优先级取、越权要被挡住、失败要返回 400。

【为什么要把真实网络请求挡掉】
utils.execute_api_request() 内部真的会发 HTTP 请求。单元测试不能依赖外网，
所以用 unittest.mock 把 requests.request 换成假的 —— 我们只验证两件属于
「我们自己代码」的事：请求参数怎么组装出来、历史记录怎么落库。
"""

import json
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from .models import (
    ApiCollection,
    ApiProject,
    ApiRequest,
    Environment,
    RequestHistory,
)

User = get_user_model()


class FakeResponse:
    """顶替 requests.Response 的最小实现，只实现 utils 里用到的几个属性。"""

    def __init__(self, status_code=200, payload=None):
        self.status_code = status_code
        self._payload = payload if payload is not None else {'ok': True}
        self.text = json.dumps(self._payload)
        # utils 里会先判断 content-type 是否 application/json，再决定要不要 .json()
        self.headers = {'Content-Type': 'application/json'}

    def json(self):
        return self._payload


class RequestHistoryRetryTestCase(TestCase):
    """POST /api/api-testing/histories/{id}/retry/ 的行为测试。"""

    def setUp(self):
        self.user = User.objects.create_user(username='retry_user', password='testpass123')
        self.other_user = User.objects.create_user(username='other_user', password='testpass123')

        # 注意：ApiProject 的 project_type / status 是必填的 choices 字段，没有默认值
        self.project = ApiProject.objects.create(
            name='Retry Project',
            project_type='HTTP',
            status='IN_PROGRESS',
            owner=self.user,
        )
        self.collection = ApiCollection.objects.create(
            name='Retry Collection',
            project=self.project,
        )
        self.environment = Environment.objects.create(
            name='Local Env',
            scope='LOCAL',
            variables={'host': 'http://example.com'},
            created_by=self.user,
        )
        # url 里用 {{host}} 这个环境变量占位，用来验证变量确实被替换了
        self.api_request = ApiRequest.objects.create(
            name='Ping',
            method='GET',
            url='{{host}}/ping',
            collection=self.collection,
            project=self.project,
            created_by=self.user,
        )
        self.history = RequestHistory.objects.create(
            request=self.api_request,
            environment=self.environment,
            request_data={'url': 'http://example.com/ping', 'method': 'GET'},
            status_code=200,
            executed_by=self.user,
        )

        self.client = APIClient()
        self.client.force_authenticate(self.user)
        self.retry_url = f'/api/api-testing/histories/{self.history.id}/retry/'

    # ---------------------------------------------------------------- 辅助
    def _retry(self, payload=None):
        return self.client.post(self.retry_url, payload or {}, format='json')

    def _newest_history(self):
        return RequestHistory.objects.order_by('-id').first()

    # ---------------------------------------------------------------- 正常路径
    @patch('requests.request')
    def test_retry_creates_a_new_history_record(self, mock_request):
        """重试成功时：返回 200，并**新增**一条历史记录（而不是改掉原来那条）。"""
        mock_request.return_value = FakeResponse(200, {'ok': True})

        before = RequestHistory.objects.count()
        response = self._retry()

        self.assertEqual(response.status_code, 200, response.content)
        self.assertTrue(response.data['success'])

        # 历史是只追加的流水账。原实现若去原地覆盖，这里就会是 before 而不是 before + 1。
        self.assertEqual(RequestHistory.objects.count(), before + 1)

        newest = self._newest_history()
        self.assertNotEqual(newest.id, self.history.id)
        self.assertEqual(newest.executed_by, self.user)
        self.assertEqual(newest.status_code, 200)

        # 环境变量 {{host}} 必须被替换成真实值再发出去
        self.assertEqual(mock_request.call_args.kwargs['url'], 'http://example.com/ping')

    @patch('requests.request')
    def test_retry_accepts_environment_id_from_body(self, mock_request):
        """请求体里显式给了 environment_id 时，用它而不是历史里那条环境。"""
        mock_request.return_value = FakeResponse()

        other_env = Environment.objects.create(
            name='Other Env',
            scope='LOCAL',
            variables={'host': 'http://other.example.com'},
            created_by=self.user,
        )
        response = self._retry({'environment_id': other_env.id})

        self.assertEqual(response.status_code, 200, response.content)
        self.assertEqual(self._newest_history().environment_id, other_env.id)
        self.assertEqual(mock_request.call_args.kwargs['url'], 'http://other.example.com/ping')

    @patch('requests.request')
    def test_retry_falls_back_to_the_history_environment(self, mock_request):
        """请求体里没给 environment_id 时，回退到这条历史当时用的环境。"""
        mock_request.return_value = FakeResponse()

        response = self._retry()

        self.assertEqual(response.status_code, 200, response.content)
        self.assertEqual(self._newest_history().environment_id, self.environment.id)

    # ---------------------------------------------------------------- 异常路径
    @patch('requests.request')
    def test_retry_returns_400_and_writes_nothing_when_the_request_fails(self, mock_request):
        """底层请求抛异常时：返回 400，且**不写**历史记录（失败的执行不该污染流水账）。"""
        mock_request.side_effect = RuntimeError('connection refused')

        before = RequestHistory.objects.count()
        response = self._retry()

        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.data['success'])
        self.assertEqual(RequestHistory.objects.count(), before)

    def test_retry_of_someone_elses_history_returns_404(self):
        """越权：别人的历史记录必须取不到（get_queryset 已按 owner/members 收窄）。"""
        outsider = APIClient()
        outsider.force_authenticate(self.other_user)

        response = outsider.post(self.retry_url, {}, format='json')
        self.assertEqual(response.status_code, 404)

    def test_retry_requires_authentication(self):
        """未登录不允许重试。"""
        anonymous = APIClient()
        response = anonymous.post(self.retry_url, {}, format='json')
        self.assertEqual(response.status_code, 401)

    def test_retry_of_a_missing_history_returns_404(self):
        """历史记录不存在时返回 404，而不是 500。"""
        response = self.client.post('/api/api-testing/histories/99999999/retry/', {}, format='json')
        self.assertEqual(response.status_code, 404)
