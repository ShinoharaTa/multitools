# Nostr Key Converter

Nostr の `npub` / `nsec` を hex に変換するツール。

## 機能

- **npub -> hex** — Nostr 公開鍵の Bech32 形式を hex に変換
- **nsec -> hex** — Nostr 秘密鍵の Bech32 形式を hex に変換
- **コピー** — 変換後の hex をクリップボードにコピー
- **ブラウザ完結** — 入力値はサーバーに送信されず、ブラウザ内でのみ処理

## 注意

- `nsec` は秘密鍵です。共有・公開・スクリーンショットには注意してください
- 対応形式は NIP-19 の `npub` と `nsec` のみ
- `nprofile`、`nevent`、`note` などは対象外
