import { useEffect, useRef, useState } from "react";
import { countyLabel } from "@/lib/counties";
import SaveSearchForm from "./SaveSearchForm";

// One row from GET /api/searches, as the browser receives it (JSON, so dates are strings).
export type SavedSearch = {
  id: number;
  licenseType: string;
  county: string;
  label: string;
  note: string | null;
  createdAt: string;
};

type Mode = "view" | "editing" | "confirmingDelete";

type Props = {
  search: SavedSearch;
  onDelete: (id: number) => void;
  // Resolves to an error message for the form, or null when the edit saved.
  onEdit: (id: number, label: string, note: string) => Promise<string | null>;
};

const outlineButton =
  "rounded border border-[#14304F] bg-white px-4 py-2 text-[15px] font-bold text-[#14304F] hover:bg-[#EEF2F6]";

// One saved search. Edit opens the form on the card [U1]; Delete asks first [D1]. [R3]
export default function SavedCard({ search, onDelete, onEdit }: Props) {
  const [mode, setMode] = useState<Mode>("view");
  const editRef = useRef<HTMLButtonElement>(null);
  const deleteRef = useRef<HTMLButtonElement>(null);
  const keepRef = useRef<HTMLButtonElement>(null);
  // Which button gets focus back when the card returns to view; not set on first render. [A2]
  const backTo = useRef<"edit" | "delete" | null>(null);

  useEffect(() => {
    if (mode === "confirmingDelete") {
      // The Delete button just left the page; put focus on the safe choice.
      keepRef.current?.focus();
    } else if (mode === "view" && backTo.current) {
      (backTo.current === "edit" ? editRef : deleteRef).current?.focus();
      backTo.current = null;
    }
  }, [mode]);

  function backToView(button: "edit" | "delete") {
    backTo.current = button;
    setMode("view");
  }

  // Save and Cancel both put focus back on Edit. [A2]
  async function saveEdit(label: string, note: string) {
    const error = await onEdit(search.id, label, note);
    if (error === null) backToView("edit");
    return error;
  }

  return (
    <li className="rounded border border-[#C7D0DB] bg-white px-4 py-3">
      {/* Edit mode swaps the label and note for the form; type and county stay. */}
      {mode !== "editing" && (
        // Focus target after a save (A2), so it takes tabIndex -1.
        <h3 id={`saved-${search.id}-heading`} tabIndex={-1} className="break-words text-[18px] font-bold text-[#14304F]">
          {search.label}
        </h3>
      )}
      <p className="text-[15px] text-[#2B3A49]">
        {search.licenseType} · {countyLabel(search.county)} County
      </p>
      {mode !== "editing" && search.note && <p className="mt-1 break-words text-[15px] text-[#2B3A49]">{search.note}</p>}

      {mode === "editing" && (
        <SaveSearchForm
          idPrefix={`saved-${search.id}-edit`}
          initialLabel={search.label}
          initialNote={search.note ?? ""}
          onSubmit={saveEdit}
          onCancel={() => backToView("edit")}
        />
      )}

      {mode === "view" && (
        <div className="mt-3 flex gap-2">
          <button ref={editRef} type="button" onClick={() => setMode("editing")} className={outlineButton}>
            Edit
          </button>
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
            <button ref={keepRef} type="button" onClick={() => backToView("delete")} className={outlineButton}>
              Keep
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
