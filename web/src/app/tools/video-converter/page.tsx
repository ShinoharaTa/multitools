"use client";

import { useEffect, useRef, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

type VideoInfo = {
  fileName: string;
  size: number;
  duration: number;
  width: number;
  height: number;
  computedAspect: string;
};

type ConvertResult = {
  url: string;
  fileName: string;
  size: number;
};

const FFMPEG_CORE_VERSION = "0.12.10";
const FFMPEG_CORE_BASE = `https://unpkg.com/@ffmpeg/core@${FFMPEG_CORE_VERSION}/dist/umd`;

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
  if (!Number.isFinite(seconds) || seconds <= 0) return "-";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0)
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

async function readVideoMetadata(file: File): Promise<VideoInfo> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;

    video.onloadedmetadata = () => {
      const width = video.videoWidth;
      const height = video.videoHeight;
      const g = width && height ? gcd(width, height) : 1;
      const computedAspect =
        width && height ? `${width / g}:${height / g}` : "-";
      URL.revokeObjectURL(url);
      resolve({
        fileName: file.name,
        size: file.size,
        duration: video.duration,
        width,
        height,
        computedAspect,
      });
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("動画メタデータの読み込みに失敗しました"));
    };

    video.src = url;
  });
}

export default function VideoConverter() {
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const inputFileRef = useRef<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [loadingCore, setLoadingCore] = useState(false);
  const [coreReady, setCoreReady] = useState(false);
  const [info, setInfo] = useState<VideoInfo | null>(null);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ConvertResult | null>(null);
  const [error, setError] = useState("");
  const [aspectPreset, setAspectPreset] = useState(0);
  const [customW, setCustomW] = useState("");
  const [customH, setCustomH] = useState("");

  useEffect(() => {
    return () => {
      if (result) URL.revokeObjectURL(result.url);
    };
  }, [result]);

  const ensureFFmpeg = async () => {
    if (ffmpegRef.current && coreReady) return ffmpegRef.current;

    setLoadingCore(true);
    setError("");
    try {
      const ffmpeg = ffmpegRef.current ?? new FFmpeg();
      ffmpegRef.current = ffmpeg;

      ffmpeg.on("progress", ({ progress: p }) => {
        setProgress(Math.min(100, Math.max(0, Math.round(p * 100))));
      });

      await ffmpeg.load({
        coreURL: await toBlobURL(
          `${FFMPEG_CORE_BASE}/ffmpeg-core.js`,
          "text/javascript"
        ),
        wasmURL: await toBlobURL(
          `${FFMPEG_CORE_BASE}/ffmpeg-core.wasm`,
          "application/wasm"
        ),
      });

      setCoreReady(true);
      return ffmpeg;
    } finally {
      setLoadingCore(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setInfo(null);
    setResult(null);
    setProgress(0);
    setAspectPreset(0);
    inputFileRef.current = file;

    try {
      const meta = await readVideoMetadata(file);
      setInfo(meta);
    } catch {
      setError("動画の解析に失敗しました");
    }
  };

  const handleConvert = async () => {
    const file = inputFileRef.current;
    if (!file) return;

    setConverting(true);
    setError("");
    setResult(null);
    setProgress(0);

    try {
      const ffmpeg = await ensureFFmpeg();

      const inputName = `input_${file.name.replace(/[^\w.-]/g, "_")}`;
      const outputName = "output.mp4";

      await ffmpeg.writeFile(inputName, await fetchFile(file));

      const preset = ASPECT_PRESETS[aspectPreset];
      const aspectWidth = preset.w === "custom" ? customW : preset.w;
      const aspectHeight = preset.h === "custom" ? customH : preset.h;

      const args: string[] = [
        "-i",
        inputName,
        "-c:v",
        "libx264",
        "-preset",
        "medium",
        "-crf",
        "18",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-ar",
        "48000",
        "-ac",
        "2",
        "-fps_mode",
        "cfr",
        "-movflags",
        "+faststart",
        "-pix_fmt",
        "yuv420p",
      ];

      const w = parseInt(aspectWidth);
      const h = parseInt(aspectHeight);
      if (w > 0 && h > 0) {
        args.push("-aspect", `${w}:${h}`);
      }

      args.push(outputName);

      await ffmpeg.exec(args);

      const data = await ffmpeg.readFile(outputName);
      const bytes = new Uint8Array(data as Uint8Array);
      const blob = new Blob([bytes], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      const baseName = file.name.replace(/\.[^.]+$/, "");

      await ffmpeg.deleteFile(inputName).catch(() => {});
      await ffmpeg.deleteFile(outputName).catch(() => {});

      setResult({
        url,
        fileName: `converted_${baseName}.mp4`,
        size: blob.size,
      });
      setProgress(100);
    } catch (err) {
      console.error("convert error:", err);
      setError("変換に失敗しました");
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Video Converter
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          動画のアスペクト比を修正し、安定したフォーマット (H.264 + AAC / MP4)
          にブラウザ内で変換します
        </p>
      </div>

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
          クリックまたはドラッグ&ドロップで動画ファイルを選択
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {info && (
        <div className="space-y-4">
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800">
            <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                {info.fileName}
              </h2>
              <p className="text-xs text-zinc-500">
                {formatBytes(info.size)} / {formatDuration(info.duration)}
              </p>
            </div>
            <div className="p-4">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-3">
                <div className="flex justify-between">
                  <dt className="text-zinc-500">解像度</dt>
                  <dd className="font-mono text-zinc-900 dark:text-zinc-100">
                    {info.width}x{info.height}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-500">アスペクト比</dt>
                  <dd className="font-mono text-zinc-900 dark:text-zinc-100">
                    {info.computedAspect}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-500">長さ</dt>
                  <dd className="font-mono text-zinc-900 dark:text-zinc-100">
                    {formatDuration(info.duration)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

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
                <p className="mt-2 text-amber-600 dark:text-amber-400">
                  ※ 変換はブラウザ内で実行されます。初回は ffmpeg
                  コア (約30MB) の読み込みに時間がかかります。
                </p>
              </div>
            </div>

            <button
              onClick={handleConvert}
              disabled={converting || loadingCore}
              className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {loadingCore
                ? "コア読み込み中..."
                : converting
                  ? `変換中... ${progress}%`
                  : "変換する"}
            </button>

            {(converting || loadingCore) && (
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                <div
                  className="h-full bg-blue-600 transition-all"
                  style={{ width: loadingCore ? "100%" : `${progress}%` }}
                />
              </div>
            )}
          </div>

          {result && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-300">
                変換完了 ({formatBytes(result.size)})
              </h3>
              <a
                href={result.url}
                download={result.fileName}
                className="mt-2 inline-block rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
              >
                ダウンロード ({result.fileName})
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
