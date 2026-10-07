import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
// Ant Design 的样式重置。必须在自己的 index.css 之前引入，
// 这样 index.css 里的基线样式才能覆盖它。
import 'antd/dist/reset.css'
import store from './store'
import { injectStore } from './services/api'
import './locales'
import router from './routes/index.jsx'
import antdThemeConfig from './theme/antdTheme.js'
import './index.css'

injectStore(store)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/*
      ConfigProvider 是 Ant Design 的"主题开关"。
      把 theme 传进去之后，下面 40+ 个页面里所有 antd 组件的主色、圆角、
      字体、控件高度会一次性全部换成 DESIGN.md 那套令牌，页面代码一行都不用改。
      locale={zhCN} 让分页器、日期选择器、空状态这些内置文案显示中文。
    */}
    <ConfigProvider theme={antdThemeConfig} locale={zhCN}>
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </ConfigProvider>
  </StrictMode>,
)
