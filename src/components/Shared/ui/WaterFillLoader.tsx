import React, { useEffect, useRef, useState } from "react";
import "./WaterFillLoader.scss";

const WaterFillLoader: React.FC<{
  forceComplete: boolean;
  messageCount: number;
  currentMessageIndex: number;
}> = ({ forceComplete, messageCount, currentMessageIndex }) => {
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);
  const normalIntervalRef = useRef<number | null>(null);
  const messageBasedIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  // Calculate progress based on messages shown
  useEffect(() => {
    if (forceComplete) {
      // Clear normal interval
      if (normalIntervalRef.current) {
        clearInterval(normalIntervalRef.current);
      }

      // Calculate target progress based on messages
      const messageProgress = ((currentMessageIndex + 1) / messageCount) * 100;
      const targetProgress = Math.max(messageProgress, progressRef.current);

      // Smoothly transition to message-based progress
      const duration = 500;
      const updateInterval = 50;
      const steps = duration / updateInterval;
      const startProgress = progressRef.current;
      const progressDiff = targetProgress - startProgress;

      messageBasedIntervalRef.current = window.setInterval(() => {
        setProgress((prev) => {
          const increment = progressDiff / steps;
          const next = prev + increment;

          if (next >= targetProgress) {
            if (messageBasedIntervalRef.current) {
              clearInterval(messageBasedIntervalRef.current);
            }
            return targetProgress;
          }
          return next;
        });
      }, updateInterval);

      return () => {
        if (messageBasedIntervalRef.current) {
          clearInterval(messageBasedIntervalRef.current);
        }
      };
    }
  }, [forceComplete, currentMessageIndex, messageCount]);

  // Normal slow progress
  useEffect(() => {
    if (!forceComplete) {
      const totalDuration = 40000;
      const updateInterval = 100;
      const increment = (100 / totalDuration) * updateInterval;

      normalIntervalRef.current = window.setInterval(() => {
        setProgress((prev) => {
          const next = prev + increment;
          if (next >= 95) {
            if (normalIntervalRef.current) {
              clearInterval(normalIntervalRef.current);
            }
            return 95;
          }
          return next;
        });
      }, updateInterval);

      return () => {
        if (normalIntervalRef.current) {
          clearInterval(normalIntervalRef.current);
        }
      };
    }
  }, [forceComplete]);

  // Ensure 100% when all messages shown
  useEffect(() => {
    if (currentMessageIndex >= messageCount - 1 && forceComplete) {
      setProgress(100);
    }
  }, [currentMessageIndex, messageCount, forceComplete]);

  return (
    <div className="water-loader flex flex-col">
      <div className="circle">
        <div className="wave" style={{ transform: `translateY(${100 - progress}%)` }}>
          <div className="wave-inner"></div>
        </div>
      </div>
      <div className="progress-text">
        {Math.floor(progress)}% done
      </div>
    </div>
  );
};

export default WaterFillLoader;