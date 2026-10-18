import { useEffect, useRef, useState } from "react";
import { countyLabel } from "@/lib/counties";
import SaveSearchForm from "./SaveSearchForm";

export type ResultStatus = "idle" | "loading" | "success" | "empty" | "error";

type Props = {
  status: ResultStatus;
  type: string;
  county: string; // ALL CAPS value, e.g. "FORT BEND"
  count: number;
  queryUrl: string;
  errorCode: number | null; // TDLR's code, or null for a timeout or no connection
  onRetry: () => void;
  // Resolves to an error message for the save form, or null when the save worked. [C4]
  onSave: (label: string, note: string) => Promise<string | null>;
};

// Navigator focuses #result-heading after each search, so the finished states give it tabIndex -1. [A2]
const headingClass = "text-[18px] font-bold text-[#1B2733]";
const section = "mt-3 rounded-md p-5";

// One result region with five states, ported from Week 4. Wording from UI.md Part 1. [S4]
export default function ResultCard({ status, type, county, count, queryUrl, errorCode, onRetry, onSave }: Props) {
  const place = `${countyLabel(county)} County`;
  const label = `${type} in ${place}`;

  if (status === "loading") {
    return (
      <section aria-labelledby="result-heading" className={`${section} border border-[#C7D0DB] bg-white`}>
        <h2 id="result-heading" className={headingClass}>Checking Texas license records</h2>
        <p className="text-[15px] text-[#4A5A6A]">This usually takes a few seconds.</p>
      </section>
    );
  }

  if (status === "error") {
    return (
      <section aria-labelledby="result-heading" className={`${section} border-2 border-[#A3243B] bg-[#FDF2F4]`}>
        <h2 id="result-heading" tabIndex={-1} className={`${headingClass} text-[#7A1B2C]`}>
          We could not reach the Texas data service.
        </h2>
        <p className="mt-1 font-mono text-[14px] text-[#4A5A6A]">
          ({errorCode === null ? "no connection" : `error ${errorCode}`})
        </p>
        <p className="mt-1 text-[15px] text-[#4A5A6A]">
          This is a problem on our side, not something you did. Your choices are saved.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded bg-[#A3243B] px-4 py-2 text-[15px] font-bold text-white hover:bg-[#82192D]"
        >
          Try again
        </button>
      </section>
    );
  }

  if (status === "empty") {
    // Zero holders is a real answer (HTTP 200), so it reads as information, not a failure. [S4]
    return (
      <section aria-labelledby="result-heading" className={`${section} border border-[#E3C46B] bg-[#FFFBEB]`}>
        <h2 id="result-heading" tabIndex={-1} className={headingClass}>No matching records found</h2>
        <p className="mt-1 text-[15px] text-[#4A5A6A]">
          TDLR lists no {type} licenses with {place} as the business county.
        </p>
        <p className="text-[15px] text-[#4A5A6A]">Try a nearby county or the other license type.</p>
        <SaveToWatchlist initialLabel={label} onSave={onSave} />
        <RequestDetails queryUrl={queryUrl} />
      </section>
    );
  }

  if (status === "success") {
    return (
      <section aria-labelledby="result-heading" className={`${section} border border-l-[6px] border-[#1F5C99] bg-white shadow-sm`}>
        <p className="text-[12px] font-bold uppercase tracking-wider text-[#1F5C99]">Result</p>
        <h2 id="result-heading" tabIndex={-1} className={`mt-1 ${headingClass}`}>{type} in {place}</h2>
        <p className="tabular mt-1 text-[44px] font-extrabold leading-none text-[#14304F]">{count.toLocaleString()}</p>
        <p className="mt-2 text-[15px] text-[#4A5A6A]">
          people hold this license with {place} listed as their business county.
        </p>
        <p className="mt-3 rounded bg-[#F3F5F8] p-3 text-[15px]">A count is not a job listing.</p>
        <SaveToWatchlist initialLabel={label} onSave={onSave} />
        <RequestDetails queryUrl={queryUrl} />
      </section>
    );
  }

  return (
    <section aria-labelledby="result-heading" className={`${section} border-2 border-dashed border-[#C7D0DB] bg-[#F9FAFB]`}>
      <h2 id="result-heading" className={headingClass}>Your result will appear here</h2>
      <p className="mt-0.5 text-[15px] text-[#4A5A6A]">Pick a license type and a county, then select Show license count.</p>
    </section>
  );
}

// "Save to watchlist" and its form, only inside the success and empty panels. [C1]
// A new search passes through loading, which unmounts this, so the form always starts closed.
function SaveToWatchlist({ initialLabel, onSave }: { initialLabel: string; onSave: Props["onSave"] }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  // Set only by Cancel: focus goes back to the button that opened the form. [A2]
  const backToButton = useRef(false);

  useEffect(() => {
    if (!open && backToButton.current) {
      buttonRef.current?.focus();
      backToButton.current = false;
    }
  }, [open]);

  // After a save, Navigator focuses the new card (A2), so the form only closes here.
  async function save(label: string, note: string) {
    const error = await onSave(label, note);
    if (error === null) setOpen(false);
    return error;
  }

  if (open) {
    return (
      <SaveSearchForm
        idPrefix="save"
        initialLabel={initialLabel}
        initialNote=""
        onSubmit={save}
        onCancel={() => {
          backToButton.current = true;
          setOpen(false);
        }}
      />
    );
  }
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={() => setOpen(true)}
      className="mt-3 rounded bg-[#14304F] px-4 py-2 text-[15px] font-bold text-white hover:bg-[#0E2238]"
    >
      Save to watchlist
    </button>
  );
}

// "See the exact data request": the same URL the server asked, so the number can be checked. [S5]
function RequestDetails({ queryUrl }: { queryUrl: string }) {
  return (
    <details className="mt-3 text-[14px] text-[#4A5A6A]">
      <summary className="cursor-pointer font-semibold text-[#1A5FB4] underline">See the exact data request</summary>
      <a href={queryUrl} target="_blank" rel="noreferrer" className="mt-2 block break-all text-[13px] text-[#1A5FB4] underline">
        {queryUrl}
      </a>
    </details>
  );
}
