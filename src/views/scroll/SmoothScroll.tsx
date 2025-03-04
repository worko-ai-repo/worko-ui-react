import { useEffect, ReactNode } from "react";
import Lenis from "@studio-freight/lenis"; // Import Lenis for smooth scrolling
import { useAppContext } from "@Context/App.context";

interface SmoothScrollProps {
  children: ReactNode; // Accepts children to wrap the entire page content
}

/**
 * SmoothScroll Component
 * 
 * Enables smooth scrolling using the Lenis library while allowing modals
 * to function correctly without breaking native scrolling inside them.
 *
 * @param {SmoothScrollProps} props - Component props containing children elements.
 * @returns {JSX.Element} A div wrapping the children with Lenis smooth scrolling.
 */
const SmoothScroll = ({ children }: SmoothScrollProps): JSX.Element => {
  const { isModalOpen } = useAppContext();

  useEffect(() => {
    // Initialize Lenis instance with custom settings
    const lenis = new Lenis({
      duration: 1.2, // Defines how long the scroll animation lasts (in seconds)
      easing: (t) => 1 - Math.pow(1 - t, 3), // Custom easing function for a smoother feel
      smoothWheel: true, // Enables smooth scrolling for mouse wheel
      gestureOrientation: "vertical", // Locks scrolling to the vertical direction
      syncTouch: true, // Enables touch-based smooth scrolling
    });

    /**
     * Animation loop to keep Lenis running
     * Uses requestAnimationFrame for optimized performance
     */
    const raf = (time: number) => {
      lenis.raf(time); // Update Lenis instance with the current time
      requestAnimationFrame(raf); // Continuously call this function
    };

    requestAnimationFrame(raf); // Start the animation loop

    // ✅ Properly pause/resume Lenis when modal opens/closes
    if (isModalOpen) {
      lenis.destroy(); // Pauses smooth scrolling
    } else {
      lenis.start(); // Resumes smooth scrolling
    }

    // Cleanup function: Destroy Lenis when the component unmounts
    return () => {
      lenis.destroy();
    };
  }, [isModalOpen]); // React watches `isModalOpen`

  return <div>{children}</div>; // Wraps children inside Lenis smooth scroll container
};

export default SmoothScroll;
