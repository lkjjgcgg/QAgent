import { describe, it, expect } from 'vitest';
import { alpha, colors, fontWeight } from './tokens.js';

/**
 * alpha() 是全项目唯一做「十六进制 → rgba」转换的地方，
 * 用来实现"主色的 8% 淡底"这类效果（见 antdTheme.js）。
 * 它是个纯函数，没有副作用，是单元测试最理想的靶子。
 */
describe('tokens.alpha()：十六进制色值 → rgba()', () => {
  it('6 位色值：正常拆成 r/g/b', () => {
    expect(alpha('#0066cc', 0.08)).toBe('rgba(0, 102, 204, 0.08)');
  });

  it('3 位简写：先把每位扩展成两位（#abc → #aabbcc）再解析', () => {
    expect(alpha('#abc', 1)).toBe('rgba(170, 187, 204, 1)');
  });

  it('不带 # 前缀也能解析', () => {
    expect(alpha('0066cc', 0.5)).toBe('rgba(0, 102, 204, 0.5)');
  });

  it('透明度边界值 0 与 1', () => {
    expect(alpha('#000000', 0)).toBe('rgba(0, 0, 0, 0)'); // 全透明黑
    expect(alpha('#ffffff', 1)).toBe('rgba(255, 255, 255, 1)'); // 全不透明白
  });

  it('项目的品牌主色能正确转换（防止有人改 tokens 时改坏主色）', () => {
    expect(colors.primary).toBe('#0066cc');
    expect(alpha(colors.primary, 0.08)).toBe('rgba(0, 102, 204, 0.08)');
  });
});

describe('tokens：设计约束本身也是可以断言的', () => {
  it('深色底上的链接色必须与品牌主色不同——主色在深底上看不见', () => {
    expect(colors.primaryOnDark).not.toBe(colors.primary);
  });

  it('字重阶梯刻意不含 500（DESIGN.md 要求中等强调一律用 600）', () => {
    expect(Object.values(fontWeight)).not.toContain(500);
  });
});
