/**
 * 设计令牌（Design Tokens）—— 全项目唯一的色值 / 圆角 / 字号来源
 * =============================================================================
 * 本文件是 web/DESIGN.md（Apple 设计体系分析）的可执行版本。
 * DESIGN.md 里写的是 YAML，浏览器不认识，所以翻译成 JS 常量。
 *
 * 【为什么要有这个文件】
 * 改造前，项目里 25 个文件散落着 40+ 种硬编码颜色（#1677ff / #e5e7eb / #2c3e50 …），
 * 想统一换一个主色得翻遍所有文件。现在所有色值只在这里定义一次，
 * 其余地方一律引用常量（或 index.css 里的 --q-* 变量）。
 *
 * 【命名对照】
 * 本文件的对象键名刻意与 DESIGN.md 的 YAML 保持一致（primary / canvas / hairline …），
 * 方便你对照阅读。前缀 q = QAgent。
 */

/* ---------------------------------------------------------------------------
 * 1. 颜色
 * ------------------------------------------------------------------------- */
export const colors = {
  // —— 品牌与强调色（整套系统只有一个强调色）——
  primary: '#0066cc', // Action Blue：所有可点击元素的颜色，别的地方不许再用第二个品牌色
  primaryFocus: '#0071e3', // Focus Blue：键盘焦点环
  primaryOnDark: '#2997ff', // Sky Link Blue：深色底上的行内链接（Action Blue 在深底上会看不见）

  // —— 文字 ——
  ink: '#1d1d1f', // 近黑，所有大标题与正文。不用纯黑，让页面保持"摄影感"而非"印刷感"
  inkMuted80: '#333333', // 次要正文
  inkMuted48: '#7a7a7a', // 禁用文字 / 法律声明小字
  bodyOnDark: '#ffffff', // 深色块上的文字
  bodyMuted: '#cccccc', // 深色块上的次要文字

  // —— 表面（背景）——
  canvas: '#ffffff', // 纯白，主画布
  canvasParchment: '#f5f5f7', // 羊皮纸白，Apple 标志性的"米白"，用于页面底与交替色块
  surfacePearl: '#fafafc', // 珍珠白，比羊皮纸更浅，用于次要按钮填充
  surfaceTile1: '#272729', // 近黑块 1
  surfaceTile2: '#2a2a2c', // 近黑块 2（微亮一档，用于相邻深块之间制造层次）
  surfaceTile3: '#252527', // 近黑块 3（微暗一档）
  surfaceBlack: '#000000', // 纯黑，只用于全局导航栏

  // —— 分隔线与描边 ——
  dividerSoft: '#f0f0f0',
  hairline: '#e0e0e0', // 1px 发丝线

  // —— 深色块上的强调色 ——
  onPrimary: '#ffffff',
  onDark: '#ffffff',
};

/* ---------------------------------------------------------------------------
 * 2. 圆角阶梯
 * DESIGN.md 明确要求"不要混用圆角语法"：紧凑控件用 sm，工具卡用 lg，胶囊用 pill，
 * 中间不许随手加一个 12px 之类。所以这里只保留 5 个档位。
 * ------------------------------------------------------------------------- */
export const rounded = {
  none: 0,
  xs: 5,
  sm: 8, // 紧凑控件（输入框、小按钮）—— antd 的基础圆角
  md: 11, // 珍珠白胶囊按钮
  lg: 18, // 工具卡片
  pill: 9999, // 胶囊：主 CTA / 搜索框 / 配置器选项
  full: 9999,
};

/* ---------------------------------------------------------------------------
 * 3. 间距
 * DESIGN.md 的基准单位是 8px，结构布局一律吸附到 8/12/16/20/24。
 * ------------------------------------------------------------------------- */
export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 17,
  lg: 24,
  xl: 32,
  xxl: 48,
  section: 80, // 营销页区块留白；后台用不到这么大的值
};

/* ---------------------------------------------------------------------------
 * 4. 字体
 * ------------------------------------------------------------------------- */

/**
 * 字体栈。
 * SF Pro 是 Apple 私有字体，网页上不能直接引用，所以要按 DESIGN.md 的建议：
 *   1) 先写 system-ui / -apple-system —— 在 macOS / iOS 上会自动解析成真正的 SF Pro；
 *   2) 后面接非 Apple 平台的替代字体；
 *   3) 最后必须接中文字体（本项目界面是中文，漏了这步会让中文掉进浏览器默认宋体）。
 */
