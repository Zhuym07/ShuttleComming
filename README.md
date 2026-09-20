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

## 配置位置

- `config/schedules.ts`：双向班次和运行日期
- `config/stations.ts`：日间/夜间站点与预计行驶时间
- `locales.ts`：中英文文案
- `hooks/useShuttleState.ts`：页面状态与实时派生数据
- `lib/shuttle.ts`：班次、路线和时间计算逻辑

## 部署

项目使用 `wrangler.json` 配置 Cloudflare Workers 静态资源部署。先构建，再使用 Wrangler 发布 `dist/`。

## 数据说明

应用不接入 GPS 或后端实时车辆接口，页面中的“实时”状态是根据时刻表和固定行驶时长计算的估算结果。实际发车、路况和到站时间请以现场情况为准。
