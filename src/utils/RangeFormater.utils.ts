  /**
   * formatRange
   *
   * Formats the range values based on the type.
   */
  export function formatRange(min: number | null, max: number | null, type: string): string {
    if (min === null || max === null) return "-"; // Handle null values during API loading
    if (min === max) {
      return `${min} ${type === "experience" ? `${max === 1 ? "Year" : "Years"}` : "LPA"}`;
    }
    if (type === "experience") {
      if (min === 0 && max === 0) return "-"; // Handling edge case for no experience range
      if (max === 9999) return `${min}+ Years`; // Handle max as 9999 for experience
      return `${min}-${max} ${max === 1 ? "Year" : "Years"}`;
    } else if (type === "salary") {
      if (min === 0 && max === 0) return "-"; // Handling edge case for no salary range
      if (max === 9999) return `${min}+ LPA`; // Handle max as 9999 for salary
      return `${min}-${max} LPA`;
    }
    return "-"; // Default value
  }