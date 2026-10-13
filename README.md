# GT Shuttle

GT Shuttle 是一个面向移动端的校园接驳车查询 PWA，提供南校区与北校区之间的双向班次、日期筛选、路线时间轴和基于时刻表的到站时间估算。

## 功能

- 南校区 → 北校区、北校区 → 南校区双向切换
- 查看今天和未来 14 天班次
- 根据星期自动过滤有效班次
- 基于固定行驶时间展示班车运行状态和预计到站时间
- 19:30 后切换夜间路线（南校区 9 号门关闭）
- 点击班次进入预览模式，再恢复实时视图
- 中英文界面切换
- 支持安装为手机桌面 PWA，并提供离线缓存
- 保留 `public/lite.html` 作为旧设备降级页面

## 技术栈

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Lucide React
- Service Worker
- Cloudflare Workers Static Assets

## 本地开发

需要 Node.js 18+。

```bash
npm install
npm run dev
```

然后打开终端提示的本地地址。

## 构建与预览

```bash
npm run build
npm run preview
```

构建输出位于 `dist/`，包含主应用、静态资源、PWA manifest、Service Worker 和 Lite 页面。

## 添加到主屏幕

微信内首次访问不自动提示，从第二次新访问开始，引导使用手机浏览器打开。外部手机浏览器会在每次新访问时显示对应的添加步骤；支持原生安装的浏览器可点击按钮确认安装。提示在页面加载后延迟 2 秒出现，同次访问中关闭、刷新或历史返回不会重复弹出。

也可随时点击页脚的“添加到主屏幕”查看步骤。关闭提示只影响当前访问；从桌面图标以独立应用模式启动，或本浏览器已观察到安装完成后，不再自动提醒。安装引导逻辑位于 `hooks/useInstallGuide.ts`，界面位于 `components/PWAPrompt.tsx`。Lite 页面保持原有功能。

## 配置位置

- `config/schedules.ts`：双向班次和运行日期
- `config/stations.ts`：日间/夜间站点与预计行驶时间
- `locales.ts`：中英文文案
- `public/icon.svg`：主屏幕图标源文件；导出为 `icon-192.png`、`icon-512.png` 和 180px 的 `apple-touch-icon.png`，保持完整、不透明的背景和车身四周留白
- `public/favicon.svg`：小尺寸网页图标源文件；导出为 `favicon.png`（32px）和 `favicon.ico`（16/32/48px）
- `hooks/useShuttleState.ts`：页面状态与实时派生数据
- `lib/shuttle.ts`：班次、路线和时间计算逻辑

## 部署

项目使用 `wrangler.json` 配置 Cloudflare Workers 静态资源部署。先构建，再使用 Wrangler 发布 `dist/`。

## 数据说明

应用不接入 GPS 或后端实时车辆接口，页面中的“实时”状态是根据时刻表和固定行驶时长计算的估算结果。实际发车、路况和到站时间请以现场情况为准。
