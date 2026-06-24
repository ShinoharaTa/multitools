import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import { randomUUID } from "crypto";

const execFileAsync = promisify(execFile);

const TMP_DIR = path.join(process.cwd(), "tmp");

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "ファイルが選択されていません" }, { status: 400 });
    }

    await mkdir(TMP_DIR, { recursive: true });

    const id = randomUUID();
    const ext = path.extname(file.name) || ".mp4";
    const filePath = path.join(TMP_DIR, `${id}${ext}`);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const { stdout } = await execFileAsync("ffprobe", [
      "-v", "quiet",
      "-print_format", "json",
      "-show_format",
      "-show_streams",
      filePath,
    ]);

    const probe = JSON.parse(stdout);
    const videoStream = probe.streams?.find((s: Record<string, string>) => s.codec_type === "video");
    const audioStream = probe.streams?.find((s: Record<string, string>) => s.codec_type === "audio");

    if (!videoStream) {
      return NextResponse.json({ error: "動画ストリームが見つかりません" }, { status: 400 });
    }

    const width = parseInt(videoStream.width);
    const height = parseInt(videoStream.height);
    const dar = videoStream.display_aspect_ratio || `${width}:${height}`;
    const sar = videoStream.sample_aspect_ratio || "1:1";

    // GCD でアスペクト比を計算
    function gcd(a: number, b: number): number {
      return b === 0 ? a : gcd(b, a % b);
    }
    const g = gcd(width, height);
    const computedAspect = `${width / g}:${height / g}`;

    return NextResponse.json({
      id,
      fileName: file.name,
      filePath,
      video: {
        codec: videoStream.codec_name,
        width,
        height,
        dar,
        sar,
        computedAspect,
        fps: videoStream.r_frame_rate,
        bitrate: videoStream.bit_rate,
        pixFmt: videoStream.pix_fmt,
      },
      audio: audioStream
        ? {
            codec: audioStream.codec_name,
            sampleRate: audioStream.sample_rate,
            channels: audioStream.channels,
            bitrate: audioStream.bit_rate,
          }
        : null,
      format: {
        name: probe.format?.format_name,
        duration: parseFloat(probe.format?.duration || "0"),
        size: parseInt(probe.format?.size || "0"),
        bitrate: parseInt(probe.format?.bit_rate || "0"),
      },
    });
  } catch (err) {
    console.error("analyze error:", err);
    return NextResponse.json(
      { error: "動画の解析に失敗しました" },
      { status: 500 }
    );
  }
}
