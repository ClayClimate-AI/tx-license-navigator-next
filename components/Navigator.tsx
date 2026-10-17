"use client";

import { useEffect, useState } from "react";
import type { SavedSearch } from "./SavedCard";
import SavedList, { type ListStatus } from "./SavedList";

const DB_ERROR = "We could not reach the saved searches database.";

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
  // Status line text. Edit and delete fill it here; save in #8. [A1]
  const [message, setMessage] = useState("");

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

  // Card confirmed Delete: DELETE → refetch → status line → focus the section heading. [D2, A1, A2]
  async function handleDelete(id: number) {
    // Clear first, so a second "Deleted." in a row is still announced.
    setMessage("");
    let res: Response;
    try {
      res = await fetch(`/api/searches/${id}`, { method: "DELETE" });
    } catch {
      setMessage(DB_ERROR);
      return;
    }
    // 404 means the row is already gone, so the list still needs a refetch.
    if (!res.ok && res.status !== 404) {
      setMessage(DB_ERROR);
      return;
    }
    setMessage(res.ok ? "Deleted." : "That saved search no longer exists.");
    try {
      setSearches(await fetchSearches());
    } catch {
      setListStatus("error");
    }
    document.getElementById("saved-heading")?.focus();
  }

  // Card's form pressed Save: PATCH → refetch → status line. Returns the form's error, or null. [U1, E3, A1]
  // The card moves focus back to its Edit button once this returns null. [A2]
  async function handleEdit(id: number, label: string, note: string): Promise<string | null> {
    setMessage("");
    let res: Response;
    try {
      res = await fetch(`/api/searches/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, note }),
      });
    } catch {
      return DB_ERROR;
    }
    if (!res.ok) {
      // 400 or 404: show the server's message in the form, typed values stay.
      const data: { error?: string } | null = await res.json().catch(() => null);
      return data?.error ?? DB_ERROR;
    }
    setMessage("Changes saved.");
    try {
      setSearches(await fetchSearches());
    } catch {
      setListStatus("error");
    }
    return null;
  }

  return (
    <>
      {/* Screen readers announce changes here without moving focus. */}
      <p role="status" className="mt-4 min-h-6 text-[15px] font-semibold text-[#14304F]">
        {message}
      </p>
      <SavedList searches={searches} status={listStatus} onRetry={retry} onDelete={handleDelete} onEdit={handleEdit} />
    </>
  );
}
