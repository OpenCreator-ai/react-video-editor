import useStore from "../store/use-store";
import { useEffect, useRef, useState } from "react";
import { Droppable } from "@/components/ui/droppable";
import { PlusIcon } from "lucide-react";
import { DroppableArea } from "./droppable";
import { dispatch } from "@designcombo/events";
import { ADD_VIDEO, ADD_IMAGE } from "@designcombo/state";
import { generateId } from "@designcombo/timeline";
import { getVideoMetadata, getImageMetadata, uploadFile, generateVideoThumbnail } from "../utils/media";

const SceneEmpty = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [desiredSize, setDesiredSize] = useState({ width: 0, height: 0 });
  const { size } = useStore();

  useEffect(() => {
    const container = containerRef.current!;
    const PADDING = 96;
    const containerHeight = container.clientHeight - PADDING;
    const containerWidth = container.clientWidth - PADDING;
    const { width, height } = size;

    const desiredZoom = Math.min(
      containerWidth / width,
      containerHeight / height,
    );
    setDesiredSize({
      width: width * desiredZoom,
      height: height * desiredZoom,
    });
    setIsLoading(false);
  }, [size]);

  const onSelectFiles = async (files: File[]) => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    setUploadError(null);
    
    try {
      for (const file of files) {
        const fileType = file.type;
        
        // 检查文件大小
        if (file.size > 50 * 1024 * 1024) {
          throw new Error(`文件 ${file.name} 超过50MB大小限制`);
        }
        
        if (fileType.startsWith('video/')) {
          // 处理视频文件
          console.log('正在处理视频文件:', file.name);
          
          // 获取视频元数据
          const metadata = await getVideoMetadata(file);
          console.log('视频元数据:', metadata);
          
          // 上传文件
          const src = await uploadFile(file);
          
          // 生成缩略图
          let previewUrl = '';
          try {
            previewUrl = await generateVideoThumbnail(file);
          } catch (error) {
            console.warn('生成视频缩略图失败:', error);
          }
          
          // 添加视频到时间线
          dispatch(ADD_VIDEO, {
            payload: {
              id: generateId(),
              type: "video",
              display: {
                from: 0,
                to: metadata.duration || 5000, // 使用实际视频时长或默认5秒
              },
              details: {
                src: src,
                width: metadata.width,
                height: metadata.height,
                volume: 50, // 默认音量50%
              },
              metadata: {
                previewUrl: previewUrl,
                duration: metadata.duration,
                width: metadata.width,
                height: metadata.height,
              },
              trim: {
                from: 0,
                to: metadata.duration || 5000,
              },
            },
            options: {
              resourceId: "main",
              scaleMode: "fit",
            },
          });
          
        } else if (fileType.startsWith('image/')) {
          // 处理图片文件
          console.log('正在处理图片文件:', file.name);
          
          // 获取图片元数据
          const metadata = await getImageMetadata(file);
          console.log('图片元数据:', metadata);
          
          // 上传文件
          const src = await uploadFile(file);
          
          // 添加图片到时间线
          dispatch(ADD_IMAGE, {
            payload: {
              id: generateId(),
              type: "image",
              display: {
                from: 0,
                to: 5000, // 图片默认显示5秒
              },
              details: {
                src: src,
                width: metadata.width,
                height: metadata.height,
              },
              metadata: {
                width: metadata.width,
                height: metadata.height,
              },
            },
            options: {
              scaleMode: "fit",
            },
          });
        } else {
          throw new Error(`不支持的文件类型: ${fileType}`);
        }
      }
      
      console.log('所有文件处理完成');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '文件上传失败';
      console.error('文件上传失败:', error);
      setUploadError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div ref={containerRef} className="absolute z-50 flex h-full w-full flex-1">
      {!isLoading ? (
        <Droppable
          maxFileCount={4}
          maxSize={50 * 1024 * 1024}
          disabled={false}
          onValueChange={onSelectFiles}
          className="h-full w-full flex-1 bg-background"
          accept={{
            "video/*": [".mp4", ".avi", ".mov", ".wmv", ".flv", ".webm"],
            "image/*": [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp"],
          }}
          multiple={true}
        >
          <DroppableArea
            onDragStateChange={setIsDraggingOver}
            className={`absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 transform items-center justify-center border border-dashed text-center transition-colors duration-200 ease-in-out ${
              isDraggingOver ? "border-white bg-white/10" : "border-white/15"
            }`}
            style={{
              width: desiredSize.width,
              height: desiredSize.height,
            }}
          >
            <div className="flex flex-col items-center justify-center gap-4 pb-12">
              <div className={`hover:bg-primary-dark cursor-pointer rounded-md border bg-primary p-2 text-secondary transition-colors duration-200 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <PlusIcon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="flex flex-col gap-px">
                <p className="text-sm text-muted-foreground">
                  {isUploading ? "正在上传..." : "点击上传"}
                </p>
                <p className="text-xs text-muted-foreground/70">
                  或拖拽文件到这里
                </p>
                {isUploading && (
                  <p className="text-xs text-blue-400 mt-1">
                    支持视频和图片文件
                  </p>
                )}
                {uploadError && (
                  <p className="text-xs text-red-400 mt-1">
                    {uploadError}
                  </p>
                )}
              </div>
            </div>
          </DroppableArea>
        </Droppable>
      ) : (
        <div className="flex flex-1 items-center justify-center bg-background-subtle text-sm text-muted-foreground">
          Loading...
        </div>
      )}
    </div>
  );
};

export default SceneEmpty;
