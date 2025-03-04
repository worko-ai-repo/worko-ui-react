import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Section1 from "@Components/Corporate/Section-1"
import CompanyLogos from "@Components/Corporate/CompanyLogos";
import CorporateHero from "@Components/Corporate/CorporateHero";
import CorporatePlans from "@Components/Corporate/CorporatePlans";
import CorporateTable from "@Components/Corporate/CorporateTable";
import CorporateStepper from "@Components/Corporate/CorporateStepper";
import CorporateCommunication from "@Components/Corporate/CorporateCommunication";


const Corporate = () => {

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
        <CorporateHero />
        <Section1 />
        <CompanyLogos />
        <CorporateStepper />
        <CorporateCommunication />
        <CorporatePlans />
        <CorporateTable  />
    </div>
)
}
export default Corporate;