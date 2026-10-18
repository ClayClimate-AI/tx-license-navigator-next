"use client";

import { useEffect, useRef, useState } from "react";
import { countyLabel } from "@/lib/counties";
import LicensePicker, { HVAC_TYPES } from "./LicensePicker";
import ResultCard, { type ResultStatus } from "./ResultCard";
import type { SavedSearch } from "./SavedCard";
import SavedList, { type ListStatus } from "./SavedList";

const DB_ERROR = "We could not reach the saved searches database.";

type Search = { type: string; county: string };
// Snapshot of the search that filled the card, so the heading stays right if a select changes after.
type Result = Search & { count: number; queryUrl: string };

async function fetchSearches(): Promise<SavedSearch[]> {
  const res = await fetch("/api/searches", { cache: "no-store" });
  if (!res.ok) throw new Error(`GET /api/searches ${res.status}`);
  const data: { searches: SavedSearch[] } = await res.json();
  return data.searches;
}

// Owns the page state, like Week 4's App.jsx: the search, the saved list, and the status line.
export default function Navigator() {
  const [type, setType] = useState(HVAC_TYPES[0]);
  const [county, setCounty] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [status, setStatus] = useState<ResultStatus>("idle");
  // TDLR's code (or ours for a 400); null means no answer at all.
  const [errorCode, setErrorCode] = useState<number | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  // The last search sent, so Try again repeats exactly that one. Save uses result, the pair on the card.
  const [lastSearch, setLastSearch] = useState<Search | null>(null);
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [listStatus, setListStatus] = useState<ListStatus>("loading");
  // Bumping this refetches the list (Try again now; after save, edit, delete later). [R5]
  const [reloadKey, setReloadKey] = useState(0);
  // Status line text: search, save, edit, and delete fill it. [A1]
  const [message, setMessage] = useState("Ready. Choose a license type and a county.");
  // Id of a just-saved search; its card is not on the page until the list redraws. [A2]
  const focusAfterSave = useRef<number | null>(null);

  // After a search finishes, focus the result heading so keyboard and screen reader users land on the answer. [A2]
  useEffect(() => {
    if (status === "success" || status === "empty" || status === "error") {
      document.getElementById("result-heading")?.focus();
    }
  }, [status]);

  // After a save, once the new card is drawn, focus its heading. [A2]
  useEffect(() => {
    if (focusAfterSave.current === null) return;
    document.getElementById(`saved-${focusAfterSave.current}-heading`)?.focus();
    focusAfterSave.current = null;
  }, [searches]);

  // Browser → GET /api/count → result card and status line. [S3–S7]
  async function runSearch(search: Search) {
    setLastSearch(search);
    setResult(null);
    setErrorCode(null);
    setStatus("loading");
    setMessage("Checking Texas license records.");
    const params = new URLSearchParams(search);
    // The demo switch on the page URL is passed on, so the route asks TDLR for a bad column. [S7]
    if (new URLSearchParams(window.location.search).get("break") === "column") params.set("break", "column");

    let code: number | null = null;
    try {
      const res = await fetch(`/api/count?${params}`, { cache: "no-store" });
      const data = await res.json();
      if (res.ok) {
        const place = `${search.type} in ${countyLabel(search.county)} County`;
        setResult({ ...search, count: data.count, queryUrl: data.queryUrl });
        setStatus(data.count === 0 ? "empty" : "success");
        setMessage(data.count === 0 ? `Done. No matching records for ${place}.` : `Done. Showing results for ${place}.`);
        return;
      }
      // 502/504 carry TDLR's code (or null); our own 400 has none, so use the HTTP code.
      code = "status" in data ? data.status : res.status;
    } catch {
      // No connection, or a reply that was not JSON: code stays null.
    }
    setErrorCode(code);
    setStatus("error");
    setMessage(`Something went wrong (${code === null ? "no connection" : `error ${code}`}). Your choices are saved.`);
  }

  function handleSubmit() {
    if (!county) {
      setFieldError("Choose a county.");
      return;
    }
    setFieldError("");
    runSearch({ type, county });
  }

  function handleCountyChange(value: string) {
    setCounty(value);
    if (value) setFieldError("");
  }

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

  // Result card's form pressed Save: POST → refetch → status line → focus the new card.
  // Returns the form's error, or null. [C2, C4, A1, A2]
  async function handleSave(label: string, note: string): Promise<string | null> {
    // The card offers Save only after a success or empty result, so result is set.
    if (!result) return DB_ERROR;
    setMessage("");
    let res: Response;
    try {
      res = await fetch("/api/searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // The searched pair from the result, not the current selects. [C2]
        body: JSON.stringify({ licenseType: result.type, county: result.county, label, note }),
      });
    } catch {
      return DB_ERROR;
    }
    if (!res.ok) {
      // 400 or 409: show the server's message in the form, typed values stay. [C4]
      const data: { error?: string } | null = await res.json().catch(() => null);
      return data?.error ?? DB_ERROR;
    }
    const data: { search: SavedSearch } = await res.json();
    setMessage("Saved.");
    focusAfterSave.current = data.search.id;
    try {
      setSearches(await fetchSearches());
    } catch {
      setListStatus("error");
    }
    return null;
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
      <LicensePicker
        type={type}
        county={county}
        onTypeChange={setType}
        onCountyChange={handleCountyChange}
        onSubmit={handleSubmit}
        busy={status === "loading"}
        fieldError={fieldError}
      />
      {/* Screen readers announce changes here without moving focus. */}
      <p role="status" className="mt-4 min-h-6 text-[15px] font-semibold text-[#14304F]">
        {message}
      </p>
      <ResultCard
        status={status}
        type={result?.type ?? ""}
        county={result?.county ?? ""}
        count={result?.count ?? 0}
        queryUrl={result?.queryUrl ?? ""}
        errorCode={errorCode}
        onRetry={() => lastSearch && runSearch(lastSearch)}
        onSave={handleSave}
      />
      <SavedList searches={searches} status={listStatus} onRetry={retry} onDelete={handleDelete} onEdit={handleEdit} />
    </>
  );
}
