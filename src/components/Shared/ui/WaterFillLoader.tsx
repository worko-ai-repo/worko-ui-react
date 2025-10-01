import React, { useEffect, useRef, useState } from "react";
import "./WaterFillLoader.scss";

interface WaterFillLoaderProps {
  forceComplete: boolean;
}

const WaterFillLoader: React.FC<WaterFillLoaderProps> = ({ forceComplete }) => {
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0); // <--- Keep the latest value here
  const normalIntervalRef = useRef<number | null>(null);
  const fastIntervalRef = useRef<number | null>(null);

  // Keep progressRef in sync with actual progress
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  // Start normal 40-second loader
  useEffect(() => {
    const totalDuration = 40000; // 40 seconds
    const updateInterval = 100; // 0.1 second
    const increment = (100 / totalDuration) * updateInterval; // 0.25% every 100ms

    normalIntervalRef.current = window.setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(normalIntervalRef.current!);
          return 100;
        }
        return next;
      });
    }, updateInterval);

    return () => {
      clearInterval(normalIntervalRef.current!);
    };
  }, []);

  // Listen for forceComplete change
  useEffect(() => {
    if (forceComplete) {
      // Clear the normal (slow) interval
      clearInterval(normalIntervalRef.current!);

      const duration = 2000; // 2 seconds
      const updateInterval = 100; // every 100ms
      const steps = duration / updateInterval;

      fastIntervalRef.current = window.setInterval(() => {
        setProgress((prev) => {
          const current = progressRef.current;
          const increment = (100 - current) / steps;
          const next = current + increment;

          if (next >= 100) {
            clearInterval(fastIntervalRef.current!);
            return 100;
          }

          return next;
        });
      }, updateInterval);
    }

    return () => clearInterval(fastIntervalRef.current!);
  }, [forceComplete]);

  return (
    <div className="water-loader">
      <div className="circle">
        <div className="wave"></div>
      </div>
      <div className="progress-text">{Math.floor(progress)}% done</div>
    </div>
  );
};

export default WaterFillLoader;
