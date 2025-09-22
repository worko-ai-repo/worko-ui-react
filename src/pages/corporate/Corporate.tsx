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
        <CorporateCardsSection />
        <CompanyLogos />
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