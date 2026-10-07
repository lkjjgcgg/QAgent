import React, { useState } from 'react';
import { Form, Input, Button, Alert } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from '../../locales';
import api from '../../services/api';
import AuthShell, { AuthFooter } from '../../components/AuthShell.jsx';
import { fontSize, spacing } from '../../theme/tokens.js';

/**
 * 注册页
 * =============================================================================
 * 改造点（对照 web/DESIGN.md）：
 *   1. 标题从「TestHub」改回「QAgent」—— 原来这是复制别的项目漏改的
 *   2. 与登录页共用 AuthShell 外壳，结构/背景/卡片完全一致
 *   3. 表单控件 size="large"、主按钮胶囊形，与登录页同一套语言
 *   4. 那两句**永远显示英文**的校验提示（'Please input valid email!' /
 *      'Passwords do not match!'）改走多语言，切到中文时也能正确显示
 *
 * 业务逻辑（注册成功后跳登录页）保持原样没动。
 */

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();

  const onFinish = async (values) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/auth/register/', values);
      setSuccess(t('auth.registerSuccess'));
      // 注册成功后跳转到登录页
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      // 后端返回的字段级校验错误（如「用户名已存在」）挂在 username / email 上，
      // 原实现只取 detail，这类错误会显示成兜底文案，丢失了具体原因。
      const data = err.response?.data;
      const firstFieldError =
        data && typeof data === 'object'
          ? Object.values(data).flat().find((v) => typeof v === 'string')
          : null;
      setError(firstFieldError || data?.detail || t('auth.registerFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={t('auth.register')}
      subtitle={t('auth.registerSubtitle')}
      footer={<AuthFooter>{t('auth.copyright')}</AuthFooter>}
    >
      {error && (
        <Alert message={error} type="error" showIcon style={{ marginBottom: spacing.md }} />
      )}

      {success && (
        <Alert message={success} type="success" showIcon style={{ marginBottom: spacing.md }} />
      )}

      <Form name="register" onFinish={onFinish} size="large">
        <Form.Item name="username" rules={[{ required: true, message: t('auth.username') }]}>
          <Input prefix={<UserOutlined />} placeholder={t('auth.username')} autoComplete="username" />
        </Form.Item>

        <Form.Item
          name="email"
          rules={[
            { required: true, message: t('auth.email') },
            { type: 'email', message: t('auth.emailInvalid') },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder={t('auth.email')} autoComplete="email" />
        </Form.Item>

        <Form.Item name="password" rules={[{ required: true, message: t('auth.password') }]}>
          <Input.Password
            prefix={<LockOutlined />}
            placeholder={t('auth.password')}
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item
          name="password_confirm"
          dependencies={['password']}
          rules={[
            { required: true, message: t('auth.confirmPassword') },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error(t('auth.passwordMismatch')));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder={t('auth.confirmPassword')}
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: spacing.md }}>
          <Button type="primary" htmlType="submit" shape="round" block loading={loading}>
            {t('auth.register')}
          </Button>
        </Form.Item>

        <div style={{ textAlign: 'center', fontSize: fontSize.base }}>
          <span className="q-caption">{t('auth.hasAccount')} </span>
          <Link to="/login" className="q-link">
            {t('auth.login')}
          </Link>
        </div>
      </Form>
    </AuthShell>
  );
};

export default Register;
