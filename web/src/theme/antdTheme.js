/**
 * Ant Design v6 主题映射 —— 把 src/theme/tokens.js 的设计令牌"翻译"成 antd 认识的格式
 * =============================================================================
 * 【它解决什么问题】
 * 项目里有 40+ 个页面，全部由 Ant Design 组件搭建。这些组件的外观由一个叫
 * "主题（theme）"的东西统一控制。改造前项目**没有配置主题**，所以 antd 跑在默认值上：
 * 默认蓝 #1677ff、默认圆角 6px —— 和 DESIGN.md 完全无关。
 *
 * 现在只要在应用最外层套一个 <ConfigProvider theme={antdTheme}>，
 * 40+ 个页面的主色、圆角、字体、控件高度会**一次性**全部换掉，不用改任何页面代码。
 * 这就是为什么"主题层"性价比最高。
 *
 * 【两个层次的 token】
 *   token      —— 全局令牌，影响所有组件（主色、字体、圆角、控件高度…）
 *   components —— 组件级覆盖，只影响某一个组件（比如只改 Menu 的选中色）
 * 规则：能放全局就放全局，只有"这个组件需要特殊处理"时才写进 components。
 */

import { theme as antdTheme } from 'antd';
// 注意：这里写全了 .js 扩展名。Vite 允许省略，但 scripts/check-theme.mjs 是用
// Node 原生 ESM 直接跑这个模块的，而 Node 要求显式扩展名。
import {
  colors,
  rounded,
  fontStack,
  fontStackCode,
  fontSize,
  fontWeight,
  shadow,
  layout,
  alpha,
} from './tokens.js';

/**
 * Apple 系统语义色。
 *
 * DESIGN.md 只定义了蓝色这一个品牌强调色，没定义成功/警告/错误的红黄绿 ——
 * 因为营销页不需要它们。但本项目的测试报告、执行状态、告警必须要语义色，
 * 所以这里补上 Apple 平台的系统色（iOS / macOS 用的就是这几个值）。
 */
const semantic = {
  success: '#34c759', // Apple system green
  warning: '#ff9f0a', // Apple system orange
  error: '#ff3b30', // Apple system red
  // DESIGN.md 的核心禁令："不要引入第二个强调色"。
  // 所以 info（信息提示）直接用主色，而不是再造一个青色。
  info: colors.primary,
};

/**
 * 全局令牌。
 */
