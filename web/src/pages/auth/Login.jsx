import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useTranslation } from '../../locales';
import { login } from '../../store/userSlice';
import api from '../../services/api';
import AuthShell, { AuthFooter } from '../../components/AuthShell.jsx';
import { fontSize, spacing } from '../../theme/tokens.js';

/**
 * 登录页
 * =============================================================================
 * 改造点（对照 web/DESIGN.md）：
 *   1. 背景从硬编码的 #f0f2f5 换成设计体系里的羊皮纸白 --q-canvas-parchment
 *   2. 表单控件提到 size="large"（44px 高），对齐 DESIGN.md 规定的最小点击区域
 *   3. 主按钮改成**胶囊形**（shape="round"）—— DESIGN.md 说胶囊就是"这是操作"的信号
 *   4. 标题去掉 antd 默认的 Title 组件，改用 600 字重 + 负字距的自定义标题
 *   5. 输入框加前置图标，降低识别成本
 *
 * 业务逻辑（dispatch(login) / 跳转）保持原样没动。
 */

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const onFinish = async (values) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login/', values);
      dispatch(login(response.data));
      const from = location.state?.from?.pathname || '/home';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || t('auth.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title={t('auth.login')} subtitle={t('auth.loginSubtitle')} footer={<AuthFooter>{t('auth.copyright')}</AuthFooter>}>
      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginBottom: spacing.md }}
        />
      )}

      <Form name="login" initialValues={{ remember: true }} onFinish={onFinish} size="large">
        <Form.Item name="username" rules={[{ required: true, message: t('auth.username') }]}>
          <Input prefix={<UserOutlined />} placeholder={t('auth.username')} autoComplete="username" />
        </Form.Item>

        <Form.Item name="password" rules={[{ required: true, message: t('auth.password') }]}>
          <Input.Password
            prefix={<LockOutlined />}
            placeholder={t('auth.password')}
            autoComplete="current-password"
          />
        </Form.Item>

        {/* 「记住我 / 忘记密码」同一行左右分布 */}
        <Form.Item style={{ marginBottom: spacing.lg }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>{t('auth.rememberMe')}</Checkbox>
            </Form.Item>
            <Link to="#" className="q-link" style={{ fontSize: fontSize.base }}>
              {t('auth.forgotPassword')}
            </Link>
          </div>
        </Form.Item>

        <Form.Item style={{ marginBottom: spacing.md }}>
          {/* 胶囊主按钮：这是 DESIGN.md 的签名形状，也是整个页面唯一的强调色落点 */}
          <Button type="primary" htmlType="submit" shape="round" block loading={loading}>
            {t('auth.login')}
          </Button>
        </Form.Item>

        <div style={{ textAlign: 'center', fontSize: fontSize.base }}>
          <span className="q-caption">{t('auth.noAccount')} </span>
          <Link to="/register" className="q-link">
            {t('auth.register')}
          </Link>
        </div>
      </Form>
    </AuthShell>
  );
};

export default Login;
