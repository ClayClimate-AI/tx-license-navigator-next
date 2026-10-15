// Site name as real text inside a header landmark, so screen readers and search see it.
export default function SiteHeader() {
  return (
    <header>
      <p className="bg-[#14304F] px-4 py-1 text-[13px] text-[#DCE5EF] md:px-6">
        A student project. Not an official State of Texas website.
      </p>
      <div className="bg-[#1F5C99] px-4 py-4 md:px-6">
        <div className="mx-auto max-w-3xl">
          <p className="text-[22px] font-bold leading-tight text-white">
            Second Chance License Navigator
          </p>
          <p className="text-[14px] text-[#CFE0F2]">HVAC license demand by Texas county</p>
        </div>
      </div>
      <div className="h-1 bg-[#A3243B]" />
    </header>
  );
}
