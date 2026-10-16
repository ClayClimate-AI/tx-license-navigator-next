import Navigator from "@/components/Navigator";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import TrustNote from "@/components/TrustNote";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-6 md:px-6">
        <h1 className="text-[26px] font-bold leading-tight text-[#14304F]">
          Look up HVAC license demand by county
        </h1>
        <p className="mt-1.5 text-[16px] text-[#2B3A49]">
          See how many people hold an HVAC license in a Texas county. Use it to judge local demand
          before you train or apply.
        </p>
        <TrustNote />
        <Navigator />
      </main>
      <SiteFooter />
    </>
  );
}
