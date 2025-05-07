/**
 * Service class for managing SEO-related functionality.
 * Provides utility methods for manipulating meta tags and handling SEO requirements.
 */
class SeoService {
    /**
     * Updates or creates the canonical URL link element.
     * 
     * @param url - The canonical URL to set
     */
    static updateCanonicalUrl(url: string) {
      let element = document.querySelector(`link[rel='canonical']`) as HTMLLinkElement;
      // Create the element if it doesn't exist
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', 'canonical');
        document.head.appendChild(element);
      }
      // Set the href attribute with the provided URL
      element.setAttribute('href', url);
    }
  
    /**
     * Updates or creates the robots meta tag.
     * 
     * @param content - The content value for the robots meta tag (e.g., "index,follow")
     */
    static updateRobots(content: string) {
      const meta = document.querySelector("meta[name='robots']");
      // Update existing meta tag if found
      if (meta) {
        meta.setAttribute('content', content);
      } 
      // Create new meta tag if not found
      else {
        const metaTag = document.createElement('meta');
        metaTag.setAttribute('name', 'robots');
        metaTag.setAttribute('content', content);
        document.head.appendChild(metaTag);
      }
    }
  
    /**
     * Determines if a URL should be indexed by search engines.
     * 
     * @param url - The URL path to check
     * @returns True if the URL should be indexed, false otherwise
     */
    static urlNeedsIndexing(url: string): boolean {
      // List of URL paths that should be indexed by search engines
      const indexableUrls = [
        '', 
        '/', 
        '/faq', 
        '/about', 
        '/corporate', 
        '/corporate/connect-with-us',
        '/for-employee',
        '/corporate', 
        '/company',
        '/guidance',
        '/jobs*',
        '/referrals',
        '/referrals/:compId/:id',
        '/jobs/:companyName/:jobid',
      ];
      return indexableUrls.includes(url);
    }
  }
  
  export default SeoService;