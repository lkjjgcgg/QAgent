/**
 * 主题生效性校验 —— 两道防线，断言 src/theme/antdTheme.js 的令牌真的被 Ant Design 接受
 * =============================================================================
 * 【为什么需要这个脚本】
 * Ant Design 的主题配置是**纯数据对象**。token 名字打错一个字母
 * （比如把 colorPrimary 写成 colorPrimaryColor），JS 不报任何错，
 * antd 只是"找不到这个键，用默认值"—— 样式**静默失效**，肉眼看不出原因。
 *
 * 所以这里设三道防线：
 *   防线 A：全局令牌的**值** → 用 antd 的 theme.getDesignToken() 反算最终生效值，逐项比对。
 *   防线 B：全局令牌的**键名** → 拿 antd 空配置下的完整令牌表当全集，断言我写的键都存在。
 *   防线 C：组件令牌的**键名** → 从 antd 自带的 .d.ts 类型定义里读出每个组件合法的 token
 *           键名，断言我写的键全部合法。
 *           （getDesignToken 不展开 components，所以防线 A / B 覆盖不到它。）
 *
 * 【这个脚本不能证明什么】
 * 它不渲染页面，所以不能证明"视觉效果一定好看"。视觉部分需要人眼看浏览器。
 *
 * 运行：npm run check:theme
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { theme } from 'antd';
import config from '../src/theme/antdTheme.js';
// 用别名导入，避免和下面 theme.getDesignToken() 算出来的变量重名
import designTokens from '../src/theme/tokens.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const ANTD_ES = path.join(here, '..', 'node_modules', 'antd', 'es');

let failed = 0;
const fail = (msg) => {
  failed += 1;
  console.log(` FAIL  ${msg}`);
};
const pass = (msg) => console.log(`  OK   ${msg}`);

/* =============================================================================
 * 防线 A：全局令牌的值
 * ========================================================================== */
const tokens = theme.getDesignToken(config);

/** [token 名, 预期值, 说明] */
const globalExpectations = [
  // —— 品牌色：整套系统只允许存在一个强调色 ——
  ['colorPrimary', '#0066cc', 'Action Blue'],
  ['colorPrimaryHover', '#0071e3', 'Focus Blue'],
  ['colorLink', '#0066cc', '行内链接用同一个蓝，不另起炉灶'],

  // —— 文字梯度 ——
  ['colorText', '#1d1d1f', '近黑，不用纯黑'],
  ['colorTextHeading', '#1d1d1f', '标题同色'],
  ['colorTextSecondary', '#333333', '次要文字'],
  ['colorTextTertiary', '#7a7a7a', '三级文字'],

  // —— 描边 ——
  ['colorBorder', '#e0e0e0', '发丝线'],
  ['colorBorderSecondary', '#f0f0f0', '极淡分隔线'],

  // —— 表面 ——
  ['colorBgLayout', '#f5f5f7', '后台底色 = 羊皮纸白'],
  ['colorBgContainer', '#ffffff', '卡片底 = 纯白'],
  ['colorBgSpotlight', '#272729', '深色气泡'],

  // —— 语义色：Apple 系统色（DESIGN.md 未定义，属合理补充）——
  ['colorSuccess', '#34c759', 'system green'],
  ['colorWarning', '#ff9f0a', 'system orange'],
  ['colorError', '#ff3b30', 'system red'],
  ['colorInfo', '#0066cc', 'info 复用主色，不引入第二个强调色'],

  // —— 圆角阶梯：只用 DESIGN.md 已有的档位 ——
  ['borderRadiusXS', 5, 'rounded.xs'],
  ['borderRadiusSM', 8, 'rounded.sm'],
  ['borderRadius', 8, '控件基础圆角'],
  ['borderRadiusLG', 11, 'rounded.md'],
  ['borderRadiusOuter', 18, 'rounded.lg'],

  // —— 字号：后台基准 14px，标题走 28 / 21 / 17 ——
  ['fontSize', 14, '后台正文基准（有意偏离 DESIGN.md 的 17px）'],
  ['fontSizeSM', 12, 'fine-print 档'],
  ['fontSizeLG', 16, ''],
  ['fontSizeHeading1', 28, 'DESIGN.md 的 lead 档'],
  ['fontSizeHeading2', 21, 'DESIGN.md 的 tagline 档'],
  ['fontSizeHeading3', 17, 'DESIGN.md 的 body 档'],

  // —— 字重：阶梯是 300/400/600/700，刻意没有 500 ——
  ['fontWeightStrong', 600, '中等强调一律 600，不用 500'],

  // —— 控件高度 ——
  ['controlHeight', 36, '后台舒适度与密度的折中（antd 默认 32 偏挤）'],
  ['controlHeightSM', 28, ''],
  ['controlHeightLG', 44, '对齐 DESIGN.md 的最小点击区域'],

  // —— 投影：三级投影（卡片/分段控件自带的那层）必须彻底关掉 ——
  ['boxShadowTertiary', 'none', '装饰性阴影，按规范去掉'],
];

