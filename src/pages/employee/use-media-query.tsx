import { useState, useEffect } from 'react';

export const useMediaQuery = (query:any) => {
  // Initialize with a default value by checking the query immediately
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    // Define our event listener
    const handleChange = (event:any) => {
      setMatches(event.matches);
    };

    // Set initial value
    setMatches(mediaQuery.matches);

    // Add event listener
    mediaQuery.addEventListener('change', handleChange);

    // Clean up
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]); // Only re-run if the query changes

  return matches;
};