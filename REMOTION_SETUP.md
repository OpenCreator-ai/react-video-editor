# Remotion 本地渲染服务设置

## 概述

此项目已集成了基于 Remotion 的本地服务端渲染 API，可以将视频设计转换为 MP4 视频文件。

## 文件结构

```
├── api/
│   ├── render.ts           # 主要的渲染 API 处理逻辑
│   └── webpack-override.ts # Webpack 配置覆盖
├── src/
│   ├── config/
│   │   └── api.ts          # API 配置文件
│   ├── remotion/
│   │   ├── index.ts        # Remotion 入口文件
│   │   ├── video-composition.tsx  # 视频合成组件
│   │   └── video-renderer.tsx     # 视频渲染器组件
│   └── features/editor/store/
│       └── use-download-state.ts  # 更新的下载状态管理
├── server.ts               # TypeScript 服务器
└── public/renders/         # 渲染输出目录
```

## 功能特性

- ✅ **本地渲染**: 使用 Remotion 在本地服务器上渲染视频
- ✅ **TypeScript 支持**: 完整的 TypeScript 类型安全
- ✅ **异步处理**: 支持长时间运行的渲染任务
- ✅ **进度追踪**: 实时渲染进度反馈
- ✅ **错误处理**: 完善的错误处理和状态管理
- ✅ **文件管理**: 自动创建和管理输出文件

## 安装依赖

项目已经安装了必要的依赖：

```bash
# 已安装的 Remotion 依赖
@remotion/bundler
@remotion/renderer
@remotion/media-utils
@remotion/player
@remotion/shapes
@remotion/transitions
@remotion/paths
remotion

# 已安装的服务器依赖
express
cors
tsx
ts-node
@types/express
@types/cors
@types/node
```

## 使用方法

### 1. 启动渲染服务器

```bash
# 开发模式（支持热重载）
pnpm run server:dev

# 生产模式
pnpm run server
```

服务器将在 `http://localhost:3001` 启动。

### 2. 启动前端应用

在另一个终端中：

```bash
pnpm run dev
```

前端应用将在 `http://localhost:5173` 启动。

### 3. 测试渲染功能

1. 在前端应用中创建或编辑视频设计
2. 点击导出/下载按钮
3. 系统将自动调用本地渲染服务
4. 查看渲染进度和最终结果

## API 端点

### POST /api/render
开始新的渲染任务

**请求体:**
```json
{
  "design": {
    // IDesign 对象
  },
  "options": {
    "fps": 30,
    "size": { "width": 1920, "height": 1080 },
    "format": "mp4"
  }
}
```

**响应:**
```json
{
  "video": {
    "id": "task_id",
    "status": "PENDING",
    "progress": 0
  }
}
```

### GET /api/render?id={taskId}&type=VIDEO_RENDERING
查询渲染状态

**响应:**
```json
{
  "video": {
    "id": "task_id",
    "status": "COMPLETED",
    "progress": 100,
    "url": "/renders/task_id.mp4"
  }
}
```

## 渲染状态

- `PENDING`: 任务已创建，等待开始
- `PROCESSING`: 正在渲染中
- `COMPLETED`: 渲染完成
- `ERROR`: 渲染失败

## 自定义渲染器

可以在 `src/remotion/video-renderer.tsx` 中自定义渲染逻辑：

```typescript
// 支持的图层类型
- text: 文本图层
- image: 图片图层
- video: 视频图层  
- shape: 形状图层
```

## 故障排除

### 1. 渲染失败
- 检查 `public/renders` 目录权限
- 确认 Remotion 组件没有语法错误
- 查看服务器控制台错误日志

### 2. 类型错误
- 确认 `IDesign` 接口与实际数据结构匹配
- 更新 `video-renderer.tsx` 中的类型定义

### 3. 端口冲突
- 修改 `server.ts` 中的端口号
- 更新 `src/config/api.ts` 中的服务器地址

## 生产部署

1. 设置生产环境变量
2. 更新 `src/config/api.ts` 中的生产服务器地址
3. 构建和部署服务器
4. 确保渲染输出目录可写

## 性能优化

- 使用 SSD 存储提高渲染速度
- 调整 Remotion 渲染参数
- 实现渲染队列管理
- 添加缓存机制

## 下一步

- [ ] 添加渲染队列管理
- [ ] 支持更多输出格式
- [ ] 添加渲染缓存
- [ ] 实现批量渲染
- [ ] 添加渲染预览功能 