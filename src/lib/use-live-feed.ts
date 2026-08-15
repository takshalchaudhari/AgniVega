import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, type QueryKey } from "@tanstack/react-query";

/**
 * Resilient polling for live-ops data.
 *
 * The primary feed polls on a fast interval. If a poll fails or simply stops
 * producing fresh data (stalled socket / sleeping tab / flaky mobile network),
 * a watchdog kicks in with backoff retries so truck positions keep updating,
 * and the UI can always show how old the data on screen is.
 */
export function useLiveFeed<T>(opts: {
  queryKey: QueryKey;
  queryFn: () => Promise<T>;
  intervalMs?: number;
  /** Data older than this is considered stale and triggers a forced refetch. */
  stallMs?: number;
}) {
  const interval = opts.intervalMs ?? 12000;
  const stallMs = opts.stallMs ?? interval * 2;

  const query = useQuery({
    queryKey: opts.queryKey,
    queryFn: opts.queryFn,
    refetchInterval: interval,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 15000),
    staleTime: 0,
  });

  const { refetch, dataUpdatedAt, isFetching, isError } = query;

  const [now, setNow] = useState(() => Date.now());
  const [online, setOnline] = useState(true);
  const [fallbackActive, setFallbackActive] = useState(false);
  const fetchingRef = useRef(isFetching);
  fetchingRef.current = isFetching;

  // 1s ticker so the "last updated" label counts up smoothly.
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Network + visibility recovery: refetch the moment we come back.
  useEffect(() => {
    setOnline(navigator.onLine);
    const back = () => {
      setOnline(true);
      void refetch();
    };
    const off = () => setOnline(false);
    const vis = () => {
      if (document.visibilityState === "visible") void refetch();
    };
    window.addEventListener("online", back);
    window.addEventListener("offline", off);
    document.addEventListener("visibilitychange", vis);
    return () => {
      window.removeEventListener("online", back);
      window.removeEventListener("offline", off);
      document.removeEventListener("visibilitychange", vis);
    };
  }, [refetch]);

  // Watchdog: if no fresh data landed within stallMs, force a refetch.
  useEffect(() => {
    const id = window.setInterval(() => {
      const age = Date.now() - (dataUpdatedAt || 0);
      if (age > stallMs && !fetchingRef.current && document.visibilityState === "visible") {
        setFallbackActive(true);
        void refetch();
      } else if (age <= stallMs) {
        setFallbackActive(false);
      }
    }, Math.max(2000, Math.floor(interval / 3)));
    return () => window.clearInterval(id);
  }, [dataUpdatedAt, interval, refetch, stallMs]);

  const ageSeconds = dataUpdatedAt ? Math.max(0, Math.round((now - dataUpdatedAt) / 1000)) : null;
  const refresh = useCallback(() => void refetch(), [refetch]);

  return {
    ...query,
    ageSeconds,
    online,
    /** true when the watchdog (not the normal interval) is driving updates */
    fallbackActive: fallbackActive || isError || !online,
    refresh,
  };
}

export function formatAge(seconds: number | null) {
  if (seconds === null) return "never";
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}
