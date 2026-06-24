"use client";

import { useMemo, useState } from "react";
import { blake3 } from "@noble/hashes/blake3.js";
import { md5, ripemd160, sha1 } from "@noble/hashes/legacy.js";
import { sha256, sha384, sha512 } from "@noble/hashes/sha2.js";
import { keccak_256, sha3_256, sha3_512 } from "@noble/hashes/sha3.js";

type HashItem = {
  id: string;
  label: string;
  note?: string;
  hash: (bytes: Uint8Array) => Uint8Array;
};

const HASHES: HashItem[] = [
  { id: "md5", label: "MD5", note: "非推奨", hash: md5 },
  { id: "sha1", label: "SHA-1", note: "非推奨", hash: sha1 },
  { id: "sha256", label: "SHA-256", hash: sha256 },
  { id: "sha384", label: "SHA-384", hash: sha384 },
  { id: "sha512", label: "SHA-512", hash: sha512 },
  { id: "sha3-256", label: "SHA3-256", hash: sha3_256 },
  { id: "sha3-512", label: "SHA3-512", hash: sha3_512 },
  { id: "keccak-256", label: "Keccak-256", hash: keccak_256 },
  { id: "ripemd160", label: "RIPEMD-160", hash: ripemd160 },
  { id: "blake3", label: "BLAKE3", hash: blake3 },
];

function bytesToHex(bytes: Uint8Array) {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export default function HashConverter() {
  const [input, setInput] = useState("hello");
  const [copied, setCopied] = useState("");

  const encoded = useMemo(() => new TextEncoder().encode(input), [input]);

  const results = useMemo(
    () =>
      HASHES.map((item) => ({
        ...item,
        value: bytesToHex(item.hash(encoded)),
      })),
    [encoded]
  );

  const copy = async (id: string, value: string) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          ハッシュ変換
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          入力した文字列を複数のハッシュ値に変換します。入力は UTF-8
          として処理します。
        </p>
      </div>

      <div className="max-w-3xl space-y-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
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

        <div className="flex flex-wrap gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <span>{input.length} 文字</span>
          <span>/</span>
          <span>{encoded.length} bytes (UTF-8)</span>
        </div>
      </div>

      <div className="grid max-w-3xl gap-3">
        {results.map((result) => (
          <div
            key={result.id}
            className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {result.label}
                </h2>
                {result.note && (
                  <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                    {result.note}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => copy(result.id, result.value)}
                disabled={!result.value}
                className="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-600 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                {copied === result.id ? "コピー済み" : "コピー"}
              </button>
            </div>
            <pre className="whitespace-pre-wrap break-all rounded-md bg-zinc-100 p-3 font-mono text-sm text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
              {result.value || "-"}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
