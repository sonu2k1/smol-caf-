import { Button } from "@smol-cafe/ui";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <div className="max-w-xl space-y-6 rounded-2xl border border-stone-200 bg-white/70 p-8 shadow-sm backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/70">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900 dark:bg-amber-950/60 dark:text-amber-300">
          ✨ Phase 0: Scaffolding Ready
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          smol café
        </h1>

        <p className="text-sm text-stone-600 dark:text-stone-400">
          Next.js 15 (App Router) + TypeScript + Tailwind CSS monorepo initialized.
        </p>

        <div className="grid grid-cols-3 gap-2 text-xs font-mono text-stone-500 dark:text-stone-400 pt-2">
          <div className="rounded-lg bg-stone-100 dark:bg-stone-800 p-2.5">
            <span className="font-semibold text-stone-800 dark:text-stone-200">apps/web</span>
            <div className="text-[10px] text-stone-500">Next.js 15 App</div>
          </div>
          <div className="rounded-lg bg-stone-100 dark:bg-stone-800 p-2.5">
            <span className="font-semibold text-stone-800 dark:text-stone-200">packages/db</span>
            <div className="text-[10px] text-stone-500">Schema & Layer</div>
          </div>
          <div className="rounded-lg bg-stone-100 dark:bg-stone-800 p-2.5">
            <span className="font-semibold text-stone-800 dark:text-stone-200">packages/ui</span>
            <div className="text-[10px] text-stone-500">Shared Components</div>
          </div>
        </div>

        <div className="pt-2">
          <Button className="rounded-xl bg-stone-900 px-5 py-2.5 text-sm text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200">
            Scaffolding Complete
          </Button>
        </div>
      </div>
    </main>
  );
}
