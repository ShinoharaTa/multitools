import { NextRequest, NextResponse } from "next/server";
import { readFile, access } from "fs/promises";

export async function GET(req: NextRequest) {
  const filePath = req.nextUrl.searchParams.get("path");
  const fileName = req.nextUrl.searchParams.get("name") || "converted.mp4";

  if (!filePath) {
    return NextResponse.json({ error: "パスが指定されていません" }, { status: 400 });
  }

  // tmp ディレクトリ外へのアクセスを防止
  if (!filePath.includes("/tmp/")) {
    return NextResponse.json({ error: "不正なパスです" }, { status: 403 });
  }

  try {
    await access(filePath);
    const buffer = await readFile(filePath);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch {
    return NextResponse.json({ error: "ファイルが見つかりません" }, { status: 404 });
  }
}
