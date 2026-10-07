import { describe, it, expect, afterEach, vi } from 'vitest';
import axios from 'axios';
import api, { injectStore } from './api.js';

/**
 * 测试对象：services/api.js 里的两个 axios 拦截器。
 *
 * 【为什么不真的发请求】
 * 拦截器是纯函数式的逻辑：给一个 config/error，返回一个新的 config/Promise。
 * 直接把它从 axios 里取出来单独调用，既能精确控制输入，又完全不依赖后端服务是否在跑。
 * （axios 把拦截器存在 interceptors.xxx.handlers[0] 上，这是 axios 的既有结构。）
 */
const requestOnFulfilled = api.interceptors.request.handlers[0].fulfilled;
const responseOnRejected = api.interceptors.response.handlers[0].rejected;

// 重放请求时会走实例的 adapter。先存好原始值，用例结束后恢复，避免污染其它测试。
const originalAdapter = api.defaults.adapter;

/**
 * 造一个最小的假 store。
 * 注意 dispatch 是**真的会更新内部状态**的——因为 401 刷新成功后，
 * 重放的请求会再次经过请求拦截器，那时它必须读到新令牌，否则这个用例就测不出真实行为。
 */
function makeStore(initialUser) {
  let user = { accessToken: '', refreshToken: '', user: null, ...initialUser };
  return {
    getState: () => ({ user }),
    dispatch: vi.fn((action) => {
      if (action.type === 'user/login') {
        user = { ...user, accessToken: action.payload.access, refreshToken: action.payload.refresh };
      }
      if (action.type === 'user/logout') {
        user = { ...user, accessToken: '', refreshToken: '', user: null };
      }
    }),
  };
}

afterEach(() => {
  api.defaults.adapter = originalAdapter;
  vi.restoreAllMocks();
});

describe('请求拦截器：自动携带 Bearer 令牌', () => {
  it('store 里有 accessToken → 自动加上 Authorization 头', () => {
    injectStore(makeStore({ accessToken: 'tok-123' }));
    const config = requestOnFulfilled({ headers: {} });

    expect(config.headers.Authorization).toBe('Bearer tok-123');
  });

  it('未登录（没有 accessToken）→ 不加 Authorization 头', () => {
    injectStore(makeStore({ accessToken: '' }));
    const config = requestOnFulfilled({ headers: {} });

    expect(config.headers.Authorization).toBeUndefined();
  });
});

describe('响应拦截器：401 自动刷新令牌并重放请求', () => {
  it('有 refreshToken → 刷新成功后用新令牌重放原请求', async () => {
    const store = makeStore({ accessToken: 'old-a', refreshToken: 'r1', user: { id: 1 } });
    injectStore(store);

    vi.spyOn(axios, 'post').mockResolvedValue({ data: { access: 'new-a', refresh: 'new-r' } });

    // 假 adapter：拦住"重放"的那次请求，记录它实际带的令牌，然后直接返回成功
    let replayedAuth = null;
    api.defaults.adapter = async (config) => {
      replayedAuth = config.headers.Authorization;
      return { data: { ok: true }, status: 200, statusText: 'OK', headers: {}, config };
    };

    const originalRequest = { headers: {}, url: '/users/me/' };
    const res = await responseOnRejected({ config: originalRequest, response: { status: 401 } });

    // 1) 用正确的参数请求了刷新接口
    expect(axios.post).toHaveBeenCalledWith('/api/auth/token/refresh/', { refresh: 'r1' });
    // 2) 把新令牌写回了 store（否则用户会一直用过期令牌打转）
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'user/login',
        payload: expect.objectContaining({ access: 'new-a' }),
      }),
    );
    // 3) 重放时带的是**新**令牌，而不是原来那个过期的
    expect(replayedAuth).toBe('Bearer new-a');
    // 4) 调用方最终拿到的是成功响应，业务代码无感知
    expect(res.status).toBe(200);
  });

  it('没有 refreshToken（比如已登出）→ 登出并跳到登录页', async () => {
    const store = makeStore({ accessToken: 'a1', refreshToken: '' });
    injectStore(store);

    const err = { config: { headers: {} }, response: { status: 401 } };
    await expect(responseOnRejected(err)).rejects.toBe(err);

    expect(store.dispatch).toHaveBeenCalledWith({ type: 'user/logout' });
    expect(window.location.href).toBe('/login');
  });

  it('刷新令牌本身也失败 → 同样登出并跳登录页，不把错误吞掉', async () => {
    const store = makeStore({ accessToken: 'a1', refreshToken: 'bad-token' });
    injectStore(store);

    vi.spyOn(axios, 'post').mockRejectedValue(new Error('refresh token 已失效'));

    const err = { config: { headers: {} }, response: { status: 401 } };
    await expect(responseOnRejected(err)).rejects.toBeTruthy();

    expect(store.dispatch).toHaveBeenCalledWith({ type: 'user/logout' });
    expect(window.location.href).toBe('/login');
  });

  it('同一个请求只重试一次，不会无限循环', async () => {
    const store = makeStore({ accessToken: 'a1', refreshToken: 'r1' });
    injectStore(store);

    // _retry 已被标记为 true，说明这是重放后的第二次 401，不能再刷新了
    const err = { config: { headers: {}, _retry: true }, response: { status: 401 } };
    await expect(responseOnRejected(err)).rejects.toBe(err);

    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it('非 401 的错误（如 500）原样抛出，不误触发登出', async () => {
    const store = makeStore({ accessToken: 'a1', refreshToken: 'r1' });
    injectStore(store);

    const err = { config: { headers: {} }, response: { status: 500 } };
    await expect(responseOnRejected(err)).rejects.toBe(err);

    expect(store.dispatch).not.toHaveBeenCalled();
  });
});
