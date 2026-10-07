import React from 'react';
import { colors, fontSize, fontWeight, rounded, spacing } from '../theme/tokens.js';
import { BrandMark, BrandName } from './Brand.jsx';

/**
 * 登录 / 注册页共用的外壳
 * =============================================================================
 * 【为什么抽出来】
 * 改造前 Login.jsx 和 Register.jsx 是两份复制粘贴的代码，
 * 结果就是标题一个叫 QAgent、一个叫 TestHub，背景色又是另一套灰
 * （#f0f2f5，既不是 DESIGN.md 的画布白也不是羊皮纸白）。
 * 抽成外壳后，两个页面结构一致、改一次两边同时生效。
 *
 * 版式依据 DESIGN.md 的「产品色块」结构，但按后台场景做了缩放：
 *   羊皮纸画布 → 品牌标识 → 主标题（600 字重 + 负字距） → 说明文字 → 白色卡片
 * 卡片用 rounded.lg（18px）+ 1px 发丝线描边，不加投影
 * （DESIGN.md 的禁令：投影只留给产品图，卡片靠描边区分层级）。
 */
const AuthShell = ({ title, subtitle, children, footer }) => (
  <div
    style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      // 画布用羊皮纸白，而不是原来那个不属于设计体系的 #f0f2f5
      background: colors.canvasParchment,
      padding: `${spacing.xl}px ${spacing.lg}px`,
      boxSizing: 'border-box',
    }}
  >
    <main
      style={{
        width: '100%',
        maxWidth: 400,
      }}
    >
      {/* ---- 品牌区 ---- */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          marginBottom: spacing.xl,
        }}
      >
        <BrandMark size={32} />
        <BrandName size={fontSize.body} />
      </div>

      {/* ---- 标题区 ----
          主标题用 lead 档（28px）但提到 600 字重 + 负字距，
          这是 DESIGN.md 说的"Apple tight"标题节奏。 */}
      <h1
        style={{
          margin: 0,
          textAlign: 'center',
          fontSize: fontSize.lead,
          fontWeight: fontWeight.semibold,
          lineHeight: 1.14,
          letterSpacing: '-0.28px',
          color: colors.ink,
        }}
      >
        {title}
      </h1>

      {subtitle && (
        <p
          style={{
            margin: `${spacing.sm}px 0 0`,
            textAlign: 'center',
            fontSize: fontSize.base,
            lineHeight: 1.43,
            color: colors.inkMuted48,
          }}
        >
          {subtitle}
        </p>
      )}

      {/* ---- 表单卡片 ---- */}
      <div
        style={{
          marginTop: spacing.xl,
          background: colors.canvas,
          border: `1px solid ${colors.hairline}`,
          borderRadius: rounded.lg,
          padding: spacing.xl,
        }}
      >
        {children}
      </div>

      {footer}
    </main>
  </div>
);

/**
 * 页脚小字。
 * DESIGN.md 的 footer 用小字号 + 浅色，字号 fine-print（12px）。
 */
export const AuthFooter = ({ children }) => (
  <p
    style={{
      margin: `${spacing.xxl}px 0 0`,
      textAlign: 'center',
      fontSize: fontSize.fine,
      lineHeight: 1.5,
      letterSpacing: '-0.12px',
      color: colors.inkMuted48,
    }}
  >
    {children}
  </p>
);

export default AuthShell;
