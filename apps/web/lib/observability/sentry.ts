/**
 * Sentry Error Tracking Helper
 * Provides seamless fallback logging if Sentry is not configured or in development mode.
 */

export interface ErrorContext {
  requestId?: string;
  tableSessionId?: string;
  orderId?: string;
  route?: string;
  extra?: Record<string, unknown>;
}

export function captureAppException(error: unknown, context?: ErrorContext): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  // Structured console report
  console.error(`[Sentry Error Event] [Req: ${context?.requestId || "none"}]`, {
    message: errorMessage,
    stack: errorStack,
    context,
    timestamp: new Date().toISOString(),
  });

  // If Sentry is installed and configured globally
  if (
    typeof window !== "undefined" &&
    (window as unknown as { Sentry?: { captureException: (e: unknown, ctx?: unknown) => void } })
      .Sentry
  ) {
    (
      window as unknown as { Sentry: { captureException: (e: unknown, ctx?: unknown) => void } }
    ).Sentry.captureException(error, {
      extra: context,
    });
  }
}

export function captureAppMessage(
  message: string,
  level: "info" | "warning" | "error" = "info",
  context?: ErrorContext
): void {
  console.log(
    `[Sentry ${level.toUpperCase()}] [Req: ${context?.requestId || "none"}] ${message}`,
    context
  );
}
