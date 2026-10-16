import SavedCard, { type SavedSearch } from "./SavedCard";

export type ListStatus = "loading" | "ready" | "error";

type Props = {
  searches: SavedSearch[];
  status: ListStatus;
  onRetry: () => void;
};

// "My saved searches": always on the page, newest first, with empty and error states. [R1, R2, E3]
export default function SavedList({ searches, status, onRetry }: Props) {
  return (
    <section aria-labelledby="saved-heading" className="mt-8">
      {/* Focus target after a delete (A2), so it takes tabIndex -1. */}
      <h2 id="saved-heading" tabIndex={-1} className="text-[22px] font-bold text-[#14304F]">
        My saved searches
      </h2>

      {status === "loading" && <p className="mt-2 text-[15px] text-[#2B3A49]">Loading saved searches…</p>}

      {status === "error" && (
        <div className="mt-2 rounded border border-[#A3243B] bg-[#FDF2F4] px-4 py-3">
          <p className="text-[15px] text-[#1B2733]">We could not reach the saved searches database.</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 rounded bg-[#A3243B] px-4 py-2 text-[15px] font-bold text-white hover:bg-[#82192D]"
          >
            Try again
          </button>
        </div>
      )}

      {status === "ready" && searches.length === 0 && (
        <p className="mt-2 text-[15px] text-[#2B3A49]">
          Nothing saved yet. Run a search above, then select Save to watchlist.
        </p>
      )}

      {status === "ready" && searches.length > 0 && (
        <ul className="mt-3 space-y-3">
          {searches.map((s) => (
            <SavedCard key={s.id} search={s} />
          ))}
        </ul>
      )}
    </section>
  );
}
