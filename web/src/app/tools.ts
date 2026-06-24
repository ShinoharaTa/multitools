export type Tool = {
  id: string;
  name: string;
  description: string;
  path: string;
  tags: string[];
};

export const tools: Tool[] = [
  {
    id: "alphabet-marker",
    name: "アルファベット対応表",
    description: "アルファベットを5つごとに区切ってマーキング",
    path: "/tools/alphabet-marker",
    tags: ["英語", "アルファベット", "マーカー"],
  },
  {
    id: "gojuon-marker",
    name: "五十音マーカー",
    description: "五十音表の押したかなをマーキングして確認",
    path: "/tools/gojuon-marker",
    tags: ["日本語", "五十音", "マーカー"],
  },
  {
    id: "video-converter",
    name: "Video Converter",
    description: "動画のアスペクト比確認・修正、安定フォーマット(H.264+AAC)への変換",
    path: "/tools/video-converter",
    tags: ["動画", "変換", "ffmpeg"],
  },
];
