"use client";

import { useMemo, useState } from "react";
import { nip19 } from "nostr-tools";

type ConvertResult = {
  type: "npub" | "nsec";
  hex: string;
};

function convertToHex(input: string): ConvertResult | null {
  const value = input.trim();
  if (!value) return null;

  const decoded = nip19.decode(value);
  if (decoded.type !== "npub" && decoded.type !== "nsec") {
    throw new Error("npub または nsec のみ変換できます");
  }

  if (typeof decoded.data !== "string") {
    throw new Error("変換結果が想定外の形式です");
  }

  return {
    type: decoded.type,
    hex: decoded.data,
  };
}

export default function NostrKeyConverter() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    try {
      return {
        value: convertToHex(input),
        error: "",
      };
    } catch (err) {
      return {
        value: null,
        error: err instanceof Error ? err.message : "変換に失敗しました",
      };
    }
  }, [input]);

  const copyHex = async () => {
    if (!result.value) return;

    try {
      await navigator.clipboard.writeText(result.value.hex);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const handleInput = (value: string) => {
    setInput(value);
    setCopied(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Nostr Key Converter
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          npub / nsec を hex に変換します。変換はブラウザ内だけで行われます。
        </p>
      </div>

      <div className="max-w-2xl space-y-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div>
          <label
            htmlFor="nostr-key"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            npub または nsec
          </label>
          <textarea
            id="nostr-key"
            value={input}
            onChange={(event) => handleInput(event.target.value)}
            placeholder="npub1... または nsec1..."
            rows={4}
            spellCheck={false}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 font-mono text-sm text-zinc-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </div>

        {result.value?.type === "nsec" && (
          <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
            nsec は秘密鍵です。共有・公開・スクリーンショットには注意してください。
          </div>
        )}

        {result.error && input.trim() && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {result.error}
          </div>
        )}

        <div>
          <div className="mb-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            hex
          </div>
          <div className="min-h-16 break-all rounded-md bg-zinc-100 p-3 font-mono text-sm text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
            {result.value?.hex || "変換結果がここに表示されます"}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copyHex}
            disabled={!result.value}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {copied ? "コピー済み" : "hexをコピー"}
          </button>
          <button
            type="button"
            onClick={() => handleInput("")}
            disabled={!input}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            クリア
          </button>
        </div>
      </div>

      <div className="max-w-2xl rounded-lg bg-zinc-100 p-4 text-sm text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
        対応形式は NIP-19 の npub と nsec です。nprofile、nevent、note
        などは対象外です。
      </div>
    </div>
  );
}