const token = {
  /* ---------- 品牌与强调色 ---------- */
  colorPrimary: colors.primary,
  // DESIGN.md：按压态不换色值，而是用 transform: scale(0.95) 表达（写在 index.css 里）。
  // 所以这里 active 与默认同色，避免出现"按下去变了个颜色"的廉价感。
  colorPrimaryHover: colors.primaryFocus,
  colorPrimaryActive: colors.primary,
  // 键盘焦点环用的更亮的蓝（Focus Blue）
  colorPrimaryBorder: colors.primaryFocus,

  colorLink: colors.primary,
  colorLinkHover: colors.primaryFocus,
  colorLinkActive: colors.primary,

  /* ---------- 语义色 ---------- */
  colorSuccess: semantic.success,
  colorWarning: semantic.warning,
  colorError: semantic.error,
  colorInfo: semantic.info,

  /* ---------- 文字 ---------- */
  // DESIGN.md 用 #1d1d1f（近黑）而不是纯黑，让页面保持"摄影感"而非"印刷感"
  colorText: colors.ink,
  colorTextHeading: colors.ink,
  colorTextSecondary: colors.inkMuted80,
  colorTextTertiary: colors.inkMuted48,
  // antd 需要 4 级文字梯度，DESIGN.md 只定了 3 级，
  // 第 4 级（占位符 / 禁用）取 Apple 官网现役的 #a1a1a6，与调色板同族。
  colorTextQuaternary: '#a1a1a6',
  colorTextPlaceholder: '#86868b',
  colorTextDisabled: '#a1a1a6',
  colorTextDescription: colors.inkMuted48,
  colorTextLabel: colors.inkMuted80,
  colorTextLightSolid: '#ffffff',

  /* ---------- 表面 ---------- */
  colorBgBase: colors.canvas,
  // 整个后台的"墙"用羊皮纸白 #f5f5f7 —— DESIGN.md 里最标志性的一档
  colorBgLayout: colors.canvasParchment,
  colorBgContainer: colors.canvas,
  colorBgElevated: colors.canvas,
  // 深色气泡（Tooltip 等）
  colorBgSpotlight: colors.surfaceTile1,
  colorBgMask: 'rgba(0, 0, 0, 0.48)',

  /* ---------- 描边与填充 ---------- */
  colorBorder: colors.hairline,
  colorBorderSecondary: colors.dividerSoft,
  // 表格行分割线：DESIGN.md 的分隔线常以 rgba(0,0,0,0.06) 呈现，比实色更"消失"
  colorSplit: 'rgba(0, 0, 0, 0.06)',
  colorFill: 'rgba(0, 0, 0, 0.06)',
  colorFillSecondary: 'rgba(0, 0, 0, 0.04)',
  colorFillTertiary: 'rgba(0, 0, 0, 0.03)',
  colorFillQuaternary: 'rgba(0, 0, 0, 0.02)',
  // 主色的 8% 底：用于菜单选中项、表格选中行这类"轻高亮"
  colorPrimaryBg: alpha(colors.primary, 0.08),
  colorPrimaryBgHover: alpha(colors.primary, 0.12),

  /* ---------- 字体 ---------- */
  fontFamily: fontStack,
  fontFamilyCode: fontStackCode,
  fontSize: fontSize.base, // 14px：后台基准（DESIGN.md 是 17px，已说明偏离理由）
  fontSizeSM: fontSize.fine, // 12px
  fontSizeLG: fontSize.lg, // 16px
  fontSizeXL: fontSize.body, // 17px
  // 标题阶梯沿用 DESIGN.md 自己的三个值：lead 28 / tagline 21 / body 17
  fontSizeHeading1: fontSize.lead, // 28
  fontSizeHeading2: fontSize.tagline, // 21
  fontSizeHeading3: fontSize.body, // 17
  fontSizeHeading4: fontSize.md, // 15
  fontSizeHeading5: fontSize.base, // 14
  lineHeight: 1.5,
  lineHeightLG: 1.4,
  lineHeightSM: 1.5,
  lineHeightHeading1: 1.25,
  lineHeightHeading2: 1.3,
  lineHeightHeading3: 1.35,
  lineHeightHeading4: 1.4,
  lineHeightHeading5: 1.4,
  /**
   * DESIGN.md 特别强调：字重阶梯是 300 / 400 / 600 / 700，**刻意没有 500**。
   * 中等强调一律用 600。antd 默认 fontWeightStrong 就是 600，这里显式写出来提醒后人别改成 500。
   */
  fontWeightStrong: fontWeight.semibold,

  /* ---------- 圆角 ---------- */
  // 只用 DESIGN.md 圆角阶梯里已有的值，不新增中间档
  borderRadiusXS: rounded.xs, // 5
  borderRadiusSM: rounded.sm, // 8
  borderRadius: rounded.sm, // 8  ← 控件（输入框/按钮）基础圆角
  borderRadiusLG: rounded.md, // 11 ← 卡片/弹窗
  borderRadiusOuter: rounded.lg, // 18 ← 最外层容器

  /* ---------- 控件高度 ---------- */
  // 36px 是"后台舒适度"与"数据密度"的折中值（antd 默认 32 偏挤）
  controlHeight: 36,
  controlHeightSM: 28,
  // 44px 对齐 DESIGN.md 规定的最小点击区域（触屏友好）
  controlHeightLG: layout.touchTarget,
  controlHeightXS: 20,

  /* ---------- 投影 ---------- */
  /**
   * DESIGN.md 的核心克制原则：整个系统只有一条投影，且只允许用在产品图上，
   * 绝不允许加在卡片、按钮、文字上。
   * 但下拉菜单、气泡这类"浮层"如果没有投影就看不出层级，属于功能性必需，
   * 所以这里用极淡的一档，而不是完全去掉。
   */
  boxShadow: shadow.overlay,
  boxShadowSecondary: shadow.overlay,
  // 三级投影直接关掉 —— 它是卡片/分段控件默认带的那层阴影，属于"装饰性阴影"，按规范必须去掉
  boxShadowTertiary: shadow.none,

  /* ---------- 动效 ---------- */
  // DESIGN.md 的按压反馈是 scale(0.95)，需要一点过渡时间让它不突兀
  motionDurationMid: '0.16s',

  wireframe: false,
};

/**
 * 组件级覆盖。
 */
