import { useEffect, useRef, useState, type FormEvent } from "react";

type Props = {
  // Keeps field ids unique when several cards are on the page, e.g. "saved-1-edit".
  idPrefix: string;
  initialLabel: string;
  initialNote: string;
  // Resolves to an error message to show, or null when the save worked. [E3]
  onSubmit: (label: string, note: string) => Promise<string | null>;
  onCancel: () => void;
};

const field = "mt-1 w-full rounded border border-[#C7D0DB] bg-white px-3 py-2 text-[16px] text-[#1B2733]";

// Label and note form. Edit mode on a saved card (#5); create mode in the result card, label prefilled (#8). [C3]
export default function SaveSearchForm({ idPrefix, initialLabel, initialNote, onSubmit, onCancel }: Props) {
  const [label, setLabel] = useState(initialLabel);
  const [note, setNote] = useState(initialNote);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const labelRef = useRef<HTMLInputElement>(null);

  // Focus the first field when the form opens.
  useEffect(() => {
    labelRef.current?.focus();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    // No maxLength in the browser: the server's Zod rules decide, and the typed values stay. [E1, E3]
    const message = await onSubmit(label, note);
    setBusy(false);
    setError(message);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3">
      <label htmlFor={`${idPrefix}-label`} className="block text-[15px] font-bold">
        Label
      </label>
      <input
        ref={labelRef}
        id={`${idPrefix}-label`}
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        aria-invalid={error ? true : undefined}
        className={field}
      />

      <label htmlFor={`${idPrefix}-note`} className="mt-3 block text-[15px] font-bold">
        Note
      </label>
      <p id={`${idPrefix}-note-hint`} className="text-[14px] text-[#4A5A6A]">
        Why I&apos;m tracking this (optional)
      </p>
      <textarea
        id={`${idPrefix}-note`}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        aria-describedby={`${idPrefix}-note-hint`}
        rows={2}
        className={field}
      />

      {error && (
        <p role="alert" className="mt-2 text-[15px] font-semibold text-[#A3243B]">
          {error}
        </p>
      )}
      <div className="mt-3 flex gap-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded bg-[#14304F] px-4 py-2 text-[15px] font-bold text-white hover:bg-[#0E2238]"
        >
          {busy ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded border border-[#14304F] bg-white px-4 py-2 text-[15px] font-bold text-[#14304F] hover:bg-[#EEF2F6]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
