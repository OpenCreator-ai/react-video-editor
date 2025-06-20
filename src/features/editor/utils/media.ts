export interface MediaMetadata {
  width: number;
  height: number;
  duration?: number; // 对于视频文件
}

/**
 * 获取视频文件的元数据
 */
export const getVideoMetadata = (file: File): Promise<MediaMetadata> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    
    video.preload = 'metadata';
    video.muted = true;
    
    video.onloadedmetadata = () => {
      resolve({
        width: video.videoWidth,
        height: video.videoHeight,
        duration: video.duration * 1000, // 转换为毫秒
      });
      URL.revokeObjectURL(url);
    };
    
    video.onerror = () => {
      reject(new Error('无法加载视频文件'));
      URL.revokeObjectURL(url);
    };
    
    video.src = url;
  });
};

/**
 * 获取图片文件的元数据
 */
export const getImageMetadata = (file: File): Promise<MediaMetadata> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
      URL.revokeObjectURL(url);
    };
    
    img.onerror = () => {
      reject(new Error('无法加载图片文件'));
      URL.revokeObjectURL(url);
    };
    
    img.src = url;
  });
};

/**
 * 上传文件到服务器并返回URL
 */
export const uploadFile = async (file: File): Promise<string> => {
  // 这里你可能需要实现具体的上传逻辑
  // 为了演示，我们使用 URL.createObjectURL 生成本地URL
  // 在实际应用中，你应该上传到云存储服务或你的服务器
  
  // 创建本地对象URL
  const objectUrl = URL.createObjectURL(file);
  
  // 在实际应用中，这里应该是类似这样的代码：
  // const formData = new FormData();
  // formData.append('file', file);
  // const response = await fetch('/api/upload', {
  //   method: 'POST',
  //   body: formData
  // });
  // const { url } = await response.json();
  // return url;
  
  return objectUrl;
};

/**
 * 生成视频缩略图
 */
export const generateVideoThumbnail = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('无法创建canvas上下文'));
      return;
    }
    
    const url = URL.createObjectURL(file);
    video.preload = 'metadata';
    video.muted = true;
    
    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      video.currentTime = 0.1; // 获取第0.1秒的帧
    };
    
    video.onseeked = () => {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
      resolve(thumbnailUrl);
      URL.revokeObjectURL(url);
    };
    
    video.onerror = () => {
      reject(new Error('无法生成视频缩略图'));
      URL.revokeObjectURL(url);
    };
    
    video.src = url;
  });
}; 