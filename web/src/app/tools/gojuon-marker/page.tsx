"use client";

import { useState } from "react";

type MarkType = "circle" | "cross" | "fill";

const MARK_OPTIONS: { type: MarkType; label: string }[] = [
  { type: "circle", label: "○" },
  { type: "cross", label: "✗" },
  { type: "fill", label: "塗りつぶし" },
] as const;

const GOJUON_TABLE = [
  ["ん", "わ", "ら", "や", "ま", "は", "な", "た", "さ", "か", "あ"],
  [null, null, "り", null, "み", "ひ", "に", "ち", "し", "き", "い"],
  [null, null, "る", "ゆ", "む", "ふ", "ぬ", "つ", "す", "く", "う"],
  [null, null, "れ", null, "め", "へ", "ね", "て", "せ", "け", "え"],
  [null, "を", "ろ", "よ", "も", "ほ", "の", "と", "そ", "こ", "お"],
] as const;

const MOBILE_GOJUON_TABLE = GOJUON_TABLE[0].map((_, columnIndex) =>
  GOJUON_TABLE.map((row) => row[columnIndex]).reverse()
);

export default function GojuonMarker() {
  const [markType, setMarkType] = useState<MarkType>("circle");
  const [marks, setMarks] = useState<Record<string, MarkType>>({});

  const toggleKana = (kana: string) => {
    setMarks((current) => {
      const next = { ...current };
      if (next[kana] === markType) {
        delete next[kana];
      } else {
        next[kana] = markType;
      }
      return next;
    });
  };

  const changeMarkType = (nextType: MarkType) => {
    setMarkType(nextType);
    setMarks((current) =>
      Object.fromEntries(
        Object.keys(current).map((kana) => [kana, nextType])
      )
    );
  };

  const renderControls = (rotateLabel = false) => {
    const hasMarks = Object.keys(marks).length > 0;

    return (
      <div
        className={rotateLabel ? "flex flex-col gap-1.5" : "flex flex-wrap gap-2"}
      >
        {MARK_OPTIONS.map((option) => (
          <button
            key={option.type}
            type="button"
            aria-pressed={markType === option.type}
            onClick={() => changeMarkType(option.type)}
            className={[
              "relative whitespace-nowrap rounded-md border text-sm font-medium transition-colors",
              rotateLabel ? "h-16 w-10 p-0 text-[11px]" : "min-w-24 px-3 py-2",
              markType === option.type
                ? "border-blue-500 bg-blue-500 text-white"
                : "border-zinc-300 bg-white text-zinc-700 hover:border-blue-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-blue-700",
            ].join(" ")}
          >
            <span
              className={
                rotateLabel
                  ? "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90 whitespace-nowrap leading-none"
                  : undefined
              }
            >
              {option.label}
            </span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => setMarks({})}
          disabled={!hasMarks}
          className={[
            "relative whitespace-nowrap rounded-md border border-zinc-300 bg-white text-sm text-zinc-600 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800",
            rotateLabel ? "h-16 w-10 p-0 text-[11px]" : "min-w-24 px-3 py-2",
          ].join(" ")}
        >
          <span
            className={
              rotateLabel
                ? "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90 whitespace-nowrap leading-none"
                : undefined
            }
          >
            クリア
          </span>
        </button>
      </div>
    );
  };

  const renderKanaCell = (
    kana: string | null,
    rowIndex: number,
    columnIndex: number,
    prefix: string,
    rotateKana = false
  ) => {
    if (!kana) {
      return (
        <div
          key={`${prefix}-empty-${rowIndex}-${columnIndex}`}
          className="aspect-square rounded-md border border-dashed border-zinc-100 dark:border-zinc-800"
          aria-hidden="true"
        />
      );
    }

    const mark = marks[kana];

    return (
      <button
        key={`${prefix}-${kana}`}
        type="button"
        aria-pressed={Boolean(mark)}
        onClick={() => toggleKana(kana)}
        className={[
          "relative aspect-square rounded-md border text-xl font-semibold transition-all",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900",
          mark === "fill"
            ? "border-blue-500 bg-blue-500 text-white shadow-sm"
            : "border-zinc-200 bg-zinc-50 text-zinc-900 hover:border-blue-300 hover:bg-blue-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:border-blue-700 dark:hover:bg-blue-950/40",
        ].join(" ")}
      >
        <span className={rotateKana ? "inline-block rotate-90" : undefined}>
          {kana}
        </span>
        {mark === "circle" && (
          <span className="pointer-events-none absolute left-1/2 top-1/2 h-3/4 w-3/4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-blue-500 dark:border-blue-400" />
        )}
        {mark === "cross" && (
          <span className="pointer-events-none absolute left-1/2 top-1/2 h-3/4 w-3/4 -translate-x-1/2 -translate-y-1/2">
            <span className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 rotate-45 rounded-full bg-red-500 dark:bg-red-400" />
            <span className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 -rotate-45 rounded-full bg-red-500 dark:bg-red-400" />
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-2 sm:hidden">
        <div className="flex-1 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="grid grid-cols-5 gap-1.5">
            {MOBILE_GOJUON_TABLE.flatMap((row, rowIndex) =>
              row.map((kana, columnIndex) =>
                renderKanaCell(kana, rowIndex, columnIndex, "mobile", true)
              )
            )}
          </div>
        </div>
        {renderControls(true)}
      </div>

      <div className="hidden sm:block">
        <div className="mb-2">{renderControls()}</div>
        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="grid min-w-[572px] grid-cols-11 gap-1.5">
            {GOJUON_TABLE.flatMap((row, rowIndex) =>
              row.map((kana, columnIndex) =>
                renderKanaCell(kana, rowIndex, columnIndex, "desktop")
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
