import { resolveQrToken, clearTableSession, activateTableAndRedirectAction } from "../actions";



interface PageProps {
  params: Promise<{ tableToken: string }>;
}

export default async function TableEntryPage({ params }: PageProps) {
  const { tableToken } = await params;
  const result = await resolveQrToken(tableToken, false);

  // 1. Invalid or Revoked QR Error Screen

  if (!result.success || !result.session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FDFBF7] px-6 py-12 text-[#1C1917] dark:bg-[#141211] dark:text-[#FDFBF7]">
        <div className="w-full max-w-md rounded-3xl border border-stone-200/80 bg-white/80 p-8 text-center shadow-lg shadow-stone-200/40 backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/80 dark:shadow-none">
          {/* Warning Badge / Icon */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100/80 text-3xl dark:bg-amber-950/60">
            ⚠️
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            This QR isn&apos;t working, please call staff
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
            {result.message ||
              "We couldn&apos;t connect this QR code to an active table session. Please wave to a team member or ask at the counter."}
          </p>

          <div className="mt-8 space-y-3">
            <div className="rounded-xl border border-stone-200 bg-stone-50/80 p-3.5 text-xs text-stone-500 dark:border-stone-800 dark:bg-stone-800/60 dark:text-stone-400">
              Token:{" "}
              <span className="font-mono text-stone-700 dark:text-stone-300">{tableToken}</span>
            </div>

            <form action={clearTableSession}>
              <button
                type="submit"
                className="w-full rounded-xl bg-stone-900 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800 active:scale-[0.99] dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
              >
                Back to Home
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const { tableLabel, locationName } = result.session;

  // 2. Successful Table Session Connected Screen
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FDFBF7] px-6 py-12 text-[#1C1917] dark:bg-[#141211] dark:text-[#FDFBF7]">
      <div className="w-full max-w-md rounded-3xl border border-stone-200/80 bg-white/90 p-8 text-center shadow-xl shadow-stone-200/50 backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/90 dark:shadow-none">
        {/* Café Logo / Brand Header */}
        <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-100/70 px-3.5 py-1.5 text-xs font-medium text-stone-600 dark:border-stone-800 dark:bg-stone-800/80 dark:text-stone-300">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          {locationName}
        </div>

        <div className="mt-8 space-y-2">
          <p className="text-xs uppercase tracking-widest text-stone-500 font-semibold">
            Welcome to smol café
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
            You&apos;re at Table {tableLabel}
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Your dining session is active. Browse our artisanal brews, food & treats.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-10 space-y-4">
          <form action={activateTableAndRedirectAction}>
            <input type="hidden" name="tableToken" value={tableToken} />
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#9B2C2C] py-4 text-base font-semibold text-white shadow-md shadow-red-900/20 transition hover:bg-[#822424] active:scale-[0.98] dark:bg-[#C53030] dark:hover:bg-[#9B2C2C]"
            >
              Browse Menu & Order
              <span aria-hidden="true">→</span>
            </button>
          </form>


          <form action={clearTableSession}>
            <button
              type="submit"
              className="text-xs font-medium text-stone-500 underline underline-offset-4 transition hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
            >
              Not your table? Tap to clear session
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