export const fontStack =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", ' +
  '"Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", ' +
  'system-ui, sans-serif';

export const fontStackCode =
  '"SF Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, "Courier New", monospace';

/**
 * 字号阶梯。
 *
 * ⚠️ 这里是**有意偏离** DESIGN.md 的一处，理由必须说清楚：
 * DESIGN.md 规定正文 17px，那是**营销页**的节奏（一屏只讲一个产品）。
 * 本项目是数据管理后台，一屏要放表格 + 表单 + 侧栏，14px 才是后台的正确基准。
 * 所以策略是：保留 DESIGN.md 的字号**比例关系**与字重阶梯（400 / 600，绝不出现 500），
 * 但整体下调一档，把 17px 留给区块标题而不是正文。
 */
export const fontSize = {
  micro: 10,
  fine: 12, // 页脚 / 辅助说明
  sm: 13,
  base: 14, // 后台正文基准（DESIGN.md 的 caption 档）
  md: 15,
  lg: 16,
  body: 17, // DESIGN.md 的 body 档，本项目用于卡片标题 / 强调正文
  tagline: 21, // 小节标题
  lead: 28, // 区块标题
  displayLg: 40, // 页面主标题
  hero: 56, // 营销页巨标题（本项目暂未使用，保留以备首页）
};

/**
 * 字重阶梯：300 / 400 / 600 / 700，**刻意没有 500**。
 * DESIGN.md 特别强调：中等强调一律用 600，不要用 500。
 */
export const fontWeight = {
  light: 300,
  regular: 400,
  semibold: 600,
  bold: 700,
};

/**
 * 字距（letter-spacing）。
 * "Apple tight" 的签名感就来自大字号下的负字距。
 * 规则：17px 及以上的标题收紧，12px 及以下绝不收紧。
 */
export const letterSpacing = {
  displayLg: '-0.28px',
  heading: '-0.374px',
  body: '-0.224px',
  caption: '-0.224px',
  none: '0',
};

/* ---------------------------------------------------------------------------
 * 5. 投影
 * DESIGN.md 的核心克制原则：**整个系统只有一条投影**，
 * 而且只允许用在"产品图立在表面上"这一种场景 —— 绝不加在卡片、按钮、文字上。
 * ------------------------------------------------------------------------- */
export const shadow = {
  product: 'rgba(0, 0, 0, 0.22) 3px 5px 30px 0', // 唯一允许的产品投影
  none: 'none',
  // 浮层（下拉菜单 / 气泡）必须有投影，否则看不出层级，这里用极克制的一档。
  // 这是对 DESIGN.md 的合理让步，不算破坏"不加装饰阴影"的原则。
  overlay: '0 2px 8px rgba(0, 0, 0, 0.06), 0 8px 24px rgba(0, 0, 0, 0.08)',
  hairlineRing: '0 0 0 1px rgba(0, 0, 0, 0.04)',
};

/* ---------------------------------------------------------------------------
 * 6. 布局常量
 * ------------------------------------------------------------------------- */
export const layout = {
  /** 全局导航栏高度。DESIGN.md 写 44px（纯图标导航），本项目要放 40px 徽标 + 5 个菜单 + 头像，放宽到 52px。 */
  globalNavHeight: 52,
  /** 副导航栏高度，DESIGN.md 规定 52px，这里取 48px 以贴合后台密度。 */
  subNavHeight: 48,
  /** 侧栏宽度 */
  siderWidth: 240,
  /** 内容区最大宽度（DESIGN.md 的产品网格上限 1440px） */
  contentMaxWidth: 1440,
  /** 最小点击区域。DESIGN.md 规定 44×44px，对应 antd 的 controlHeightLG。 */
  touchTarget: 44,
};

/** 把十六进制色值转成带透明度的 rgba()，用于"主色的 8% 底"这类场景。 */
export function alpha(hex, opacity) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/* ---------------------------------------------------------------------------
 * 7. 默认导出：一次性拿到全部令牌
 * ------------------------------------------------------------------------- */
const tokens = {
  colors,
  rounded,
  spacing,
  fontStack,
  fontStackCode,
  fontSize,
  fontWeight,
  letterSpacing,
  shadow,
  layout,
};

export default tokens;
