# multitools

日常の細かいタスクを効率化するための汎用ツール集。十徳ナイフのように、必要なときに必要なツールをサッと使えることを目指します。

## コンセプト

- **機能ごとにディレクトリを分割** — 各ツールは独立したディレクトリで管理
- **言語不問** — タスクに最適な言語・技術を選択（Python, Shell, Go, JS/TS, etc.）
- **利用形態も自由** — CLI で実行するもの、UI を持つもの、バッチ処理など用途に応じて
- **シンプルで実用的** — 過度な抽象化より、すぐ動くことを優先

## アーキテクチャ

Web ツールは Next.js (App Router) で `localhost:3000` に集約。動画変換などの重い処理も WASM (ffmpeg.wasm) でブラウザ内に閉じており、静的サイトとして配信できる。OS 連携が必要なものは CLI ツールで対応。

## ディレクトリ構成

```
multitools/
├── README.md
├── web/                    # Next.js アプリケーション（ツールのハブ）
│   └── src/app/tools/      # 各 Web ツールのページ
└── <tool-name>/            # CLI・バッチ系ツール（機能ごと）
    ├── README.md
    └── ...
```

## 開発ルール

- ツールを追加する際は、このREADMEのツール一覧と `web/src/app/tools.ts` を更新する
- 各ツールには個別の README.md を用意し、機能・使い方を記載する

## セットアップ

```bash
cd web && npm install && npm run dev
# http://localhost:3000
```

## ツール一覧

| ツール名 | 概要 | 種別 | 言語 |
|---------|------|------|------|
| [ハッシュ変換](web/src/app/tools/hash-converter/) | 入力文字列を複数のハッシュ値に変換 | Web | TypeScript |
| [文字コード変換](web/src/app/tools/encoding-converter/) | UTF-8 / Shift_JIS / EUC-JP の相互変換 | Web | TypeScript |
| [Nostr Key Converter](web/src/app/tools/nostr-key-converter/) | npub / nsec を hex に変換 | Web | TypeScript |
| [IPアドレス確認](web/src/app/tools/ip-address/) | 現在のアクセス元グローバルIPアドレスを表示 | Web | TypeScript |
| [アルファベット対応表](web/src/app/tools/alphabet-marker/) | アルファベットを5つごとに区切ってマーキング | Web | TypeScript |
| [五十音マーカー](web/src/app/tools/gojuon-marker/) | 五十音表の押したかなをマーキングして確認 | Web | TypeScript |
| [Video Converter](web/src/app/tools/video-converter/) | 動画のアスペクト比修正と安定フォーマット(H.264+AAC)変換をブラウザ内で完結 | Web | TypeScript |

## デプロイ (Cloudflare Pages)

すべてのツールがブラウザ完結のため、静的サイトとして配信できる。`web/next.config.ts` で `output: "export"` を設定済み。

- Root directory: `web`
- Build command: `npm run build`
- Build output directory: `out`

ローカルでの静的ビルド確認:

```bash
cd web && npm run build
# 成果物は web/out/
```
