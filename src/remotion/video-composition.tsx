import React from 'react';
import { Composition } from 'remotion';
import { VideoRenderer } from './video-renderer';
import { IDesign } from '@designcombo/types';

interface VideoProps {
  design: IDesign;
  fps: number;
  size: { width: number; height: number };
}

// 类型兼容的包装组件
const VideoRendererWrapper: React.FC<Record<string, unknown>> = (props) => {
  const typedProps = props as unknown as VideoProps;
  return <VideoRenderer {...typedProps} />;
};

// 计算设计的总时长（以帧为单位）
const calculateDurationInFrames = (design: IDesign, fps: number): number => {
  if (!design.trackItemsMap || Object.keys(design.trackItemsMap).length === 0) {
    return 300; // 默认10秒，如果没有内容
  }

  let maxEndTime = 0;
  
  // 遍历所有track items找到最大的结束时间
  Object.values(design.trackItemsMap).forEach((item: any) => {
    if (item.display && item.display.to) {
      maxEndTime = Math.max(maxEndTime, item.display.to);
    }
  });

  // 如果没有找到有效的时长，使用design.duration或默认值
  if (maxEndTime === 0) {
    maxEndTime = design.duration || 10000; // 默认10秒（毫秒）
  }

  // 转换为帧数（毫秒转秒再乘以fps）
  return Math.ceil((maxEndTime / 1000) * fps);
};

export const VideoComposition: React.FC = () => {
  return (
    <Composition
      id="VideoComposition"
      component={VideoRendererWrapper}
      durationInFrames={300} // 这将在运行时被calculateMetadata覆盖
      fps={30} // 这将在运行时被calculateMetadata覆盖
      width={1920}
      height={1080}
      defaultProps={{
        design: {} as IDesign,
        fps: 30,
        size: { width: 1920, height: 1080 }
      }}
      calculateMetadata={({ props }) => {
        const videoProps = props as unknown as VideoProps;
        const { design, fps, size } = videoProps;
        const durationInFrames = calculateDurationInFrames(design, fps || 30);
        
        return {
          durationInFrames,
          fps: fps || 30, // 使用传入的fps
          width: size?.width || design.size?.width || 1920,
          height: size?.height || design.size?.height || 1080,
        };
      }}
    />
  );
}; 