import Link from "next/link";
import { tools } from "./tools";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            multitools
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            日常タスクを効率化する汎用ツール集
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {tools.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
            <p className="text-zinc-500 dark:text-zinc-400">
              まだツールがありません。最初のツールを追加しましょう。
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <Link
                key={tool.id}
                href={tool.path}
                className="group rounded-lg border border-zinc-200 p-5 transition-colors hover:border-zinc-400 hover:bg-white dark:border-zinc-800 dark:hover:border-zinc-600 dark:hover:bg-zinc-900"
              >
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {tool.name}
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {tool.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {tool.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
