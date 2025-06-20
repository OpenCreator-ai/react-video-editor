// API 配置
export const API_CONFIG = {
  // 本地渲染服务器地址
  RENDER_SERVER_URL: process.env.NODE_ENV === 'production' 
    ? 'https://your-production-server.com' 
    : 'http://localhost:3001',
  
  // API 端点
  ENDPOINTS: {
    RENDER: '/api/render',
    HEALTH: '/health',
  }
};

// 构建完整的 API URL
export const buildApiUrl = (endpoint: string, params?: Record<string, string>) => {
  const baseUrl = `${API_CONFIG.RENDER_SERVER_URL}${endpoint}`;
  
  if (params) {
    const searchParams = new URLSearchParams(params);
    return `${baseUrl}?${searchParams.toString()}`;
  }
  
  return baseUrl;
}; 