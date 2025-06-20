import { IDesign } from "@designcombo/types";
import { create } from "zustand";
import { buildApiUrl, API_CONFIG } from "../../../config/api";
import useStore from "./use-store";

interface Output {
  url: string;
  type: string;
}

interface DownloadState {
  projectId: string;
  exporting: boolean;
  exportType: "json" | "mp4";
  progress: number;
  output?: Output;
  payload?: IDesign;
  displayProgressModal: boolean;
  actions: {
    setProjectId: (projectId: string) => void;
    setExporting: (exporting: boolean) => void;
    setExportType: (exportType: "json" | "mp4") => void;
    setProgress: (progress: number) => void;
    setState: (state: Partial<DownloadState>) => void;
    setOutput: (output: Output) => void;
    startExport: () => void;
    setDisplayProgressModal: (displayProgressModal: boolean) => void;
  };
}

export const useDownloadState = create<DownloadState>((set, get) => ({
  projectId: "",
  exporting: false,
  exportType: "mp4",
  progress: 0,
  displayProgressModal: false,
  actions: {
    setProjectId: (projectId) => set({ projectId }),
    setExporting: (exporting) => set({ exporting }),
    setExportType: (exportType) => set({ exportType }),
    setProgress: (progress) => set({ progress }),
    setState: (state) => set({ ...state }),
    setOutput: (output) => set({ output }),
    setDisplayProgressModal: (displayProgressModal) =>
      set({ displayProgressModal }),
    startExport: async () => {
      try {
        // Set exporting to true at the start
        set({ exporting: true, displayProgressModal: true });

        // Assume payload to be stored in the state for POST request
        const { payload } = get();

        if (!payload) throw new Error("Payload is not defined");

        // 添加调试日志
        console.log("🎬 开始导出视频");
        console.log("📊 设计数据:", payload);
        console.log("🎯 trackItemsMap数量:", Object.keys(payload.trackItemsMap || {}).length);
        console.log("📏 视频尺寸:", payload.size);
        console.log("⏱️ 持续时间:", payload.duration);
        
        // 检查是否有trackItems
        if (!payload.trackItemsMap || Object.keys(payload.trackItemsMap).length === 0) {
          console.warn("⚠️ 警告: 没有找到任何轨道项目，可能导致空白视频");
        }

        const requestBody = {
          design: payload,
          options: {
            fps: useStore.getState().fps,
            size: payload.size,
            format: "mp4",
          },
        };

        console.log("📡 发送给API的数据:", requestBody);

        // Step 1: POST request to start rendering
        const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.RENDER), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) throw new Error("Failed to submit export request.");

        const jobInfo = await response.json();
        console.log("✅ 渲染任务已创建:", jobInfo);
        const videoId = jobInfo.video.id;

        // Step 2 & 3: Polling for status updates
        const checkStatus = async () => {
          const statusResponse = await fetch(
            buildApiUrl(API_CONFIG.ENDPOINTS.RENDER, { 
              id: videoId, 
              type: 'VIDEO_RENDERING' 
            }),
          );

          if (!statusResponse.ok)
            throw new Error("Failed to fetch export status.");

          const statusInfo = await statusResponse.json();
          const { status, progress, url } = statusInfo.video;

          console.log(`📈 渲染进度: ${progress}% (状态: ${status})`);
          set({ progress });

          if (status === "COMPLETED") {
            console.log("🎉 渲染完成!", { url });
            set({ exporting: false, output: { url, type: get().exportType } });
          } else if (status === "PENDING" || status === "PROCESSING") {
            setTimeout(checkStatus, 2500);
          } else if (status === "ERROR") {
            console.error("❌ 渲染失败");
            set({ exporting: false });
          }
        };

        checkStatus();
      } catch (error) {
        console.error("💥 导出出错:", error);
        set({ exporting: false });
      }
    },
  },
}));
