import { useAppContext } from "@Context/App.context";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";

interface GaugeProps {
  score: number; // Score between 0 and 100
  strokeWidth?: number; // Stroke width of the gauge
  color?: string
}

const GaugeComponent: React.FC<GaugeProps> = ({ score ,strokeWidth, color}) => {
  const [progress, setProgress] = useState(0);
  const {isLoggedIn} = useAppContext();
  
  useEffect(()=>{
    if (!isLoggedIn) setProgress(0);
  },[isLoggedIn])

  useEffect(() => {
    setTimeout(() => setProgress(score), 300); // Smooth animation delay
  }, [score]);

  const radius = 40; // Circle size
  const circumference = 2 * Math.PI * radius; // Full circle length
  const offset = circumference - (progress / 100) * circumference; // Animation logic

  // Determine stroke color based on score
  const getColor = () => {
    if (progress <= 25) return "red"; // Red
    if (progress <= 50) return "orange"; // Orange
    if (progress <= 75) return "skyblue"; // Blue
    return "rgba(90,255,101,1)"; // Green
  };

  // If user is not logged in, set score to -2
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
          strokeWidth={strokeWidth || 8}
        />
        {/* Animated Progress Circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth || 8}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {/* Score Text */}
      <div className="absolute inset-0 flex items-center justify-center">
        {isLoggedIn ?( <span className={`text-xs scale-95 md:text-xl font-semibold ${color ? 'text-black' : 'text-white'}`}>
          {progress != -1 ? `${progress}%`:<Loader className="animate-spin"/>}</span>):
          (<i className="fa-solid text-yellow-500 fa-triangle-exclamation cursor-pointer text-xs sm:text-lg"></i>)}
      </div>
    </div>
  );
};

export default GaugeComponent;