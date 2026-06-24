"use client";

import { useState } from "react";

type MarkType = "circle" | "cross" | "fill";

const MARK_OPTIONS: { type: MarkType; label: string }[] = [
  { type: "circle", label: "○" },
  { type: "cross", label: "✗" },
  { type: "fill", label: "塗りつぶし" },
] as const;

const ALPHABET_ROWS = [
  ["A", "B", "C", "D", "E"],
  ["F", "G", "H", "I", "J"],
  ["K", "L", "M", "N", "O"],
  ["P", "Q", "R", "S", "T"],
  ["U", "V", "W", "X", "Y"],
  ["Z", null, null, null, null],
] as const;

export default function AlphabetMarker() {
  const [markType, setMarkType] = useState<MarkType>("circle");
  const [marks, setMarks] = useState<Record<string, MarkType>>({});

  const toggleLetter = (letter: string) => {
    setMarks((current) => {
      const next = { ...current };
      if (next[letter] === markType) {
        delete next[letter];
      } else {
        next[letter] = markType;
      }
      return next;
    });
  };

  const changeMarkType = (nextType: MarkType) => {
    setMarkType(nextType);
    setMarks((current) =>
      Object.fromEntries(
        Object.keys(current).map((letter) => [letter, nextType])
      )
    );
  };

  const renderLetterCell = (
    letter: string | null,
    rowIndex: number,
    columnIndex: number
  ) => {
    if (!letter) {
      return (
        <div
          key={`empty-${rowIndex}-${columnIndex}`}
          className="aspect-square rounded-md border border-dashed border-zinc-100 dark:border-zinc-800"
          aria-hidden="true"
        />
      );
    }

    const mark = marks[letter];

    return (
      <button
        key={letter}
        type="button"
        aria-pressed={Boolean(mark)}
        onClick={() => toggleLetter(letter)}
        className={[
          "relative aspect-square rounded-md border text-2xl font-semibold transition-all",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900",
          mark === "fill"
            ? "border-blue-500 bg-blue-500 text-white shadow-sm"
            : "border-zinc-200 bg-zinc-50 text-zinc-900 hover:border-blue-300 hover:bg-blue-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:border-blue-700 dark:hover:bg-blue-950/40",
        ].join(" ")}
      >
        <span>{letter}</span>
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
      <div className="flex flex-wrap gap-2">
        {MARK_OPTIONS.map((option) => (
          <button
            key={option.type}
            type="button"
            aria-pressed={markType === option.type}
            onClick={() => changeMarkType(option.type)}
            className={[
              "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
              markType === option.type
                ? "border-blue-500 bg-blue-500 text-white"
                : "border-zinc-300 bg-white text-zinc-700 hover:border-blue-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-blue-700",
            ].join(" ")}
          >
            {option.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setMarks({})}
          disabled={Object.keys(marks).length === 0}
          className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          クリア
        </button>
      </div>

      <div className="max-w-md rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid grid-cols-5 gap-1.5">
          {ALPHABET_ROWS.flatMap((row, rowIndex) =>
            row.map((letter, columnIndex) =>
              renderLetterCell(letter, rowIndex, columnIndex)
            )
          )}
        </div>
      </div>
    </div>
  );
}
