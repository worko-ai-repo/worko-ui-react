export const DaysFormatter = (createdAt:any) => {
    const now = new Date();
    const posted = new Date(createdAt);
    const diffMs = now.getTime() - posted.getTime(); // Difference in milliseconds
  
    const MINUTE = 60 * 1000;
    const HOUR = 60 * MINUTE;
    const DAY = 24 * HOUR;
    const WEEK = 7 * DAY;
    const MONTH = 30 * DAY; // Approximate
    const YEAR = 365 * DAY; // Approximate
  
    if (diffMs < HOUR) {
      const minutes = Math.floor(diffMs / MINUTE);
      return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
    }
    if (diffMs < DAY) {
      const hours = Math.floor(diffMs / HOUR);
      return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    }
    if (diffMs < WEEK) {
      const days = Math.floor(diffMs / DAY);
      return `${days} day${days === 1 ? "" : "s"} ago`;
    }
    if (diffMs < MONTH) {
      const weeks = Math.floor(diffMs / WEEK);
      return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
    }
    if (diffMs < YEAR) {
      const months = Math.floor(diffMs / MONTH);
      return `${months} month${months === 1 ? "" : "s"} ago`;
    }
  
    const years = Math.floor(diffMs / YEAR);
    return `${years} year${years === 1 ? "" : "s"} ago`;
  };
  