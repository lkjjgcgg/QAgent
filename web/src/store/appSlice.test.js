import { describe, it, expect, beforeEach, vi } from 'vitest';
import appReducer, { setLanguage } from './appSlice.js';

/**
 * appSlice 管的是界面语言。它做三件事，缺一不可：
 *   1. 更新 Redux 里的 state（界面立刻切换）
 *   2. 写 localStorage（刷新页面不丢）
 *   3. 同步 <html lang>（屏幕阅读器、搜索引擎据此判断页面语言）
 * 第 3 件事最容易被漏掉，所以专门写用例盯住。
 */
describe('appSlice —— 切换语言', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.setAttribute('lang', 'zh-cn');
  });

  it('setLanguage 同时更新 state、localStorage 和 <html lang>', () => {
    const state = appReducer({ language: 'zh-cn' }, setLanguage('en'));

    expect(state.language).toBe('en');
    expect(localStorage.getItem('app-lang')).toBe('en');
    expect(document.documentElement.getAttribute('lang')).toBe('en');
  });

  it('从英文切回中文同样生效', () => {
    const state = appReducer({ language: 'en' }, setLanguage('zh-cn'));

    expect(state.language).toBe('zh-cn');
    expect(localStorage.getItem('app-lang')).toBe('zh-cn');
    expect(document.documentElement.getAttribute('lang')).toBe('zh-cn');
  });
});

/**
 * 初始状态是在**模块加载的那一刻**读 localStorage 算出来的，
 * 所以想测它必须先 vi.resetModules() 再重新 import —— 否则读到的还是第一次加载时的结果。
 */
describe('appSlice —— 初始状态（刷新页面后恢复语言）', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  it('没有历史选择 → 默认简体中文', async () => {
    const reducer = (await import('./appSlice.js')).default;
    expect(reducer(undefined, { type: '@@INIT' }).language).toBe('zh-cn');
  });

  it('有历史选择 → 沿用上次的语言', async () => {
    localStorage.setItem('app-lang', 'en');
    const reducer = (await import('./appSlice.js')).default;
    expect(reducer(undefined, { type: '@@INIT' }).language).toBe('en');
  });
});
