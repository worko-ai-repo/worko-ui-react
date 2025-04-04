import type { ToastOptions } from "react-toastify";

/**
 * Base styling for all toast notifications
 * These styles will be applied to every toast variant
 */
const baseStyle: React.CSSProperties = {
  borderRadius: "6px",
  padding: "12px 16px",
};

/**
 * Collection of predefined toast style variants
 * Each variant extends the baseStyle with custom visual properties
 */
const toastVariants: Record<string, React.CSSProperties> = {
  // Standard toast with light background
  default: {
    ...baseStyle,
    fontWeight: "500",    // Medium font weight
    borderRadius: "50px", // Circular corners
  },
  
  // Glassmorphism-style toast with blur effect
  glass: {
    ...baseStyle,
    background: "rgba(255, 255, 255, 0.2)", // Semi-transparent background
    backdropFilter: "blur(10px)",           // Creates frosted glass effect
    WebkitBackdropFilter: "blur(10px)",     // Safari support for backdrop filter
    boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px", // Subtle shadow
    border: "0.5px solid rgba(0, 0, 0, 0.3)",      // Thin border
    // color: "#000",                                  // Black text
  },
  // Add more variants here as needed
};

/**
 * Generates toast configuration options by combining default settings,
 * variant-specific styles, and any custom overrides
 * 
 * @param overrides - Custom toast options to merge with defaults
 * @param type - The toast variant name to use (from toastVariants)
 * @returns Complete ToastOptions configuration object
 */
export const getToastOptions = (
  overrides: ToastOptions = {},
  type: keyof typeof toastVariants = "default"
): ToastOptions => ({
  position: "top-center",    // Toast appears at the top center of screen
  autoClose: 5000,           // Automatically close after 5 seconds
  hideProgressBar: true,     // Don't show countdown progress bar
  closeOnClick: true,        // Close when clicked
  pauseOnHover: true,        // Pause autoClose timer when hovering
  draggable: true,           // Allow user to drag toast
  theme: "colored",          // Use react-toastify's colored theme
  ...overrides,              // Apply any custom override options
  style: {
    ...toastVariants[type],  // Apply selected variant styles
    ...(overrides.style || {}), // Merge any custom style overrides
  },
});
