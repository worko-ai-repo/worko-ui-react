import React, { useState } from "react";
import Draggable from "react-draggable";
import { SlidersHorizontal } from "lucide-react";

export default function WeightTuner({ onWeightsChange }: { onWeightsChange: (w: any) => void }) {
  const [open, setOpen] = useState(false);
  const [weights, setWeights] = useState({
    coreSkills: 40,
    softSkills: 5,
    experience: 15,
    salary: 20,
    remainingWeight: 20,
  });

  const toggleOpen = () => setOpen(!open);
  const total = Object.values(weights).reduce((a, b) => a + b, 0);

  const updateWeight = (key: string, value: number) => {
    const newWeights = { ...weights, [key]: value };
    setWeights(newWeights);
    onWeightsChange(newWeights);
  };

  return (
    <Draggable>
      <div className="fixed bottom-6 right-6 z-50">
        {/* Draggable Circle Button */}
        <button
          onClick={toggleOpen}
          className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-700 transition-all"
        >
          <SlidersHorizontal size={28} />
        </button>

        {/* Tooltip Panel */}
        {open && (
          <div className="absolute bottom-16 right-0 w-72 bg-white border shadow-xl rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-2">Tune Weights</h3>
            {Object.entries(weights).map(([key, value]) => (
              <div key={key} className="mb-3">
                <label className="block text-sm font-medium capitalize">{key}</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={value}
                  onChange={(e) => updateWeight(key, parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-xs text-right">{value}</div>
              </div>
            ))}
            <p className={`text-sm font-bold text-right ${total !== 100 ? "text-red-600" : "text-green-600"}`}>
              Total: {total}
            </p>
          </div>
        )}
      </div>
    </Draggable>
  );
}
