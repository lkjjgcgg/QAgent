import React from 'react';
import { colors, rounded, fontSize, fontWeight } from '../theme/tokens.js';

/**
 * 品牌标识 —— 全项目唯一的品牌呈现方式
 * =============================================================================
 * 【它解决什么问题】
 * 改造前，"品牌"在代码里出现了三次，而且三次都不一样：
 *   - 外层框架的顶栏：蓝底方块写「测」+ 文字「自动化测试平台」
 *   - 登录页标题：QAgent
 *   - 注册页标题：TestHub          ← 明显是复制别的项目忘了改
 * 现在把标识抽成一个组件，两处引用同一份，改一次全局生效，不可能再不一致。
 *
 * 视觉依据：DESIGN.md 的 button-icon-circular / 品牌色规则 ——
 * 整块用 Action Blue 填充，图标用 on-primary 白，圆角取圆角阶梯里的 sm/md 档。
 */

/** 方块标识 */
export const BrandMark = ({ size = 32 }) => (
  <div
    aria-hidden="true"
    style={{
      width: size,
      height: size,
      // 圆角跟着尺寸走，但只用圆角阶梯里已有的档位，不随手造新值
      borderRadius: size >= 40 ? rounded.md : rounded.sm,
      background: colors.primary,
      color: colors.onPrimary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: Math.round(size * 0.52),
      fontWeight: fontWeight.semibold,
      lineHeight: 1,
      letterSpacing: '-0.02em',
      flex: '0 0 auto',
      userSelect: 'none',
    }}
  >
    Q
  </div>
);

/** 文字标识 */
export const BrandName = ({ onDark = false, size = fontSize.body }) => (
  <span
    style={{
      fontSize: size,
      fontWeight: fontWeight.semibold,
      // DESIGN.md：大字号要收字距，17px 及以上一律收紧
      letterSpacing: '-0.374px',
      color: onDark ? colors.bodyOnDark : colors.ink,
      whiteSpace: 'nowrap',
    }}
  >
    QAgent
  </span>
);

/** 标识 + 名称的组合，最常用 */
export const BrandLockup = ({ size = 32, onDark = false, nameSize }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
    <BrandMark size={size} />
    <BrandName onDark={onDark} size={nameSize} />
  </span>
);

export default BrandLockup;
