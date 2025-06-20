import { renderMedia, selectComposition } from '@remotion/renderer';
import { bundle } from '@remotion/bundler';
import { webpackOverride } from './webpack-override';
import path from 'path';
import { IDesign } from '@designcombo/types';

interface RenderOptions {
  fps: number;
  size: { width: number; height: number };
  format: 'mp4' | 'gif';
}

interface RenderRequest {
  design: IDesign;
  options: RenderOptions;
}

interface RenderJob {
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'ERROR';
  progress: number;
  url?: string;
  error?: string;
}

// 存储渲染任务的内存存储 (生产环境应使用数据库)
const renderJobs = new Map<string, RenderJob>();

// 生成唯一的任务ID
function generateJobId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// 主要的渲染函数
async function startRender(jobId: string, design: IDesign, options: RenderOptions) {
  try {
    // 更新任务状态为处理中
    const job = renderJobs.get(jobId);
    if (job) {
      job.status = 'PROCESSING';
      job.progress = 10;
    }

    // 添加详细的调试日志
    console.log('🎬 开始渲染视频, JobID:', jobId);
    console.log('📊 接收到的设计数据:', JSON.stringify(design, null, 2));
    console.log('⚙️ 渲染选项:', options);
    
    // 检查设计数据的完整性
    if (!design.trackItemsMap) {
      console.warn('⚠️ 警告: design.trackItemsMap 为空');
    } else {
      console.log('🎯 trackItemsMap 包含的项目数量:', Object.keys(design.trackItemsMap).length);
      Object.entries(design.trackItemsMap).forEach(([id, item]) => {
        console.log(`📝 项目 ${id}:`, {
          type: (item as any).type,
          display: (item as any).display,
          hasDetails: !!(item as any).details
        });
      });
    }

    if (!design.trackItemDetailsMap) {
      console.warn('⚠️ 警告: design.trackItemDetailsMap 为空');
    } else {
      console.log('📋 trackItemDetailsMap 包含的详细信息数量:', Object.keys(design.trackItemDetailsMap).length);
    }

    // Remotion 项目的入口文件路径
    const entryPoint = path.resolve('./src/remotion/index.ts');
    console.log('📂 Remotion 入口文件路径:', entryPoint);
    
    // 打包 Remotion 项目
    console.log('📦 开始打包 Remotion 项目...');
    const bundled = await bundle({
      entryPoint,
      webpackOverride,
    });
    console.log('✅ Remotion 项目打包完成');

    if (job) job.progress = 30;

    // 获取合成配置
    console.log('🎭 获取视频合成配置...');
    const comps = await selectComposition({
      serveUrl: bundled,
      id: 'VideoComposition', // 这个ID需要与你的Remotion组件ID匹配
      inputProps: {
        design,
        ...options
      },
    });
    console.log('✅ 视频合成配置获取完成:', {
      id: comps.id,
      width: comps.width,
      height: comps.height,
      durationInFrames: comps.durationInFrames,
      fps: comps.fps
    });

    if (job) job.progress = 50;

    // 输出文件路径
    const outputPath = path.resolve(`./public/renders/${jobId}.${options.format}`);
    console.log('💾 输出文件路径:', outputPath);

    // 开始渲染
    console.log('🎥 开始渲染视频...');
    await renderMedia({
      composition: comps,
      serveUrl: bundled,
      codec: options.format === 'mp4' ? 'h264' : 'gif',
      outputLocation: outputPath,
      inputProps: {
        design,
        ...options
      },
      onProgress: ({ progress }) => {
        const job = renderJobs.get(jobId);
        if (job) {
          job.progress = Math.round(50 + (progress * 50)); // 50-100%
          console.log(`📈 渲染进度: ${job.progress}%`);
        }
      },
    });

    // 渲染完成，更新任务状态
    const finalJob = renderJobs.get(jobId);
    if (finalJob) {
      finalJob.status = 'COMPLETED';
      finalJob.progress = 100;
      finalJob.url = `/renders/${jobId}.${options.format}`;
      console.log('🎉 视频渲染完成!', {
        jobId,
        outputPath,
        url: finalJob.url
      });
    }

  } catch (error) {
    console.error('💥 渲染失败:', error);
    const job = renderJobs.get(jobId);
    if (job) {
      job.status = 'ERROR';
      job.error = error instanceof Error ? error.message : '未知错误';
    }
  }
}

// API 处理函数
export async function handleRenderRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  
  if (request.method === 'POST') {
    // 开始新的渲染任务
    try {
      const body: RenderRequest = await request.json();
      const { design, options } = body;

      // 验证请求数据
      if (!design || !options) {
        return new Response(
          JSON.stringify({ error: '缺少必要的设计数据或选项' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // 创建新的渲染任务
      const jobId = generateJobId();
      const newJob: RenderJob = {
        id: jobId,
        status: 'PENDING',
        progress: 0,
      };

      renderJobs.set(jobId, newJob);

      // 异步开始渲染
      startRender(jobId, design, options);

      return new Response(
        JSON.stringify({
          video: { id: jobId, status: 'PENDING', progress: 0 }
        }),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json' }
        }
      );

    } catch (error) {
      return new Response(
        JSON.stringify({ error: '请求解析失败' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  if (request.method === 'GET') {
    // 查询渲染状态
    const id = url.searchParams.get('id');
    const type = url.searchParams.get('type');

    if (!id || type !== 'VIDEO_RENDERING') {
      return new Response(
        JSON.stringify({ error: '缺少必要参数' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const job = renderJobs.get(id);
    if (!job) {
      return new Response(
        JSON.stringify({ error: '任务不存在' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        video: {
          id: job.id,
          status: job.status,
          progress: job.progress,
          url: job.url,
          error: job.error,
        }
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  return new Response('方法不允许', { status: 405 });
} 