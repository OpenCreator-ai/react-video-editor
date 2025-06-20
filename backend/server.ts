import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { handleRenderRequest } from './api/render';

// 在 ES 模块中获取 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

// 中间件
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Vite 默认端口
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 静态文件服务
app.use('/renders', express.static(path.join(__dirname, 'public/renders')));

// 创建渲染输出目录
const rendersDir = path.join(__dirname, 'public/renders');
if (!fs.existsSync(rendersDir)) {
  fs.mkdirSync(rendersDir, { recursive: true });
}

// API 路由
app.all('/api/render', async (req, res) => {
  try {
    // 创建 Request 对象
    const url = new URL(req.url, `http://localhost:${port}`);
    const request = new Request(url.toString(), {
      method: req.method,
      headers: req.headers as HeadersInit,
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });

    // 调用处理函数
    const response = await handleRenderRequest(request);
    
    // 设置响应
    const responseData = await response.json();
    res.status(response.status).json(responseData);
  } catch (error) {
    console.error('API错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Remotion渲染服务运行中' });
});

// 启动服务器
app.listen(port, () => {
  console.log(`🎬 Remotion渲染服务启动在 http://localhost:${port}`);
  console.log(`📁 渲染文件保存在 ${rendersDir}`);
});

export default app; 