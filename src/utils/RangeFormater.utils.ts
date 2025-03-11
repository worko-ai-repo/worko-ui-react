  /**
   * formatRange
   *
   * Formats the range values based on the type.
   */
  export function formatRange(min: number | undefined, max: number | undefined, type: string): string {
    if (type === "salary" && (!min || !max)) return "Not Disclosed"; // Ensure salary is disclosed properly
    if (min === undefined || max === undefined) return "-"; // Handle undefined values during API loading
    
    if (min === max) {
      return `${min} ${type === "experience" ? (max === 1 ? "Year" : "Years") : "LPA"}`;
    }
  
    if (type === "experience") {
      if (min === 0 && max === 0) return "-"; // Handling edge case for no experience range
      if (max === 9999) return `${min}+ Years`; // Handle max as 9999 for experience
      return `${min}-${max} ${max === 1 ? "Year" : "Years"}`;
    } 
    
    if (type === "salary") {
      if (min === 0 && max === 0) return "-"; // Handling edge case for no salary range
      if (max === 9999) return `${min}+ LPA`; // Handle max as 9999 for salary
      return `${min}-${max} LPA`;
    }
  
    return "Not Disclosed"; // Default value
  }
  