export type Tool = {
  id: string;
  name: string;
  description: string;
  path: string;
  tags: string[];
};

export const tools: Tool[] = [
  {
    id: "hash-converter",
    name: "ハッシュ変換",
    description: "入力文字列を複数のハッシュ値に変換",
    path: "/tools/hash-converter",
    tags: ["ハッシュ", "SHA-256", "MD5"],
  },
  {
    id: "encoding-converter",
    name: "文字コード変換",
    description: "UTF-8 / Shift_JIS / EUC-JP の相互変換",
    path: "/tools/encoding-converter",
    tags: ["文字コード", "Shift_JIS", "EUC-JP"],
  },
  {
    id: "nostr-key-converter",
    name: "Nostr Key Converter",
    description: "npub / nsec を hex に変換",
    path: "/tools/nostr-key-converter",
    tags: ["Nostr", "npub", "nsec"],
  },
  {
    id: "ip-address",
    name: "IPアドレス確認",
    description: "現在のアクセス元グローバルIPアドレスを表示",
    path: "/tools/ip-address",
    tags: ["ネットワーク", "IP", "確認"],
  },
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
