"use client";

import { useEffect, useState } from "react";
import type { SavedSearch } from "./SavedCard";
import SavedList, { type ListStatus } from "./SavedList";

async function fetchSearches(): Promise<SavedSearch[]> {
  const res = await fetch("/api/searches", { cache: "no-store" });
  if (!res.ok) throw new Error(`GET /api/searches ${res.status}`);
  const data: { searches: SavedSearch[] } = await res.json();
  return data.searches;
}

// Owns the page state, like Week 4's App.jsx. For #3: the saved list and the status line.
export default function Navigator() {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [listStatus, setListStatus] = useState<ListStatus>("loading");
  // Bumping this refetches the list (Try again now; after save, edit, delete later). [R5]
  const [reloadKey, setReloadKey] = useState(0);
  // Status line text. Save, edit and delete fill it in #8, #5 and #4. [A1]
  const [message] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchSearches()
      .then((rows) => {
        if (cancelled) return;
        setSearches(rows);
        setListStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setListStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  function retry() {
    setListStatus("loading");
    setReloadKey((k) => k + 1);
  }

  return (
    <>
      {/* Screen readers announce changes here without moving focus. */}
      <p role="status" className="mt-4 min-h-6 text-[15px] font-semibold text-[#14304F]">
        {message}
      </p>
      <SavedList searches={searches} status={listStatus} onRetry={retry} />
    </>
  );
}
