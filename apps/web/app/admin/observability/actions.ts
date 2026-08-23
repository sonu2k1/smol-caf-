"use server";

import { getObservabilitySummary, type SystemAlert } from "@/lib/observability/alerts";
import { getRecentLogs, type LogEntry } from "@/lib/observability/logger";
import { sentryServerOptions } from "@/sentry.server.config";

export interface ObservabilityDashboardData {
  success: boolean;
  sentryConfigured: boolean;
  orderMetrics: {
    recent5MinTotal: number;
    recent5MinFailures: number;
    failureRatePercent: number;
    isHealthy: boolean;
  };
  kdsHealth: {
    lastHeartbeatAt: string;
    silenceSeconds: number;
    isHealthy: boolean;
  };
  webhookHealth: {
    consecutiveFailures: number;
    isHealthy: boolean;
  };
  alerts: SystemAlert[];
  recentLogs: LogEntry[];
}

export async function fetchObservabilityDataAction(): Promise<ObservabilityDashboardData> {
  try {
    const summary = getObservabilitySummary();
    const recentLogs = getRecentLogs();
    const sentryConfigured = Boolean(sentryServerOptions.enabled);

    return {
      success: true,
      sentryConfigured,
      ...summary,
      recentLogs,
    };
  } catch (err) {
    console.error("Error fetching observability data:", err);
    return {
      success: false,
      sentryConfigured: false,
      orderMetrics: {
        recent5MinTotal: 0,
        recent5MinFailures: 0,
        failureRatePercent: 0,
        isHealthy: true,
      },
      kdsHealth: { lastHeartbeatAt: new Date().toISOString(), silenceSeconds: 0, isHealthy: true },
      webhookHealth: { consecutiveFailures: 0, isHealthy: true },
      alerts: [],
      recentLogs: [],
    };
  }
}
