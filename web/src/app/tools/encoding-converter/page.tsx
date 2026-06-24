"use client";

import { useMemo, useState } from "react";
import * as Encoding from "encoding-japanese";

type EncodingName = "UTF8" | "SJIS" | "EUCJP";

const ENCODINGS: { value: EncodingName; label: string }[] = [
  { value: "UTF8", label: "UTF-8" },
  { value: "SJIS", label: "Shift_JIS" },
  { value: "EUCJP", label: "EUC-JP" },
];

function bytesToHex(bytes: number[]) {
  return bytes.map((byte) => byte.toString(16).padStart(2, "0")).join(" ");
}

function bytesToPercent(bytes: number[]) {
  return bytes
    .map((byte) => `%${byte.toString(16).padStart(2, "0").toUpperCase()}`)
    .join("");
}

function encodeText(input: string, encoding: EncodingName) {
  return Encoding.convert(Encoding.stringToCode(input), {
    from: "UNICODE",
    to: encoding,
    type: "array",
  });
}

function decodeBytes(bytes: number[], encoding: EncodingName) {
  return Encoding.convert(bytes, {
    from: encoding,
    to: "UNICODE",
    type: "string",
  });
}

export default function EncodingConverter() {
  const [sourceEncoding, setSourceEncoding] = useState<EncodingName>("SJIS");
  const [targetEncoding, setTargetEncoding] = useState<EncodingName>("UTF8");
  const [input, setInput] = useState("こんにちは");
  const [copied, setCopied] = useState("");

  const converted = useMemo(() => {
    try {
      const bytes = encodeText(input, sourceEncoding);
      return {
        error: "",
        garbledText: decodeBytes(bytes, targetEncoding),
        bytes,
      };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : "変換に失敗しました",
        garbledText: "",
        bytes: [],
      };
    }
  }, [input, sourceEncoding, targetEncoding]);

  const outputs = [
    {
      id: "garbledText",
      label: `${ENCODINGS.find((item) => item.value === targetEncoding)?.label} として読んだ文字列`,
      value: converted.garbledText,
    },
    {
      id: "hex",
      label: `${ENCODINGS.find((item) => item.value === sourceEncoding)?.label} のバイト列 (hex)`,
      value: bytesToHex(converted.bytes),
    },
    {
      id: "percent",
      label: `${ENCODINGS.find((item) => item.value === sourceEncoding)?.label} のバイト列 (%XX)`,
      value: bytesToPercent(converted.bytes),
    },
    {
      id: "base64",
      label: `${ENCODINGS.find((item) => item.value === sourceEncoding)?.label} のバイト列 (Base64)`,
      value: converted.bytes.length
        ? Encoding.base64Encode(converted.bytes)
        : "",
    },
  ];

  const copy = async (id: string, value: string) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(id);
  };

  return (
    <div className="space-y-6">
      <div className="max-w-3xl space-y-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <div className="mb-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              1. バイト列にする文字コード
            </div>
            <div className="flex flex-wrap gap-2">
              {ENCODINGS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={sourceEncoding === item.value}
                  onClick={() => {
                    setSourceEncoding(item.value);
                    setCopied("");
                  }}
                  className={[
                    "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                    sourceEncoding === item.value
                      ? "border-blue-500 bg-blue-500 text-white"
                      : "border-zinc-300 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800",
                  ].join(" ")}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              2. バイト列を読み直す文字コード
            </div>
            <div className="flex flex-wrap gap-2">
              {ENCODINGS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={targetEncoding === item.value}
                  onClick={() => {
                    setTargetEncoding(item.value);
                    setCopied("");
                  }}
                  className={[
                    "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                    targetEncoding === item.value
                      ? "border-blue-500 bg-blue-500 text-white"
                      : "border-zinc-300 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800",
                  ].join(" ")}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            入力文字列
          </span>
          <textarea
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              setCopied("");
            }}
            rows={5}
            spellCheck={false}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 font-mono text-sm text-zinc-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </label>

        {converted.error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {converted.error}
          </div>
        )}

        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          {input.length} 文字 → {converted.bytes.length} bytes
        </div>
      </div>

      <div className="grid max-w-3xl gap-3">
        {outputs.map((output) => (
          <div
            key={output.id}
            className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {output.label}
              </h2>
              <button
                type="button"
                onClick={() => copy(output.id, output.value)}
                disabled={!output.value}
                className="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-600 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                {copied === output.id ? "コピー済み" : "コピー"}
              </button>
            </div>
            <pre className="min-h-12 whitespace-pre-wrap break-all rounded-md bg-zinc-100 p-3 font-mono text-sm text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
              {output.value || "-"}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
