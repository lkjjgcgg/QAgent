/**
 * 站点级常量（单一来源）
 * =============================================================================
 * 【为什么要有这个文件】
 * 仓库地址原本在 3 个地方各写了一遍（Layout.jsx 的导航链接、AgentChat.jsx
 * 的底栏链接、QRCodeGenerator.jsx 的默认二维码内容），而且其中 2 处还写错成了
 * 别人的用户名 peter123023。同一个值散落多处 = 改一处漏两处。
 *
 * 这里做成全项目唯一的仓库地址来源，其它文件一律从这里 import，
 * 以后换仓库只改这一行。思路和 theme/tokens.js（颜色唯一来源）一致。
 */

/** 仓库属主（GitHub 用户名） */
export const REPO_OWNER = 'lkjjgcgg';

/** 仓库名 */
export const REPO_NAME = 'QAgent';

/** 仓库主页完整地址 */
export const REPO_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}`;

/** CI 状态徽章图片地址 */
export const REPO_CI_BADGE_URL = `${REPO_URL}/actions/workflows/ci.yml/badge.svg`;

/** CI 运行记录页地址 */
export const REPO_CI_URL = `${REPO_URL}/actions/workflows/ci.yml`;
