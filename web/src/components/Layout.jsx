import React from 'react';
import { Layout, Menu, Dropdown, Avatar, Button } from 'antd';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from '../locales';
import { setLanguage } from '../store/appSlice';
import { logout } from '../store/userSlice';
import { BrandLockup } from './Brand.jsx';
import { REPO_URL } from '../config/site.js';
import { colors, fontSize, layout, spacing } from '../theme/tokens.js';
import {
  ApiOutlined,
  RobotOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  ThunderboltOutlined,
  DashboardOutlined,
  FolderOutlined,
  LinkOutlined,
  PlayCircleOutlined,
  HistoryOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  BellOutlined,
  FileTextOutlined,
  FileSearchOutlined,
  FileProtectOutlined,
  SafetyOutlined,
  BranchesOutlined,
  ScheduleOutlined,
  AppstoreOutlined,
  GlobalOutlined,
  CodeOutlined,
  ToolOutlined,
  SwapOutlined,
  CalculatorOutlined,
  BarcodeOutlined,
  SafetyCertificateOutlined,
  DatabaseOutlined,
  GithubOutlined,
  QrcodeOutlined,
  BgColorsOutlined,
} from '@ant-design/icons';

/**
 * 外层框架（应用外壳）
 * =============================================================================
 * 改造点（对照 web/DESIGN.md 的「紧凑双行导航」结构）：
 *
 *   1. 【黑色全局导航】顶栏从白色改成纯黑。DESIGN.md 明确说纯黑只出现在
 *      全局导航栏这一处 —— 它是整个页面唯一允许用纯黑的地方，用来给内容区
 *      一个干净的"顶部封边"。
 *   2. 【羊皮纸副导航】新增第二行：羊皮纸白 + 毛玻璃，显示当前模块名称。
 *      这是 DESIGN.md 的 sub-nav-frosted。原来模块名挤在侧栏顶部，很弱。
 *   3. 【去掉全部硬编码色值】原来这里散落着 #fff / #e5e7eb / #1677ff /
 *      #1f2937 / #6b7280 / #f3f4f6 / #f8f9fa 七个写死的颜色，
 *      现在全部改为引用 src/theme/tokens.js。
 *   4. 【修一个真 bug】原来侧栏底部的 GitHub 链接是 position:absolute 钉在
 *      一个 overflow:auto 的容器里，窗口变矮时会被菜单项压住。现在移到副导航右侧。
 *   5. 【修一个错误链接】原链接指向 github.com/peter123023/QAgent，
 *      但本仓库的实际地址是 github.com/lkjjgcgg/QAgent —— 点进去是别人的仓库。
 *      该地址现已提为 src/config/site.js 的单一来源（其它页面同样引用它）。
 *   6. 【接通一个死代码】原文件里定义了 langMenu（语言切换菜单）和
 *      handleLanguageChange，但整份 JSX 里从来没有渲染过它们 ——
 *      也就是说语言切换功能实际上是点不到的。现在接进全局导航右侧。
 *
 * 侧栏菜单的业务配置（getSideMenuItems）原样保留，只调了间距和圆角。
 */

const { Header, Sider, Content } = Layout;

/** 顶层路由前缀 → 模块标识 */
const MODULE_PREFIXES = [
  '/api-testing',
  '/ai-generation',
  '/agent',
  '/ui-automation',
  '/app-automation',
  '/ai-intelligent-mode',
  '/configuration',
  '/test-tools',
];

/**
 * 从当前路径推导所属模块。
 *
 * 【为什么不用 useState + useEffect】
 * 原实现是「先把 currentModule 存进 state，再在 useEffect 里根据路径 setState」。
 * 这是典型的**派生状态**反模式：currentModule 完全由 location.pathname 决定，
 * 多存一份 state 会导致首帧先渲染成"没有侧栏"，effect 跑完才补上，页面闪一下。
 * 直接算出来既没有闪烁，也少一次渲染。
 */
const getModuleFromPath = (path) => MODULE_PREFIXES.find((p) => path.startsWith(p))?.slice(1) ?? '';

const LayoutComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const { user } = useSelector((state) => state.user);
  const { language } = useSelector((state) => state.app);
  const currentModule = getModuleFromPath(location.pathname);

  const topMenuItems = [
    { key: '/api-testing', label: '接口自动化测试', icon: <ApiOutlined /> },
    { key: '/ai-generation', label: 'AI 用例生成', icon: <RobotOutlined /> },
    { key: '/agent', label: 'Agent', icon: <ThunderboltOutlined /> },
    { key: '/test-tools', label: '测试工具', icon: <ToolOutlined /> },
    { key: '/configuration', label: '设置', icon: <SettingOutlined /> },
  ];

  const handleLanguageChange = (lang) => {
    dispatch(setLanguage(lang));
    i18n.changeLanguage(lang);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const userMenu = {
    items: [
      { key: 'profile', label: t('nav.profile'), icon: <UserOutlined /> },
      { type: 'divider' },
      { key: 'logout', label: t('nav.logout'), icon: <LogoutOutlined />, danger: true },
    ],
    onClick: ({ key }) => {
      if (key === 'logout') handleLogout();
    },
  };

  const langMenu = {
    items: [
      { key: 'zh-cn', label: '简体中文', disabled: language === 'zh-cn' },
      { key: 'en', label: 'English', disabled: language === 'en' },
    ],
    onClick: ({ key }) => handleLanguageChange(key),
  };

  const getModuleName = () => {
    const map = {
      'ai-generation': t('modules.aiGeneration'),
      'api-testing': '接口自动化测试',
      agent: '',
      'ui-automation': t('modules.uiAutomation'),
      'app-automation': 'APP自动化测试',
      'ai-intelligent-mode': t('modules.aiIntelligentMode'),
      configuration: '设置',
      'test-tools': t('modules.testTools'),
    };
    return map[currentModule] || '';
  };

  const getSideMenuItems = () => {
    if (currentModule === 'ai-generation') {
      return [
        { key: '/ai-generation/dashboard', label: t('menu.dashboard'), icon: <DashboardOutlined /> },
        {
          key: 'requirement',
          label: t('menu.intelligentCaseGeneration'),
          icon: <ThunderboltOutlined />,
          children: [
            { key: '/ai-generation/requirement-analysis', label: t('menu.aiCaseGeneration'), icon: <FileSearchOutlined /> },
            { key: '/ai-generation/generated-testcases', label: t('menu.aiGeneratedTestcases'), icon: <FileTextOutlined /> },
          ],
        },
        { key: '/ai-generation/projects', label: t('menu.projectManagement'), icon: <FolderOutlined /> },
        { key: '/ai-generation/testcases', label: t('menu.testCases'), icon: <FileProtectOutlined /> },
        { key: '/ai-generation/versions', label: t('menu.versionManagement'), icon: <BranchesOutlined /> },
        {
          key: 'reviews',
          label: t('menu.reviewManagement'),
          icon: <SafetyOutlined />,
          children: [
            { key: '/ai-generation/reviews', label: t('menu.reviewList'), icon: <FileTextOutlined /> },
            { key: '/ai-generation/review-templates', label: t('menu.reviewTemplates'), icon: <AppstoreOutlined /> },
          ],
        },
        { key: '/ai-generation/executions', label: t('menu.testPlan'), icon: <PlayCircleOutlined /> },
        { key: '/ai-generation/reports', label: t('menu.testReport'), icon: <BarChartOutlined /> },
        {
          key: 'config',
          label: t('menu.aiCaseGenerationConfig'),
          icon: <SettingOutlined />,
          children: [
            { key: '/ai-generation/writer-config', label: 'AI用例编写配置', icon: <FileTextOutlined /> },
            { key: '/ai-generation/reviewer-config', label: 'AI用例评审配置', icon: <SafetyOutlined /> },
          ],
        },
      ];
    }
    if (currentModule === 'api-testing') {
      return [
        { key: '/api-testing/dashboard', label: t('menu.dashboard'), icon: <DashboardOutlined /> },
        { key: '/api-testing/projects', label: t('menu.projectManagement'), icon: <FolderOutlined /> },
        { key: '/api-testing/interfaces', label: t('menu.interfaceManagement'), icon: <LinkOutlined /> },
        { key: '/api-testing/automation', label: t('menu.automationTesting'), icon: <PlayCircleOutlined /> },
        { key: '/api-testing/history', label: t('menu.requestHistory'), icon: <HistoryOutlined /> },
        { key: '/api-testing/environments', label: t('menu.environmentManagement'), icon: <SettingOutlined /> },
        { key: '/api-testing/reports', label: t('menu.testReport'), icon: <BarChartOutlined /> },
        { key: '/api-testing/scheduled-tasks', label: t('menu.scheduledTasks'), icon: <ClockCircleOutlined /> },
        { key: '/api-testing/notification-logs', label: t('menu.notificationList'), icon: <BellOutlined /> },
      ];
    }
    if (currentModule === 'ui-automation') {
      return [
        { key: '/ui-automation/dashboard', label: t('menu.dashboard'), icon: <DashboardOutlined /> },
        { key: '/ui-automation/projects', label: t('menu.projectManagement'), icon: <FolderOutlined /> },
        { key: '/ui-automation/elements-enhanced', label: t('menu.elementManagement'), icon: <AppstoreOutlined /> },
        { key: '/ui-automation/test-cases', label: t('menu.caseManagement'), icon: <FileProtectOutlined /> },
        { key: '/ui-automation/scripts-enhanced', label: t('menu.scriptGeneration'), icon: <CodeOutlined /> },
        { key: '/ui-automation/scripts', label: t('menu.scriptList'), icon: <FileTextOutlined /> },
        { key: '/ui-automation/suites', label: t('menu.suiteManagement'), icon: <AppstoreOutlined /> },
        { key: '/ui-automation/executions', label: t('menu.executionRecords'), icon: <PlayCircleOutlined /> },
        { key: '/ui-automation/reports', label: t('menu.testReport'), icon: <BarChartOutlined /> },
        { key: '/ui-automation/scheduled-tasks', label: t('menu.scheduledTasks'), icon: <ClockCircleOutlined /> },
        { key: '/ui-automation/notification-logs', label: t('menu.notificationList'), icon: <BellOutlined /> },
      ];
    }
    if (currentModule === 'app-automation') {
      return [
        { key: '/app-automation/dashboard', label: 'Dashboard', icon: <DashboardOutlined /> },
        { key: '/app-automation/projects', label: '项目管理', icon: <FolderOutlined /> },
        { key: '/app-automation/devices', label: '设备管理', icon: <GlobalOutlined /> },
        { key: '/app-automation/packages', label: '包名管理', icon: <AppstoreOutlined /> },
        { key: '/app-automation/elements', label: '元素管理', icon: <ApiOutlined /> },
        { key: '/app-automation/scene-builder', label: '用例编排', icon: <BranchesOutlined /> },
        { key: '/app-automation/test-cases', label: '测试用例', icon: <FileProtectOutlined /> },
        { key: '/app-automation/test-suites', label: '测试套件', icon: <AppstoreOutlined /> },
        { key: '/app-automation/scheduled-tasks', label: '定时任务', icon: <ClockCircleOutlined /> },
        { key: '/app-automation/notification-logs', label: '通知列表', icon: <BellOutlined /> },
        { key: '/app-automation/executions', label: '执行记录', icon: <PlayCircleOutlined /> },
        { key: '/app-automation/reports', label: '测试报告', icon: <BarChartOutlined /> },
      ];
    }
    if (currentModule === 'ai-intelligent-mode') {
      return [
        { key: '/ai-intelligent-mode/testing', label: t('menu.aiIntelligentTesting'), icon: <ThunderboltOutlined /> },
        { key: '/ai-intelligent-mode/cases', label: t('menu.aiCaseManagement'), icon: <FileProtectOutlined /> },
        { key: '/ai-intelligent-mode/execution-records', label: t('menu.aiExecutionRecords'), icon: <HistoryOutlined /> },
      ];
    }
    if (currentModule === 'agent') {
      return [];
    }
    if (currentModule === 'configuration') {
      return [
        { key: '/configuration/ai-model', label: t('menu.aiModelConfig'), icon: <RobotOutlined /> },
        { key: '/configuration/ui-env', label: t('menu.uiEnvConfig'), icon: <GlobalOutlined /> },
        { key: '/configuration/app-env', label: 'APP环境配置', icon: <AppstoreOutlined /> },
        { key: '/configuration/scheduled-task', label: t('menu.scheduledTaskConfig'), icon: <ScheduleOutlined /> },
        { key: '/configuration/coze', label: t('menu.cozeConfig'), icon: <ApiOutlined /> },
      ];
    }
    if (currentModule === 'test-tools') {
      return [
        {
          key: 'general-tools',
          label: t('menu.generalTools'),
          icon: <ToolOutlined />,
          children: [
            { key: '/test-tools/data-generator', label: t('menu.testDataGenerator'), icon: <DatabaseOutlined /> },
            { key: '/test-tools/encoder-decoder', label: t('menu.encoderDecoder'), icon: <SwapOutlined /> },
            { key: '/test-tools/regex-tester', label: t('menu.regexTester'), icon: <CodeOutlined /> },
            { key: '/test-tools/format-converter', label: t('menu.formatConverter'), icon: <BarcodeOutlined /> },
            { key: '/test-tools/timestamp-converter', label: t('menu.timestampConverter'), icon: <ClockCircleOutlined /> },
            { key: '/test-tools/string-processor', label: '字符串处理工具', icon: <CodeOutlined /> },
            { key: '/test-tools/random-generator', label: '随机数生成器', icon: <ThunderboltOutlined /> },
            { key: '/test-tools/file-size-calculator', label: '文件大小计算器', icon: <CalculatorOutlined /> },
            { key: '/test-tools/diff-compare', label: '文本/JSON对比工具', icon: <SwapOutlined /> },
          ],
        },
        {
          key: 'api-tools',
          label: t('menu.apiTools'),
          icon: <ApiOutlined />,
          children: [
            { key: '/test-tools/signature-generator', label: t('menu.signatureGenerator'), icon: <SafetyCertificateOutlined /> },
            { key: '/test-tools/cookie-parser', label: t('menu.cookieParser'), icon: <FileTextOutlined /> },
            { key: '/test-tools/mock-generator', label: t('menu.mockGenerator'), icon: <ThunderboltOutlined /> },
            { key: '/test-tools/http-status-code', label: 'HTTP状态码查询', icon: <SafetyOutlined /> },
            { key: '/test-tools/cron-expression', label: 'Cron表达式生成', icon: <ScheduleOutlined /> },
            { key: '/test-tools/ip-address-tool', label: 'IP地址工具', icon: <GlobalOutlined /> },
            { key: '/test-tools/jwt-tool', label: 'JWT 解析工具', icon: <SafetyCertificateOutlined /> },
          ],
        },
        {
          key: 'design-tools',
          label: '设计工具',
          icon: <AppstoreOutlined />,
          children: [
            { key: '/test-tools/qrcode-generator', label: '二维码生成器', icon: <QrcodeOutlined /> },
            { key: '/test-tools/color-converter', label: '颜色转换工具', icon: <BgColorsOutlined /> },
          ],
        },
      ];
    }
    return [];
  };

  // Agent 模块是全屏对话页，既没有侧栏也不需要副导航
  const hasSubNav = Boolean(currentModule) && currentModule !== 'agent';
  const hasSider = currentModule !== 'agent';
  // 吸顶距离 = 全局导航高 +（有副导航时的）副导航高
  const stickyOffset = layout.globalNavHeight + (hasSubNav ? layout.subNavHeight : 0);

  return (
    <Layout style={{ minHeight: '100vh', background: colors.canvasParchment }}>
      {/* ==================== 第一行：纯黑全局导航 ====================
          DESIGN.md 规定全局导航是纯黑（#000000），而且纯黑只允许出现在这里。 */}
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing.lg,
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xl, minWidth: 0 }}>
          <div
            onClick={() => navigate('/test-tools/data-generator')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', flex: '0 0 auto' }}
          >
            <BrandLockup onDark size={26} nameSize={fontSize.md} />
          </div>

          <Menu
            mode="horizontal"
            theme="dark"
            selectedKeys={[`/${currentModule}`]}
            items={topMenuItems}
            onClick={({ key }) => navigate(key)}
            style={{
              background: 'transparent',
              borderBottom: 'none',
              flex: '1 1 auto',
              minWidth: 0,
              // 覆盖 antd 依据 token 算出的行高，让菜单文字在 52px 顶栏里垂直居中
              lineHeight: `${layout.globalNavHeight}px`,
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs, flex: '0 0 auto' }}>
          {/* 语言切换：原来这段代码定义了却从未渲染，功能实际是点不到的 */}
          <Dropdown menu={langMenu} trigger={['click']} placement="bottomRight">
            <Button
              type="text"
              aria-label="切换语言"
              icon={<GlobalOutlined />}
              style={{ color: 'rgba(255, 255, 255, 0.82)' }}
            />
          </Dropdown>

          <Dropdown menu={userMenu} trigger={['click']} placement="bottomRight">
            <Button
              type="text"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.xs,
                color: 'rgba(255, 255, 255, 0.9)',
              }}
            >
              <Avatar size={26} icon={<UserOutlined />} src={user?.avatar} />
              <span>{user?.username}</span>
            </Button>
          </Dropdown>
        </div>
      </Header>

      {/* ==================== 第二行：羊皮纸毛玻璃副导航 ====================
          DESIGN.md 的 sub-nav-frosted：羊皮纸白 80% 透明 + backdrop-filter 模糊，
          制造"浮在内容之上"的效果。这是功能性效果，不是装饰。 */}
      {hasSubNav && (
        <div
          className="q-frosted"
          style={{
            height: layout.subNavHeight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `0 ${spacing.lg}px`,
            // 吸在全局导航下面
            position: 'sticky',
            top: layout.globalNavHeight,
            zIndex: 90,
            borderBottom: `1px solid ${colors.hairline}`,
          }}
        >
          <span
            style={{
              fontSize: fontSize.body,
              fontWeight: 600,
              letterSpacing: '-0.374px',
              color: colors.ink,
            }}
          >
            {getModuleName()}
          </span>

          {/* 原来这个链接钉在侧栏底部，用 position:absolute 压在一个可滚动菜单上，
              窗口一变矮就会被菜单项盖住。移到副导航右侧，既不会再重叠，也更显眼。 */}
          <a
            className="q-nav-link"
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: colors.inkMuted48 }}
          >
            <GithubOutlined />
            <span>源码</span>
          </a>
        </div>
      )}

      <Layout>
        {hasSider && (
          <Sider
            width={layout.siderWidth}
            style={{
              background: colors.canvas,
              borderRight: `1px solid ${colors.hairline}`,
              position: 'sticky',
              top: stickyOffset,
              height: `calc(100vh - ${stickyOffset}px)`,
              overflowY: 'auto',
              paddingTop: spacing.xs,
            }}
          >
            <Menu
              mode="inline"
              selectedKeys={[location.pathname]}
              items={getSideMenuItems()}
              onClick={({ key }) => {
                if (key.startsWith('/')) navigate(key);
              }}
              style={{ borderInlineEnd: 'none', background: 'transparent' }}
            />
          </Sider>
        )}

        <Content
          style={{
            padding: hasSider ? `${spacing.lg}px` : 0,
            minWidth: 0,
          }}
        >
          <div
            style={
              hasSider
                ? { maxWidth: layout.contentMaxWidth, margin: '0 auto', width: '100%' }
                : undefined
            }
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default LayoutComponent;
