import { useEffect, useRef, useState } from "react";
import { COUNTIES } from "@/lib/counties";

// One row from GET /api/searches, as the browser receives it (JSON, so dates are strings).
export type SavedSearch = {
  id: number;
  licenseType: string;
  county: string;
  label: string;
  note: string | null;
  createdAt: string;
};

// "FORT BEND" → "Fort Bend". Falls back to the stored value if it is not one of the 13.
function countyLabel(value: string) {
  return COUNTIES.find((c) => c.value === value)?.label ?? value;
}

type Mode = "view" | "confirmingDelete";

const outlineButton =
  "rounded border border-[#14304F] bg-white px-4 py-2 text-[15px] font-bold text-[#14304F] hover:bg-[#EEF2F6]";

// One saved search. Delete asks on the card first [D1]; Edit arrives in #5, the live count in #9. [R3]
export default function SavedCard({ search, onDelete }: { search: SavedSearch; onDelete: (id: number) => void }) {
  const [mode, setMode] = useState<Mode>("view");
  const deleteRef = useRef<HTMLButtonElement>(null);
  const keepRef = useRef<HTMLButtonElement>(null);
  // Set by Keep, so focus returns to Delete only then, not on first render. [A2]
  const backToDelete = useRef(false);

  useEffect(() => {
    if (mode === "confirmingDelete") {
      // The Delete button just left the page; put focus on the safe choice.
      keepRef.current?.focus();
    } else if (backToDelete.current) {
      backToDelete.current = false;
      deleteRef.current?.focus();
    }
  }, [mode]);

  function keep() {
    backToDelete.current = true;
    setMode("view");
  }

  return (
    <li className="rounded border border-[#C7D0DB] bg-white px-4 py-3">
      {/* Focus target after a save (A2), so it takes tabIndex -1. */}
      <h3 id={`saved-${search.id}-heading`} tabIndex={-1} className="text-[18px] font-bold text-[#14304F]">
        {search.label}
      </h3>
      <p className="text-[15px] text-[#2B3A49]">
        {search.licenseType} · {countyLabel(search.county)} County
      </p>
      {search.note && <p className="mt-1 text-[15px] text-[#2B3A49]">{search.note}</p>}

      {mode === "view" && (
        <div className="mt-3">
          <button ref={deleteRef} type="button" onClick={() => setMode("confirmingDelete")} className={outlineButton}>
            Delete
          </button>
        </div>
      )}

      {mode === "confirmingDelete" && (
        <div role="group" aria-labelledby={`saved-${search.id}-confirm`} className="mt-3">
          <p id={`saved-${search.id}-confirm`} className="text-[15px] font-semibold text-[#1B2733]">
            Delete this saved search?
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => onDelete(search.id)}
              className="rounded bg-[#A3243B] px-4 py-2 text-[15px] font-bold text-white hover:bg-[#82192D]"
            >
              Delete
            </button>
            <button ref={keepRef} type="button" onClick={keep} className={outlineButton}>
              Keep
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
