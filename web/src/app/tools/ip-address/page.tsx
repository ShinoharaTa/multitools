"use client";

import { useCallback, useEffect, useState } from "react";

type IpResponse = {
  ip: string;
};

const IP_API_URL = "https://api.ipify.org?format=json";

export default function IpAddress() {
  const [ip, setIp] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const fetchIp = useCallback(async () => {
    setLoading(true);
    setError("");
    setCopied(false);

    try {
      const res = await fetch(IP_API_URL, { cache: "no-store" });
      if (!res.ok) {
        throw new Error("IPアドレスの取得に失敗しました");
      }

      const data = (await res.json()) as IpResponse;
      setIp(data.ip);
    } catch {
      setIp("");
      setError("IPアドレスを取得できませんでした。通信環境を確認してください。");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchIp();
  }, [fetchIp]);

  const copyIp = async () => {
    if (!ip) return;

    try {
      await navigator.clipboard.writeText(ip);
      setCopied(true);
    } catch {
      setError("クリップボードへのコピーに失敗しました。");
    }
  };

  return (
    <div className="space-y-6">
      <div className="max-w-xl rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          グローバルIP
        </div>

        <div className="mt-3 rounded-lg bg-zinc-100 px-4 py-5 text-center font-mono text-3xl font-semibold text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
          {loading ? "取得中..." : ip || "-"}
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copyIp}
            disabled={!ip || loading}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {copied ? "コピー済み" : "コピー"}
          </button>
          <button
            type="button"
            onClick={fetchIp}
            disabled={loading}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            再取得
          </button>
        </div>
      </div>

      <div className="max-w-xl rounded-lg bg-zinc-100 p-4 text-sm text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
        VPN、プロキシ、モバイル回線、Cloudflare WARP などを使っている場合は、その出口IPが表示されます。
      </div>
    </div>
  );
}
