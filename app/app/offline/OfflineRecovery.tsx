"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function OfflineRecovery() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const updateStatus = () => setIsOnline(navigator.onLine);
    updateStatus();
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  return (
    <div className="mt-5 grid gap-3">
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="min-h-12 rounded-[var(--app-radius-button)] bg-brand px-5 text-sm font-bold text-white"
      >
        {isOnline ? "Connection restored - try again" : "Try again"}
      </button>
      <Link
        className="inline-flex min-h-11 items-center justify-center rounded-[var(--app-radius-button)] border border-blue-200 bg-white px-4 text-sm font-bold text-brand"
        href="/"
      >
        Open saved app data
      </Link>
      <p className={`text-center text-xs font-semibold ${isOnline ? "text-emerald-700" : "text-[var(--app-text-muted)]"}`} role="status">
        {isOnline ? "You are back online." : "Still offline. Reconnect, then try again."}
      </p>
    </div>
  );
}