console.log('=== 防线 A · 全局令牌的实际生效值 ===');
for (const [key, want, note] of globalExpectations) {
  const got = tokens[key];
  if (got === want) pass(`${key.padEnd(22)} = ${String(got).padEnd(10)} ${note}`);
  else fail(`${key.padEnd(22)} 期望 ${want}，实际 ${got}  ${note}`);
}

/* =============================================================================
 * 字体栈断言（字体栈是一串字符串，单独校验它的组成成分）
 * ========================================================================== */
console.log('\n=== 防线 A · 字体栈组成 ===');
const fontChecks = [
  ['-apple-system', 'Apple 平台解析成真 SF Pro'],
  ['BlinkMacSystemFont', 'Chrome on macOS'],
  ['PingFang SC', 'macOS / iOS 中文字体'],
  ['Microsoft YaHei', 'Windows 中文字体'],
  ['system-ui', '最终兜底'],
];
for (const [frag, note] of fontChecks) {
  if (String(tokens.fontFamily).includes(frag)) pass(`字体栈含 ${frag.padEnd(18)} ${note}`);
  else fail(`字体栈缺少 ${frag}（${note}）`);
}

/* =============================================================================
 * 防线 A · 反向断言
 * 这几个值一旦出现，就说明主题根本没生效（antd 回落到了默认值）
 * ========================================================================== */
console.log('\n=== 防线 A · 危险值反查（出现即说明主题未生效）===');
const dangerous = [
  ['colorPrimary', '#1677ff', 'antd 默认蓝'],
  ['borderRadius', 6, 'antd 默认圆角'],
  ['fontSize', 17, 'DESIGN.md 的营销页正文尺寸不该出现在后台配置里'],
  ['colorBgLayout', '#f5f5f5', 'antd 默认灰底'],
];
for (const [key, bad, note] of dangerous) {
  if (tokens[key] !== bad) pass(`${key} ≠ ${bad}  (${note})`);
  else fail(`${key} 仍等于 ${bad} —— ${note}`);
}

/* =============================================================================
 * 防线 B：全局令牌的键名合法性
 * 防线 A 只能断言"我期望的键值对不对"，管不住"我多写了一个拼错的键"。
 * 这里用 antd 在**空配置**下算出的完整令牌表当作合法键名的全集，
 * 断言我写的每一个全局键都真实存在。
 * ========================================================================== */
console.log('\n=== 防线 B · 全局令牌键名合法性 ===');
const allGlobalKeys = new Set(Object.keys(theme.getDesignToken({})));
const unknownGlobal = Object.keys(config.token ?? {}).filter((k) => !allGlobalKeys.has(k));
if (unknownGlobal.length === 0) {
  pass(`token 块 ${Object.keys(config.token ?? {}).length} 个键全部合法`);
} else {
  for (const k of unknownGlobal) {
    fail(`token.${k} 不是合法的全局 token 键（antd 会静默忽略它）`);
  }
}

/* =============================================================================
 * 防线 C：组件令牌的键名合法性
 * 方法：从 antd 的 .d.ts 里读出每个组件自己的 ComponentToken 接口字段名。
 *       组件令牌里也允许覆盖任意全局令牌，所以合法集合 = 组件字段 ∪ 全局字段。
 * ========================================================================== */

/** Menu → menu，InputNumber → input-number */
const toDirName = (comp) => comp.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

/** 收集某个组件合法的 token 键名 */
function collectValidKeys(component) {
  const styleDir = path.join(ANTD_ES, toDirName(component), 'style');
  const keys = new Set();
  for (const file of ['token.d.ts', 'index.d.ts']) {
    const p = path.join(styleDir, file);
    if (!fs.existsSync(p)) continue;
    const src = fs.readFileSync(p, 'utf8');
    // 匹配接口字段声明，例如 "    itemSelectedBg?: string;" 或 "    bodyPadding: number;"
    for (const m of src.matchAll(/^\s{4}([a-zA-Z][a-zA-Z0-9]*)\??:\s/gm)) {
      keys.add(m[1]);
    }
  }
  // 组件令牌还可以覆盖任意全局令牌
  for (const k of Object.keys(tokens)) keys.add(k);
  return { keys, found: keys.size > 0 };
}

console.log('\n=== 防线 C · 组件令牌键名合法性 ===');
for (const [component, overrides] of Object.entries(config.components ?? {})) {
  const { keys, found } = collectValidKeys(component);

  if (!found) {
    fail(`${component}: 找不到它的类型定义目录（${toDirName(component)}），无法校验`);
    continue;
  }

  const bad = Object.keys(overrides).filter((k) => !keys.has(k));
  if (bad.length === 0) {
    pass(`${component.padEnd(12)} ${String(Object.keys(overrides).length).padStart(2)} 个键全部合法`);
  } else {
    for (const k of bad) {
      fail(`${component}.${k} 不是合法的 token 键（antd 会静默忽略它）`);
    }
  }
}

