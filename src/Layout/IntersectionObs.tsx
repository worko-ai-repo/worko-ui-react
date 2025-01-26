import React, { useEffect, useRef, useState } from "react";
import "./intersectionobs.css"; // Import your CSS file

interface RevealProps {
  children: React.ReactNode;
  width?: string;
  IsDual?: boolean;
  CName: string;
}

const Reveal: React.FC<RevealProps> = ({ children, width = "fit-content", IsDual, CName }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    console.log(CName)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target); // Stop observing once visible
          }
        });
      },
      { threshold: .85 } // Adjust this threshold as needed
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", width, overflow: "hidden" }} className="reveal-main-box">
      <div className={`${CName} ${isVisible ? "visible" : "hidden"}`}>
        {children}
      </div>
      {IsDual && (<div className={`slide-effect ${isVisible ? "visible" : "hidden"}`} />)}
    </div>
  );
};

export default Reveal;