const components = {
  /* ========== 布局壳 ========== */
  Layout: {
    // 顶栏用纯黑 —— DESIGN.md 说纯黑只出现在全局导航栏这一处
    headerBg: colors.surfaceBlack,
    headerColor: colors.bodyOnDark,
    headerHeight: layout.globalNavHeight,
    headerPadding: '0 20px',
    // 后台的"墙"是羊皮纸白
    bodyBg: colors.canvasParchment,
    footerBg: colors.canvasParchment,
    siderBg: colors.canvas,
    lightSiderBg: colors.canvas,
  },

  /* ========== 导航菜单 ========== */
  Menu: {
    /* ---- 亮色主题（左侧栏菜单）---- */
    itemBg: 'transparent',
    itemColor: colors.inkMuted80,
    itemHoverBg: 'rgba(0, 0, 0, 0.04)',
    itemHoverColor: colors.ink,
    // 选中项：主色文字 + 主色 8% 底，不用整块蓝底（蓝底太重，会抢走内容注意力）
    itemSelectedBg: alpha(colors.primary, 0.08),
    itemSelectedColor: colors.primary,
    itemActiveBg: alpha(colors.primary, 0.12),
    itemBorderRadius: rounded.sm,
    itemHeight: 38,
    itemMarginBlock: 2,
    itemPaddingInline: 12,
    subMenuItemBg: 'transparent',
    groupTitleColor: colors.inkMuted48,
    groupTitleFontSize: fontSize.fine,
    // 关掉选中项旁边那条竖线 —— DESIGN.md 的选中反馈靠"底色 + 主色文字"，不靠指示条
    activeBarBorderWidth: 0,
    activeBarWidth: 0,

    /* ---- 水平菜单（黑色顶栏上的那一条）---- */
    horizontalItemSelectedColor: '#ffffff',
    horizontalItemHoverColor: '#ffffff',
    horizontalItemSelectedBg: 'transparent',
    horizontalItemBorderRadius: rounded.sm,
    horizontalItemHoverBg: 'rgba(255, 255, 255, 0.12)',
    horizontalLineHeight: `${layout.globalNavHeight}px`,

    /* ---- 深色主题（如果以后有人用 theme="dark" 也不会变回 antd 默认蓝）---- */
    darkItemBg: 'transparent',
    darkItemColor: 'rgba(255, 255, 255, 0.82)',
    darkItemHoverColor: '#ffffff',
    darkItemHoverBg: 'rgba(255, 255, 255, 0.12)',
    darkItemSelectedColor: '#ffffff',
    darkItemSelectedBg: 'rgba(255, 255, 255, 0.16)',
    darkItemDisabledColor: 'rgba(255, 255, 255, 0.35)',
    darkSubMenuItemBg: 'transparent',
    darkPopupBg: colors.surfaceTile1,
    darkGroupTitleColor: 'rgba(255, 255, 255, 0.55)',
  },

  /* ========== 按钮 ========== */
  Button: {
    // DESIGN.md：不给按钮加投影。antd 主按钮默认自带一层蓝色光晕，必须关掉。
    primaryShadow: shadow.none,
    defaultShadow: shadow.none,
    dangerShadow: shadow.none,
    fontWeight: fontWeight.regular, // 字重阶梯里没有 500，按钮就是 400
    paddingInline: 16,
    defaultBorderColor: colors.hairline,
    defaultColor: colors.ink,
  },

  /* ========== 卡片 ========== */
  Card: {
    headerBg: colors.canvas,
    headerFontSize: fontSize.body, // 17px（DESIGN.md 的 body-strong 档）
    headerHeight: 52,
    bodyPadding: 20,
    bodyPaddingSM: 16,
    headerPadding: '0 20px',
    // 卡片默认不带阴影，靠 1px 发丝线区分层级
    actionsBg: colors.canvas,
  },

  /* ========== 输入 ========== */
  Input: {
    paddingBlock: 6,
    paddingInline: 12,
    activeShadow: `0 0 0 2px ${alpha(colors.primaryFocus, 0.2)}`,
    errorActiveShadow: `0 0 0 2px ${alpha(semantic.error, 0.2)}`,
    warningActiveShadow: `0 0 0 2px ${alpha(semantic.warning, 0.2)}`,
  },

  /* ========== 表格 ========== */
  Table: {
    // 表头用珍珠白 #fafafc —— 比纯白略深，让表头自然"浮"出来，不用加边框
    headerBg: colors.surfacePearl,
    headerColor: colors.inkMuted80,
    headerSplitColor: 'transparent',
    headerBorderRadius: rounded.sm,
    borderColor: colors.dividerSoft,
    rowHoverBg: colors.surfacePearl,
    rowSelectedBg: alpha(colors.primary, 0.06),
    rowSelectedHoverBg: alpha(colors.primary, 0.1),
    cellPaddingBlock: 12,
    cellPaddingInline: 16,
    // 表头圆角只在有边框的表格上生效，设置成 8 与卡片内边距对齐
  },

  /* ========== 标签页 ========== */
  Tabs: {
    inkBarColor: colors.primary,
    itemColor: colors.inkMuted48,
    itemHoverColor: colors.ink,
    itemSelectedColor: colors.primary,
    itemActiveColor: colors.primary,
    titleFontSize: fontSize.base,
    horizontalItemGutter: 24,
  },

  /* ========== 分页 ========== */
  Pagination: {
    itemActiveBg: alpha(colors.primary, 0.08),
    itemBg: 'transparent',
  },

  /* ========== 表单 ========== */
  Form: {
    labelColor: colors.inkMuted80,
    labelHeight: 32,
    itemMarginBottom: 20,
    // 必填星号用主色而不是刺眼的红
    labelRequiredMarkColor: colors.primary,
  },

  /* ========== 提示条 ========== */
  Alert: {
    defaultPadding: '10px 14px',
    withDescriptionPadding: '14px 16px',
  },

  /* ========== 弹窗 ========== */
  Modal: {
    contentBg: colors.canvas,
    headerBg: colors.canvas,
    titleColor: colors.ink,
    titleFontSize: fontSize.body,
    bodyPadding: 20,
    // 圆角用 lg 档（18px），与 DESIGN.md 的"外层容器"档一致
  },
};

/**
 * 完整的 antd 主题配置。
 * algorithm 用 defaultAlgorithm —— DESIGN.md 分析的是 Apple 日间（浅色）设计，
 * 整套令牌都是为浅色底定义的（深色块只是"色块"，不是深色模式）。
 */
const antdThemeConfig = {
  algorithm: antdTheme.defaultAlgorithm,
  token,
  components,
};

export default antdThemeConfig;
