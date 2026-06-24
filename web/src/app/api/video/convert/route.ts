import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import { access, mkdir } from "fs/promises";
import path from "path";

const execFileAsync = promisify(execFile);

const TMP_DIR = path.join(process.cwd(), "tmp");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, filePath, aspectWidth, aspectHeight } = body;

    if (!id || !filePath) {
      return NextResponse.json({ error: "パラメータが不足しています" }, { status: 400 });
    }

    await access(filePath);
    await mkdir(TMP_DIR, { recursive: true });

    const outputPath = path.join(TMP_DIR, `${id}_converted.mp4`);

    // 安定フォーマット: H.264 + AAC + MP4
    // - H.264: 最も互換性の高い動画コーデック
    // - AAC: 音ずれが起きにくい音声コーデック
    // - cfr (Constant Frame Rate): 可変フレームレートによる音ずれ防止
    // - async 1: 音声同期の補正
    const args: string[] = [
      "-i", filePath,
      "-c:v", "libx264",
      "-preset", "medium",
      "-crf", "18",
      "-c:a", "aac",
      "-b:a", "192k",
      "-ar", "48000",
      "-ac", "2",
      "-vsync", "cfr",
      "-async", "1",
      "-movflags", "+faststart",
      "-pix_fmt", "yuv420p",
    ];

    // アスペクト比の変更が指定されている場合
    if (aspectWidth && aspectHeight) {
      const w = parseInt(aspectWidth);
      const h = parseInt(aspectHeight);
      if (w > 0 && h > 0) {
        args.push("-aspect", `${w}:${h}`);
      }
    }

    args.push("-y", outputPath);

    await execFileAsync("ffmpeg", args, { timeout: 600_000 });

    return NextResponse.json({
      success: true,
      outputPath,
      outputFileName: `converted_${path.basename(filePath, path.extname(filePath))}.mp4`,
    });
  } catch (err) {
    console.error("convert error:", err);
    return NextResponse.json(
      { error: "変換に失敗しました" },
      { status: 500 }
    );
  }
}
