# multitools

日常の細かいタスクを効率化するための汎用ツール集。十徳ナイフのように、必要なときに必要なツールをサッと使えることを目指します。

## コンセプト

- **機能ごとにディレクトリを分割** — 各ツールは独立したディレクトリで管理
- **言語不問** — タスクに最適な言語・技術を選択（Python, Shell, Go, JS/TS, etc.）
- **利用形態も自由** — CLI で実行するもの、UI を持つもの、バッチ処理など用途に応じて
- **シンプルで実用的** — 過度な抽象化より、すぐ動くことを優先

## アーキテクチャ

Web ツールは Next.js (App Router) で `localhost:3000` に集約。ブラウザ完結の処理は WASM も活用し、OS 連携が必要なものは API Route または CLI ツールで対応。

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
| [五十音マーカー](web/src/app/tools/gojuon-marker/) | 五十音表の押したかなをマーキングして確認 | Web | TypeScript |
| [Video Converter](web/src/app/tools/video-converter/) | 動画のアスペクト比確認・修正、安定フォーマット(H.264+AAC)への変換 | Web | TypeScript |
