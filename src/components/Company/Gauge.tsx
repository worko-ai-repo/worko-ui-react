import { useEffect, useState } from "react";

interface GaugeProps {
  score: number; // Score between 0 and 100
}

const GaugeComponent: React.FC<GaugeProps> = ({ score }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setTimeout(() => setProgress(score), 300); // Smooth animation delay
  }, [score]);

  const radius = 40; // Circle size
  const circumference = 2 * Math.PI * radius; // Full circle length
  const offset = circumference - (progress / 100) * circumference; // Animation logic

  return (
    <div className="w-full h-full relative flex items-center justify-center">
      {/* Background Circle */}
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="white"
          strokeWidth="8"
        />
        {/* Animated Progress Circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="skyblue"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {/* Score Text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs md:text-xl font-bold text-white">{progress}%</span>
      </div>
    </div>
  );
};

export default GaugeComponent;