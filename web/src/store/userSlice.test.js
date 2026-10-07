import { describe, it, expect, beforeEach, vi } from 'vitest';
import userReducer, { login, logout, setUser, fetchUser } from './userSlice.js';

/** 未登录的干净状态，避免每个用例都重复写一遍字面量 */
const loggedOut = {
  user: null,
  accessToken: '',
  refreshToken: '',
  tokenExpiresAt: 0,
  isAuthenticated: false,
  refreshTimer: null,
};

/** login 里写死的令牌有效期，测试跟着它走（改业务逻辑时这里会一起失败，是好事） */
const TOKEN_TTL_MS = 30 * 60 * 1000;

describe('userSlice —— 登录', () => {
  beforeEach(() => localStorage.clear());

  it('login 把令牌写进状态，并算出 30 分钟后的过期时间', () => {
    const before = Date.now();
    const state = userReducer(loggedOut, login({ access: 'a1', refresh: 'r1', user: { id: 7 } }));
    const after = Date.now();

    expect(state.accessToken).toBe('a1');
    expect(state.refreshToken).toBe('r1');
    expect(state.user).toEqual({ id: 7 });
    expect(state.isAuthenticated).toBe(true);
    // 不写死时间戳，只要求落在 [调用前+30min, 调用后+30min] 区间内，避免用例变脆
    expect(state.tokenExpiresAt).toBeGreaterThanOrEqual(before + TOKEN_TTL_MS);
    expect(state.tokenExpiresAt).toBeLessThanOrEqual(after + TOKEN_TTL_MS);
  });

  it('login 把令牌持久化到 localStorage（否则刷新页面就掉登录）', () => {
    userReducer(loggedOut, login({ access: 'a1', refresh: 'r1', user: { id: 7, username: 'tom' } }));

    expect(localStorage.getItem('access_token')).toBe('a1');
    expect(localStorage.getItem('refresh_token')).toBe('r1');
    expect(Number(localStorage.getItem('token_expires_at'))).toBeGreaterThan(Date.now());
    expect(JSON.parse(localStorage.getItem('user'))).toEqual({ id: 7, username: 'tom' });
  });
});

describe('userSlice —— 登出与失效', () => {
  beforeEach(() => localStorage.clear());

  it('logout 清空内存状态与 localStorage 里的全部认证信息', () => {
    localStorage.setItem('access_token', 'a1');
    localStorage.setItem('refresh_token', 'r1');
    localStorage.setItem('token_expires_at', '999');
    localStorage.setItem('user', '{}');

    const state = userReducer(
      { ...loggedOut, accessToken: 'a1', refreshToken: 'r1', user: { id: 7 }, isAuthenticated: true },
      logout(),
    );

    expect(state.accessToken).toBe('');
    expect(state.refreshToken).toBe('');
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
    expect(localStorage.getItem('token_expires_at')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('拉取用户信息失败（令牌失效）→ 自动清空登录态', () => {
    localStorage.setItem('access_token', 'a1');

    const state = userReducer(
      { ...loggedOut, accessToken: 'a1', refreshToken: 'r1', isAuthenticated: true },
      { type: fetchUser.rejected.type },
    );

    expect(state.isAuthenticated).toBe(false);
    expect(state.accessToken).toBe('');
    expect(localStorage.getItem('access_token')).toBeNull();
  });
});

describe('userSlice —— setUser', () => {
  beforeEach(() => localStorage.clear());

  it('更新用户信息并持久化', () => {
    const state = userReducer(loggedOut, setUser({ id: 9, username: 'jerry' }));

    expect(state.user).toEqual({ id: 9, username: 'jerry' });
    expect(JSON.parse(localStorage.getItem('user'))).toEqual({ id: 9, username: 'jerry' });
  });
});

/**
 * 初始状态在模块加载时就算好了（读 localStorage 并判断令牌是否过期），
 * 所以要测它必须 vi.resetModules() 后重新 import，否则拿到的是第一次加载的结果。
 */
describe('userSlice —— 初始状态（刷新页面后恢复登录态）', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  const loadReducer = async () => (await import('./userSlice.js')).default;

  it('没有任何令牌 → 未登录', async () => {
    const reducer = await loadReducer();
    const state = reducer(undefined, { type: '@@INIT' });

    expect(state.isAuthenticated).toBe(false);
    expect(state.accessToken).toBe('');
    expect(state.user).toBeNull();
  });

  it('令牌仍在有效期内 → 恢复登录态', async () => {
    localStorage.setItem('access_token', 'a1');
    localStorage.setItem('refresh_token', 'r1');
    localStorage.setItem('token_expires_at', String(Date.now() + 10 * 60 * 1000));
    localStorage.setItem('user', JSON.stringify({ id: 1, username: 'tom' }));

    const reducer = await loadReducer();
    const state = reducer(undefined, { type: '@@INIT' });

    expect(state.isAuthenticated).toBe(true);
    expect(state.accessToken).toBe('a1');
    expect(state.refreshToken).toBe('r1');
    expect(state.user).toEqual({ id: 1, username: 'tom' });
  });

  it('令牌已过期 → 视为未登录，并且不保留过期令牌', async () => {
    localStorage.setItem('access_token', 'a1');
    localStorage.setItem('refresh_token', 'r1');
    localStorage.setItem('token_expires_at', String(Date.now() - 1000)); // 1 秒前就过期了

    const reducer = await loadReducer();
    const state = reducer(undefined, { type: '@@INIT' });

    expect(state.isAuthenticated).toBe(false);
    expect(state.accessToken).toBe('');
    expect(state.refreshToken).toBe('');
    expect(state.tokenExpiresAt).toBe(0);
  });

  it('恰好等于当前时间（边界值）→ 视为已过期', async () => {
    const now = Date.now();
    localStorage.setItem('access_token', 'a1');
    localStorage.setItem('token_expires_at', String(now));

    const reducer = await loadReducer();
    const state = reducer(undefined, { type: '@@INIT' });

    // 判断条件写的是 tokenExpiresAt > Date.now()，所以"等于现在"不算有效
    expect(state.isAuthenticated).toBe(false);
  });

  it('localStorage 里的 user 是坏 JSON → 不崩溃，user 取 null', async () => {
    localStorage.setItem('access_token', 'a1');
    localStorage.setItem('token_expires_at', String(Date.now() + 60 * 1000));
    localStorage.setItem('user', '{这不是合法的 JSON');

    const reducer = await loadReducer();
    const state = reducer(undefined, { type: '@@INIT' });

    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(true); // 令牌本身有效，仍应视为已登录
  });
});
