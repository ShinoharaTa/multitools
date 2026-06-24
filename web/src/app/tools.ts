export type Tool = {
  id: string;
  name: string;
  description: string;
  path: string;
  tags: string[];
};

export const tools: Tool[] = [
  {
    id: "video-converter",
    name: "Video Converter",
    description: "動画のアスペクト比確認・修正、安定フォーマット(H.264+AAC)への変換",
    path: "/tools/video-converter",
    tags: ["動画", "変換", "ffmpeg"],
  },
];
