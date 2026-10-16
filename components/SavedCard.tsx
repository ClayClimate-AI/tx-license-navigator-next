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

// One saved search, view mode. Edit and Delete arrive in #4 and #5; the live count in #9. [R3]
export default function SavedCard({ search }: { search: SavedSearch }) {
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
    </li>
  );
}
