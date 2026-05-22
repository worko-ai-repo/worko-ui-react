import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import CorporateCardsSection from "@Components/Corporate/CorporateCardsSection";
import CompanyLogos from "@Components/Corporate/CompanyLogos";
import CorporateHero from "@Components/Corporate/CorporateHero";
import CorporatePlans, { CTABannerSection } from "@Components/Corporate/CorporatePlans";
import CorporateTable from "@Components/Corporate/CorporateTable";
import CorporateStepper from "@Components/Corporate/CorporateStepper";
import CorporateCommunication from "@Components/Corporate/CorporateCommunication";
import { HiddenCostSection } from "@Components/Corporate/HiddenCostSection";
import WhyChooseWorko from "@Components/Corporate/WhyChooseWorko";
// ─── Section Label ────────────────────────────────────────────────────────────
export const SectionLabel = ({ text }: { text: string }) => (
  <p className="text-[11px] tracking-[0.2em] uppercase text-[#0044FF] font-bold mb-4">
    {text}
  </p>
);
 
// ─── Quote SVG ────────────────────────────────────────────────────────────────
export const QuoteSVG = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0044FF" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z" />
    <path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z" />
  </svg>
);

const Corporate = () => {
  const [hires, setHires] = useState<number>(1);
  const [salary, setSalary] = useState<number>(3);
  const [menuOpen, setMenuOpen] = useState(false);

    const location = useLocation();

    /**
     * useEffect to scroll to the element with the id from the hash in the URL
     */
    useEffect(() => {
      if (location.hash) {
        const element = document.getElementById(location.hash.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    }, [location]);
  

return(
    <div className="w-full">
        <CorporateHero hires={hires} salary={salary} />
        <WhyChooseWorko />
        <CorporateCardsSection />
        <HiddenCostSection />
        <CorporateCommunication />
        <CorporateStepper />
        <CorporateTable hires={hires} setHires={setHires} salary={salary} setSalary={setSalary} />
        <CorporatePlans />
        <CTABannerSection />
    </div>
)
}
export default Corporate;