"use client";

import { useState, useRef } from "react";

type VideoInfo = {
  id: string;
  fileName: string;
  filePath: string;
  video: {
    codec: string;
    width: number;
    height: number;
    dar: string;
    sar: string;
    computedAspect: string;
    fps: string;
    bitrate: string;
    pixFmt: string;
  };
  audio: {
    codec: string;
    sampleRate: string;
    channels: number;
    bitrate: string;
  } | null;
  format: {
    name: string;
    duration: number;
    size: number;
    bitrate: number;
  };
};

type ConvertResult = {
  success: boolean;
  outputPath: string;
  outputFileName: string;
};

const ASPECT_PRESETS = [
  { label: "変更なし", w: "", h: "" },
  { label: "16:9", w: "16", h: "9" },
  { label: "4:3", w: "4", h: "3" },
  { label: "1:1", w: "1", h: "1" },
  { label: "9:16 (縦)", w: "9", h: "16" },
  { label: "21:9", w: "21", h: "9" },
  { label: "カスタム", w: "custom", h: "custom" },
];

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function VideoConverter() {
  const [info, setInfo] = useState<VideoInfo | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [converting, setConverting] = useState(false);
  const [result, setResult] = useState<ConvertResult | null>(null);
  const [error, setError] = useState("");
  const [aspectPreset, setAspectPreset] = useState(0);
  const [customW, setCustomW] = useState("");
  const [customH, setCustomH] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    setError("");
    setInfo(null);
    setResult(null);
    setAspectPreset(0);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/video/analyze", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "解析に失敗しました");
        return;
      }
      setInfo(data);
    } catch {
      setError("アップロードに失敗しました");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleConvert = async () => {
    if (!info) return;

    setConverting(true);
    setError("");
    setResult(null);

    const preset = ASPECT_PRESETS[aspectPreset];
    const aspectWidth = preset.w === "custom" ? customW : preset.w;
    const aspectHeight = preset.h === "custom" ? customH : preset.h;

    try {
      const res = await fetch("/api/video/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: info.id,
          filePath: info.filePath,
          aspectWidth,
          aspectHeight,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "変換に失敗しました");
        return;
      }
      setResult(data);
    } catch {
      setError("変換リクエストに失敗しました");
    } finally {
      setConverting(false);
    }
  };

  const warnings: string[] = [];
  if (info) {
    if (info.video.sar !== "1:1" && info.video.sar !== "N/A") {
      warnings.push(`SAR が ${info.video.sar} です。ピクセルが正方形ではないため表示が歪む可能性があります`);
    }
    if (info.video.codec !== "h264") {
      warnings.push(`動画コーデックが ${info.video.codec} です。H.264 に変換すると互換性が向上します`);
    }
    if (info.audio && info.audio.codec !== "aac") {
      warnings.push(`音声コーデックが ${info.audio.codec} です。AAC に変換すると音ずれが改善される場合があります`);
    }
    if (info.video.fps?.includes("/") && !info.video.fps.endsWith("/1")) {
      warnings.push(`可変フレームレートの可能性があります。CFR に変換すると音ずれが改善されます`);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Video Converter
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          動画のアスペクト比を確認・修正し、安定したフォーマット (H.264 + AAC / MP4) に変換します
        </p>
      </div>

      {/* アップロード */}
      <div
        className="cursor-pointer rounded-lg border-2 border-dashed border-zinc-300 p-8 text-center transition-colors hover:border-zinc-500 dark:border-zinc-700 dark:hover:border-zinc-500"
        onClick={() => fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept="video/*"
          onChange={handleUpload}
          className="hidden"
        />
        <p className="text-zinc-600 dark:text-zinc-400">
          {analyzing ? "解析中..." : "クリックまたはドラッグ&ドロップで動画ファイルを選択"}
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* 動画情報 */}
      {info && (
        <div className="space-y-4">
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800">
            <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                {info.fileName}
              </h2>
              <p className="text-xs text-zinc-500">
                {formatBytes(info.format.size)} / {formatDuration(info.format.duration)}
              </p>
            </div>
            <div className="grid gap-4 p-4 sm:grid-cols-2">
              {/* 映像情報 */}
              <div>
                <h3 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">映像</h3>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-zinc-500">コーデック</dt>
                    <dd className="font-mono text-zinc-900 dark:text-zinc-100">{info.video.codec}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-zinc-500">解像度</dt>
                    <dd className="font-mono text-zinc-900 dark:text-zinc-100">{info.video.width}x{info.video.height}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-zinc-500">アスペクト比 (計算値)</dt>
                    <dd className="font-mono text-zinc-900 dark:text-zinc-100">{info.video.computedAspect}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-zinc-500">DAR</dt>
                    <dd className="font-mono text-zinc-900 dark:text-zinc-100">{info.video.dar}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-zinc-500">SAR</dt>
                    <dd className="font-mono text-zinc-900 dark:text-zinc-100">{info.video.sar}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-zinc-500">FPS</dt>
                    <dd className="font-mono text-zinc-900 dark:text-zinc-100">{info.video.fps}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-zinc-500">ピクセルフォーマット</dt>
                    <dd className="font-mono text-zinc-900 dark:text-zinc-100">{info.video.pixFmt}</dd>
                  </div>
                </dl>
              </div>

              {/* 音声情報 */}
              <div>
                <h3 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">音声</h3>
                {info.audio ? (
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-zinc-500">コーデック</dt>
                      <dd className="font-mono text-zinc-900 dark:text-zinc-100">{info.audio.codec}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-zinc-500">サンプルレート</dt>
                      <dd className="font-mono text-zinc-900 dark:text-zinc-100">{info.audio.sampleRate} Hz</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-zinc-500">チャンネル</dt>
                      <dd className="font-mono text-zinc-900 dark:text-zinc-100">{info.audio.channels}ch</dd>
                    </div>
                  </dl>
                ) : (
                  <p className="text-sm text-zinc-500">音声トラックなし</p>
                )}
              </div>
            </div>
          </div>

          {/* 警告 */}
          {warnings.length > 0 && (
            <div className="rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
              <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">検出された問題</h3>
              <ul className="mt-2 space-y-1 text-sm text-amber-700 dark:text-amber-400">
                {warnings.map((w, i) => (
                  <li key={i}>・{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 変換設定 */}
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <h3 className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              変換設定
            </h3>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
                  アスペクト比
                </label>
                <div className="flex flex-wrap gap-2">
                  {ASPECT_PRESETS.map((p, i) => (
                    <button
                      key={p.label}
                      onClick={() => setAspectPreset(i)}
                      className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                        aspectPreset === i
                          ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          : "border-zinc-200 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-400"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {ASPECT_PRESETS[aspectPreset].w === "custom" && (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    placeholder="幅"
                    value={customW}
                    onChange={(e) => setCustomW(e.target.value)}
                    className="w-20 rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                  />
                  <span className="text-zinc-500">:</span>
                  <input
                    type="number"
                    min="1"
                    placeholder="高さ"
                    value={customH}
                    onChange={(e) => setCustomH(e.target.value)}
                    className="w-20 rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                  />
                </div>
              )}

              <div className="rounded bg-zinc-100 p-3 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                <p className="font-medium">変換内容:</p>
                <ul className="mt-1 space-y-0.5">
                  <li>・映像: H.264 (CRF 18, yuv420p)</li>
                  <li>・音声: AAC 192kbps / 48kHz / ステレオ</li>
                  <li>・CFR (固定フレームレート) に変換して音ずれを防止</li>
                  <li>・MP4 コンテナ (faststart)</li>
                </ul>
              </div>
            </div>

            <button
              onClick={handleConvert}
              disabled={converting}
              className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {converting ? "変換中..." : "変換する"}
            </button>
          </div>

          {/* 変換結果 */}
          {result && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-300">
                変換完了
              </h3>
              <a
                href={`/api/video/download?path=${encodeURIComponent(result.outputPath)}&name=${encodeURIComponent(result.outputFileName)}`}
                className="mt-2 inline-block rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
              >
                ダウンロード ({result.outputFileName})
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
