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
    <div className="relative w-full h-min flex items-center justify-center">
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
      <span className="absolute text-xs md:text-xl font-bold text-white">{progress}%
      <div className="max-[350px]:hidden min-[350px]:block absolute text-[8px] md:text-xs font-bold text-white">Scores</div>
      </span>
      
    </div>
  );
};

export default GaugeComponent;