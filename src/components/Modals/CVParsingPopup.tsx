import { Loader } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";

import { toast } from "react-toastify";
import { getToastOptions } from "@Utils/Toast.utils";
import { useAppContext } from "@Context/App.context";
import useSetInterval from "@Hooks/useSetInterval.hook";
import profileService from "@Services/ProfileService";
import WaterFillLoader from "@Components/Shared/ui/WaterFillLoader";

interface CVParsingPopupProps {
  onClose: () => void;
  maxDurationMs?: number;
  checkIntervalMs?: number;
}

const CVParsingPopup: React.FC<CVParsingPopupProps> = ({ onClose, maxDurationMs = 40000, checkIntervalMs = 5000 }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(Math.floor(maxDurationMs / 1000));
  const [visibleMessages, setVisibleMessages] = useState<{
    id: number;
    text: string;
    position: number; // -1 (top), 0 (center), 1 (bottom)
  }[]>([]);
  const [forceComplete, setForceComplete] = useState(false);
  const { userDetails } = useAppContext();

  const messageIdRef = useRef(0);
  const currentIndexRef = useRef(0);
  // store numeric timeout ids (browser setTimeout returns number)
  const timeoutsRef = useRef<number[]>([]);
  const startTimeRef = useRef<number | null>(null);
  const hasClosedRef = useRef(false);

  const messages = [
    // "Matching your department",
    // "Analyzing your core skills",
    // "Analyzing your technical skills",
    // "Fetching socials links",
    // "Matching your locations",
    // "Matching your Salary",
    "Reading your CV…",
    "Identifying your skills…",
    "Mapping your work experience…",
    "Checking your career progression",
    "Understanding your strengths & expertise…",
    "Refreshing your profile with updated insights",
  ];

  // animation configuration — tweak these to change how smooth / how far
  const TRANSITION_MS = 700; // must match the CSS transition below
  const MOVE_DELAY = 50; // small delay before starting the move (lets the new node paint)
  const OFFSET_PX = 56; // vertical offset for each slot (-1,0,1)

// Initialize with first message at center position
useEffect(() => {
  if (messages.length > 0) {
    setVisibleMessages([
      {
        id: messageIdRef.current++,
        text: messages[0],
        position: 0, // current message
      },
      {
        id: messageIdRef.current++,
        text: messages[1],
        position: 1, // next message
      },
    ]);
    currentIndexRef.current = 0;
    setCurrentMessageIndex(0);
  }
  startTimeRef.current = Date.now();
}, []);


  // Rotation interval (single interval, uses ref to avoid stale closures)
  useEffect(() => {
const rotate = () => {
  const nextIndex = currentIndexRef.current + 1;

  // Add next-next message at position 2 if exists
  if (nextIndex + 1 < messages.length) {
    setVisibleMessages((prev) => [
      ...prev,
      {
        id: messageIdRef.current++,
        text: messages[nextIndex + 1],
        position: 2,
      },
    ]);
  }

  // Move all messages up by 1
  const moveTimeout = window.setTimeout(() => {
    setVisibleMessages((prev) =>
      prev.map((m) => ({ ...m, position: m.position - 1 }))
    );
  }, MOVE_DELAY);

  // Remove messages off screen (position < 0)
    const removeTimeout = window.setTimeout(() => {
      setVisibleMessages((prev) => prev.filter(m => m.position >= -1));
    }, MOVE_DELAY + TRANSITION_MS + 20);

    timeoutsRef.current.push(moveTimeout, removeTimeout);

    currentIndexRef.current = nextIndex;
    setCurrentMessageIndex(nextIndex);
  };


    const timer = window.setInterval(rotate, 5000);

    return () => {
      window.clearInterval(timer);
      timeoutsRef.current.forEach((t) => window.clearTimeout(t));
      timeoutsRef.current = [];
    };
  }, []);

  // Countdown timer (based on maxDurationMs)
  useEffect(() => {
    const interval = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [maxDurationMs]);

  // Polling using interval hook every checkIntervalMs
  useSetInterval(async () => {
    if (hasClosedRef.current) return;
    const now = Date.now();
    const start = startTimeRef.current ?? now;
    const elapsed = now - start;

    if (elapsed > maxDurationMs) {
      setForceComplete(true);
      hasClosedRef.current = true;
      toast.error("Error fetching CV. Please try again. If the issue persists, contact admin.", getToastOptions());
      onClose();
      return;
    }

    try {
      if (!userDetails?.email) return;
      const response = await profileService.fetchUserData(userDetails.email, "details");
      const isDone = Boolean(response?.[0]?.isCvExtracted && response?.[0]?.isCvExtracted === true  );
      if (isDone) {
        setForceComplete(true);
        hasClosedRef.current = true;
        // small grace period to let the loader fill
        window.setTimeout(() => {
          toast.success("CV parsed successfully!", getToastOptions());
          onClose();
        }, 3000);
      }
    } catch {
      // ignore individual poll errors, rely on timeout or next tick
    }
  }, checkIntervalMs);

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-[9999]">
      <div className="relative bg-white/95 backdrop-blur-sm p-8 rounded-2xl w-[650px] max-w-full shadow-2xl border border-white/20 animate-fade-in-scale">
        
        {/* Two-column layout */}
        <div className="flex flex-row gap-6 w-full">
          
          {/* Left Column: Loader */}
          <div className="w-1/2 flex items-center justify-center h-60">
            <WaterFillLoader 
            forceComplete={forceComplete}
            />
          </div>

          {/* Right Column: Messages */}
          <div className="w-1/2 relative h-60 overflow-hidden">
            {visibleMessages.map((message) => {
              const translateY = message.position * OFFSET_PX;
              const scale = message.position === 0 ? 1 : 0.96;
              const opacity =
                message.position === 0 ? 1 :
                message.position === -1 ? 0.6 :
                message.position === 1 ? 0.85 :
                message.position === -2 ? 0 :
                1;
              const zIndex = 20 - Math.abs(message.position);

              let bgClasses = "";
              if (message.position === 0) {
                bgClasses = "bg-gradient-to-r from-blue-600 to-blue-500 text-white opacity-100 shadow-lg ring-2 ring-blue-400/30";
              } else if (message.position === -1) {
                bgClasses = "bg-blue-500/40 text-white/60";
              } else if (message.position === 1) {
                bgClasses = "bg-blue-500/70 text-white/90 shadow-md";
              } else if (message.position === -2) {
                bgClasses = "bg-blue-500/40 text-white/60";
              }

              return (
                <div
                  key={message.id}
                  className={`absolute w-[90%] rounded-xl px-3 py-1 border border-white/10 flex items-center justify-between ${bgClasses}`}
                  style={{
                    left: "50%",
                    top: "50%",
                    transform: `translate(-50%, ${translateY}px) scale(${scale})`,
                    transition: `transform ${TRANSITION_MS}ms cubic-bezier(.2,.8,.2,1), opacity ${TRANSITION_MS}ms ease`,
                    opacity,
                    zIndex,
                  }}
                >
                  <span className="font-medium text-sm">{message.text}</span>
                  <div className="w-8 h-8 rounded border bg-white flex items-center justify-center text-center">
                    {/* <img src={infinitySquare} alt="" className="w-6 h-6" /> */}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Message */}
        <div className="text-center space-y-3 mt-6">
          <div className="flex items-center justify-center gap-2">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
          <p className="text-gray-600 font-semibold text-base">Parsing your CV... Please wait.</p>
        </div>
      </div>
    </div>

  );
};

export default CVParsingPopup;
