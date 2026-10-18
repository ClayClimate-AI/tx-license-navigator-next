import { COUNTIES } from "@/lib/counties";

// The two HVAC types for #6. #7 adds the live list of other types under its own group.
export const HVAC_TYPES = ["A/C Technician", "A/C Contractor"];

// mt-auto pins each select to the bottom of its column so both line up when a hint wraps.
const selectClass = "mt-auto w-full rounded border-2 bg-white px-3 py-2.5 text-[16px]";

type Props = {
  type: string;
  county: string;
  onTypeChange: (type: string) => void;
  onCountyChange: (county: string) => void;
  onSubmit: () => void;
  busy: boolean;
  fieldError: string;
};

// The search form, ported from Week 4. Navigator owns the values; this only shows them. [S2]
export default function LicensePicker({ type, county, onTypeChange, onCountyChange, onSubmit, busy, fieldError }: Props) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      noValidate
      className="mt-5 rounded-md border border-[#C7D0DB] bg-white p-4 md:p-5"
    >
      <fieldset>
        <legend className="mb-3 text-[17px] font-bold">Choose a license and a county</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col">
            <label htmlFor="license-type" className="block text-[15px] font-bold">License type</label>
            <p id="license-type-hint" className="mb-1.5 text-[14px] text-[#4A5A6A]">
              Technicians work for a company. Contractors run the business.
            </p>
            <select
              id="license-type"
              className={`${selectClass} border-[#5F6F82]`}
              aria-describedby="license-type-hint"
              value={type}
              onChange={(e) => onTypeChange(e.target.value)}
            >
              <optgroup label="HVAC">
                {HVAC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </optgroup>
            </select>
          </div>
          <div className="flex flex-col">
            <label htmlFor="county" className="block text-[15px] font-bold">County</label>
            <p id="county-hint" className="mb-1.5 text-[14px] text-[#4A5A6A]">The county where the business is listed.</p>
            {fieldError && (
              <p id="county-error" role="alert" className="mb-1.5 text-[14px] font-bold text-[#A3243B]">
                There is a problem: {fieldError}
              </p>
            )}
            <select
              id="county"
              className={`${selectClass} ${fieldError ? "border-[#A3243B]" : "border-[#5F6F82]"}`}
              aria-describedby={fieldError ? "county-hint county-error" : "county-hint"}
              aria-invalid={fieldError ? true : undefined}
              value={county}
              onChange={(e) => onCountyChange(e.target.value)}
            >
              <option value="">Choose a county</option>
              {/* Visitor sees Title Case; the value is the ALL CAPS one TDLR stores. */}
              {COUNTIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>
      </fieldset>
      <button
        type="submit"
        disabled={busy}
        className="mt-5 rounded bg-[#14304F] px-6 py-3 text-[16px] font-bold text-white shadow-sm hover:bg-[#0E2238] disabled:cursor-wait disabled:opacity-70"
      >
        {busy ? "Checking…" : "Show license count"}
      </button>
    </form>
  );
}
