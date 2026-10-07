/**
 * Vitest 全局测试环境准备（由 vite.config.js 的 test.setupFiles 指定）
 * =============================================================================
 * 【为什么需要这个文件】
 * 被测代码跑在浏览器里，有些浏览器行为在 jsdom（Node 里的假浏览器）中要么没有、
 * 要么是只读的。这些东西必须在跑测试之前统一替换掉，否则用例会以一堆
 * "not implemented" 之类的噪音失败，而不是因为业务逻辑真的错了。
 */

/*
 * window.location 在 jsdom 里是只读的：一旦有代码执行 `window.location.href = '/login'`，
 * jsdom 会打印 "Not implemented: navigation (except hash changes)"，
 * 而且读回来的 href 仍是 'about:blank'，导致跳转断言没法写。
 *
 * services/api.js 在「令牌刷新失败」的分支里正好会这么做，
 * 所以这里换成一个可写的替身：既不发真实跳转，又能在用例里断言跳到了哪。
 */
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'location', {
    configurable: true,
    writable: true,
    value: {
      href: '',
      pathname: '/',
      search: '',
      hash: '',
      assign() {},
      replace() {},
      reload() {},
    },
  });
}
