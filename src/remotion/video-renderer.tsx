import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { IDesign } from '@designcombo/types';
import { SequenceItem } from '../features/editor/player/sequence-item';
import { groupTrackItems } from '../features/editor/utils/track-items';
import { merge } from 'lodash';

interface VideoRendererProps {
  design: IDesign;
  fps: number;
  size: { width: number; height: number };
}

export const VideoRenderer: React.FC<VideoRendererProps> = ({ design, fps, size }) => {
  const frame = useCurrentFrame();
  const config = useVideoConfig();
  
  // 使用传入的fps而不是config的fps，确保一致性
  const currentFps = fps || config.fps;

  // 检查设计数据是否有效
  if (!design || !design.trackItemsMap || Object.keys(design.trackItemsMap).length === 0) {
    return (
      <div
        style={{
          width: size.width || config.width,
          height: size.height || config.height,
          backgroundColor: '#000000',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontSize: '24px',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div>无内容 - 请检查设计数据</div>
      </div>
    );
  }

  // 合并track items数据，与预览保持一致
  const mergedTrackItemsDetailsMap = merge(design.trackItemsMap, design.trackItemDetailsMap);
  const trackItemIds = Object.keys(design.trackItemsMap);
  
  // 分组track items，与预览保持一致
  const groupedItems = groupTrackItems({
    trackItemIds,
    transitionsMap: design.transitionsMap || {},
    trackItemsMap: mergedTrackItemsDetailsMap,
  });

  return (
    <div
      style={{
        width: size.width || config.width,
        height: size.height || config.height,
        backgroundColor: '#000000',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {groupedItems.map((group, index) => {
        if (group.length === 1) {
          const item = mergedTrackItemsDetailsMap[group[0].id];
          // 使用与预览相同的SequenceItem渲染器
          return SequenceItem[item.type]?.(item, {
            fps: currentFps,
            // 渲染时不需要这些交互功能
            handleTextChange: undefined,
            onTextBlur: undefined,
            editableTextId: null,
          });
        }
        return null;
      })}
    </div>
  );
}; 