"use client";

import { useState, useEffect, useCallback } from "react";

export interface NetworkHealthState {
  isOnline: boolean;
  isBackendReachable: boolean;
  isDegraded: boolean;
  lastCheckedAt: Date | null;
  checkHealth: () => Promise<void>;
}

/**
 * Hook to detect client offline status and backend outage for graceful degradation
 */
export function useNetworkHealth(): NetworkHealthState {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [isBackendReachable, setIsBackendReachable] = useState(true);
  const [lastCheckedAt, setLastCheckedAt] = useState<Date | null>(null);

  const checkHealth = useCallback(async () => {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setIsOnline(false);
      setIsBackendReachable(false);
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch("/api/health", {
        method: "GET",
        signal: controller.signal,
        cache: "no-store",
      });
      clearTimeout(timeoutId);

      setIsOnline(true);
      setIsBackendReachable(res.ok);
      setLastCheckedAt(new Date());
    } catch {
      setIsBackendReachable(false);
      setLastCheckedAt(new Date());
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      checkHealth();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsBackendReachable(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check and periodic 15s health probe
    checkHealth();
    const interval = setInterval(checkHealth, 15000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, [checkHealth]);

  return {
    isOnline,
    isBackendReachable,
    isDegraded: !isOnline || !isBackendReachable,
    lastCheckedAt,
    checkHealth,
  };
}
