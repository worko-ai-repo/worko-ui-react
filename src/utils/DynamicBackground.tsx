import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * pageBackgroundsDto
 * 
 * @description This object contains the background styles for each page.
 */
interface pageBackgroundsDto {
  [key: string]: string;
}


/**
 * Page Background Styles
 * 
 * @description This object contains the background styles for each page.
 * It supports solid colors, gradients, and background images.
 */
const pageBackgrounds: Record<string, string> = {
  "/": "#3c92eb", 
  '/for-employee': '#316bff',
  "/corporate/connect-with-us": "#2053db", // Gradient
  "/contact": "url('/assets/bg-contact.jpg') center/cover no-repeat", // Background image
};

/**
 * DynamicBackgroundHandler
 * 
 * @description This component sets the background style for the page based on the current route.
 * @returns null
 */
const DynamicBackgroundHandler = () => {
  const location = useLocation();

  useEffect(() => {
    const layout = document.getElementById("MainLayout");
    if (layout) {
      const backgroundStyle = pageBackgrounds[location.pathname] || "#FFFFFF";
      
      if (backgroundStyle.startsWith("url")) {
        // If it's an image, set `backgroundImage`
        layout.style.background = "none"; // Reset other styles
        layout.style.backgroundImage = backgroundStyle;
      } else {
        // Otherwise, apply directly (solid color or gradient)
        layout.style.background = backgroundStyle;
      }
    }
  }, [location.pathname]);

  return null; // No UI needed
};

export default DynamicBackgroundHandler;
