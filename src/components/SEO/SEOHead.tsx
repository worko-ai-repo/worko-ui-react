import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  ogUrl?: string;
  twitterCard?: "summary" | "summary_large_image" | "app" | "player";
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  robots?: string;
  noindex?: boolean;
  nofollow?: boolean;
  schemaJsonLd?: object;
}

/**
 * Comprehensive SEO component for managing all meta tags, OpenGraph, Twitter Cards, and Schema.org JSON-LD
 */
const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = "website",
  ogUrl,
  twitterCard = "summary_large_image",
  twitterTitle,
  twitterDescription,
  twitterImage,
  robots,
  noindex = false,
  nofollow = false,
  schemaJsonLd,
}) => {
  const location = useLocation();
  const baseUrl = import.meta.env.APP_WORKO_BASE_URL || window.location.origin;
  
  // Default values
  const defaultTitle = "Worko - Find Your Dream Job | Job Referrals & Opportunities";
  const defaultDescription = "Discover top job opportunities and get referred to leading companies. Join Worko to access exclusive job openings and accelerate your career.";
  const defaultImage = `${baseUrl}/logo-text.png`;

  const finalTitle = title || defaultTitle;
  const finalDescription = description || defaultDescription;
  const finalCanonicalUrl = canonicalUrl || `${baseUrl}${location.pathname}`;
  const finalOgUrl = ogUrl || finalCanonicalUrl;
  const finalOgTitle = ogTitle || finalTitle;
  const finalOgDescription = ogDescription || finalDescription;
  const finalOgImage = ogImage || defaultImage;
  const finalTwitterTitle = twitterTitle || finalTitle;
  const finalTwitterDescription = twitterDescription || finalDescription;
  const finalTwitterImage = twitterImage || finalOgImage;
  
  const robotsContent = robots || (noindex ? (nofollow ? "noindex, nofollow" : "noindex, follow") : (nofollow ? "index, nofollow" : "index, follow"));

  useEffect(() => {
    // Update or create title
    document.title = finalTitle;

    // Helper function to update or create meta tag
    const updateMetaTag = (name: string, content: string, attribute: string = "name") => {
      let element = document.querySelector(`meta[${attribute}='${name}']`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // Helper function to update or create property tag (for OpenGraph)
    const updatePropertyTag = (property: string, content: string) => {
      updateMetaTag(property, content, "property");
    };

    // Basic meta tags
    updateMetaTag("description", finalDescription);
    if (keywords) {
      updateMetaTag("keywords", keywords);
    }
    updateMetaTag("robots", robotsContent);

    // OpenGraph tags
    updatePropertyTag("og:title", finalOgTitle);
    updatePropertyTag("og:description", finalOgDescription);
    updatePropertyTag("og:image", finalOgImage);
    updatePropertyTag("og:type", ogType);
    updatePropertyTag("og:url", finalOgUrl);
    updatePropertyTag("og:site_name", "Worko");

    // Twitter Card tags
    updateMetaTag("twitter:card", twitterCard);
    updateMetaTag("twitter:title", finalTwitterTitle);
    updateMetaTag("twitter:description", finalTwitterDescription);
    updateMetaTag("twitter:image", finalTwitterImage);

    // Canonical URL
    let canonicalLink = document.querySelector("link[rel='canonical']") as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", finalCanonicalUrl);

    // Schema.org JSON-LD
    if (schemaJsonLd) {
      // Remove existing schema JSON-LD scripts
      const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
      existingScripts.forEach((script) => {
        const scriptContent = script.textContent || "";
        try {
          const parsed = JSON.parse(scriptContent);
          // Only remove if it's our schema (has @context or @graph)
          if (parsed["@context"] || parsed["@graph"]) {
            script.remove();
          }
        } catch {
          // If parsing fails, remove it anyway
          script.remove();
        }
      });

      // Add new schema JSON-LD
      // Support both single objects and @graph format
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(schemaJsonLd, null, 0);
      document.head.appendChild(script);
    }
  }, [
    finalTitle,
    finalDescription,
    keywords,
    finalCanonicalUrl,
    finalOgTitle,
    finalOgDescription,
    finalOgImage,
    ogType,
    finalOgUrl,
    twitterCard,
    finalTwitterTitle,
    finalTwitterDescription,
    finalTwitterImage,
    robotsContent,
    schemaJsonLd,
  ]);

  return null; // This component doesn't render anything
};

export default SEOHead;