/* =============================================================================
 * 防线 D：tokens.js（JS）与 index.css（CSS 变量）是否漂移
 * -----------------------------------------------------------------------------
 * 色值在两边各写了一份：JS 版本给 antd 用，CSS 变量给自定义组件用。
 * 这是必然会出错的场景 —— 改了 tokens.js 忘了同步 index.css，
 * 结果 antd 组件变蓝了、自定义组件还是旧色，而且没有任何报错。
 * 这里断言两边的值完全一致。
 * ========================================================================== */
console.log('\n=== 防线 D · tokens.js ↔ index.css 变量一致性 ===');
const cssPath = path.join(here, '..', 'src', 'index.css');
const cssSource = fs.readFileSync(cssPath, 'utf8');
const cssVars = new Map();
for (const m of cssSource.matchAll(/--q-([a-z0-9-]+)\s*:\s*([^;]+);/g)) {
  cssVars.set(`--q-${m[1]}`, m[2].trim());
}

/**
 * camelCase → kebab-case。
 * 要处理两种边界：字母→大写（inkMuted → ink-muted）和字母→数字（Muted80 → Muted-80）。
 * 少了第二种，inkMuted80 会被转成 ink-muted80，和 CSS 里的 --q-ink-muted-80 对不上。
 */
const toKebab = (s) =>
  s
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([a-zA-Z])(\d)/g, '$1-$2')
    .toLowerCase();

/** 需要两边一致、且 index.css 里确实声明了的变量 */
const varExpectations = [
  ...Object.entries(designTokens.colors).map(([k, v]) => [`--q-${toKebab(k)}`, v]),
  // 圆角只声明了 5 档（none / full 与别的档重复，CSS 里不单列）
  ...[
    ['xs', designTokens.rounded.xs],
    ['sm', designTokens.rounded.sm],
    ['md', designTokens.rounded.md],
    ['lg', designTokens.rounded.lg],
    ['pill', designTokens.rounded.pill],
  ].map(([k, v]) => [`--q-radius-${k}`, `${v}px`]),
  ...Object.entries(designTokens.spacing).map(([k, v]) => [`--q-space-${k}`, `${v}px`]),
  // 字号：tokens.js 定义的档位比 CSS 里声明的多，这里只校验 CSS 声明了的那几个
  ['--q-fs-fine', `${designTokens.fontSize.fine}px`],
  ['--q-fs-base', `${designTokens.fontSize.base}px`],
  ['--q-fs-body', `${designTokens.fontSize.body}px`],
  ['--q-fs-tagline', `${designTokens.fontSize.tagline}px`],
  ['--q-fs-lead', `${designTokens.fontSize.lead}px`],
  ['--q-fs-display-lg', `${designTokens.fontSize.displayLg}px`],
  // 字距
  ['--q-ls-display', designTokens.letterSpacing.displayLg],
  ['--q-ls-heading', designTokens.letterSpacing.heading],
  ['--q-ls-body', designTokens.letterSpacing.body],
  // 投影
  ['--q-shadow-product', designTokens.shadow.product],
  // 布局尺寸
  ['--q-nav-h', `${designTokens.layout.globalNavHeight}px`],
  ['--q-subnav-h', `${designTokens.layout.subNavHeight}px`],
  ['--q-sider-w', `${designTokens.layout.siderWidth}px`],
  ['--q-content-max', `${designTokens.layout.contentMaxWidth}px`],
];

const drift = [];
for (const [name, want] of varExpectations) {
  const got = cssVars.get(name);
  if (got === undefined) drift.push(`${name} 在 index.css 里缺失（tokens.js 是 ${want}）`);
  else if (got.toLowerCase() !== String(want).toLowerCase())
    drift.push(`${name} 两边不一致：tokens.js=${want}，index.css=${got}`);
}

// 字体栈：两边是同一串字体，逐段比对
for (const frag of ['-apple-system', 'PingFang SC', 'Microsoft YaHei', 'system-ui']) {
  if (!String(cssVars.get('--q-font-sans') || '').includes(frag))
    drift.push(`--q-font-sans 缺少「${frag}」`);
}
if (!designTokens.fontStack.includes('PingFang SC')) drift.push('tokens.fontStack 缺少中文字体回退');

if (drift.length === 0) {
  pass(`比对 ${varExpectations.length} 个变量，与 tokens.js 完全一致`);
} else {
  for (const d of drift) fail(d);
}

/* =============================================================================
 * 汇总
 * ========================================================================== */
console.log('');
if (failed === 0) {
  console.log('✅ 全部通过：全局令牌值正确，组件令牌键名合法。');
  console.log('   视觉部分请打开浏览器确认：npm run dev');
} else {
  console.log(`❌ 有 ${failed} 项未通过，上面标 FAIL 的就是问题点。`);
}
process.exit(failed === 0 ? 0 : 1);
