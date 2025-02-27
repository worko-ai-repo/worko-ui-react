import CompanyLogos from "@Components/Corporate/CompanyLogos";
import CorporateCommunication from "@Components/Corporate/CorporateCommunication";
import CorporateHero from "@Components/Corporate/CorporateHero";
import CorporatePlans from "@Components/Corporate/CorporatePlans";
import CorporateStepper from "@Components/Corporate/CorporateStepper";
import CorporateTable from "@Components/Corporate/CorporateTable";
import Section1 from "@Components/Corporate/Section-1"
import { useState } from "react";


const Corporate = () => {


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