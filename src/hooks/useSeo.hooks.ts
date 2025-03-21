import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import SeoService from "@Services/SeoHandler.service"; 

const useSeo = () => {
  const location = useLocation();

  useEffect(() => {
    const currentUrl = window.location.href;
    SeoService.updateCanonicalUrl(currentUrl);

    if (SeoService.urlNeedsIndexing(location.pathname)) {
      SeoService.updateRobots("index, follow");
    }
  }, [location]);
};

export default useSeo;
