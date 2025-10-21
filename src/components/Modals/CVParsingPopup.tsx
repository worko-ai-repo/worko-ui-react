
import WaterFillLoader from "@Components/Shared/ui/WaterFillLoader";
import { Loader } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";

interface CVParsingPopupProps {
  isInitial: boolean;
  onClose: () => void;
  maxDurationMs?: number;
  checkIntervalMs?: number;
}

const CVParsingPopup: React.FC<CVParsingPopupProps> = ({ 
  isInitial = false, 
  onClose, 
  maxDurationMs = 40000, 
  checkIntervalMs = 5000 
}) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [visibleMessages, setVisibleMessages] = useState<{
    id: number;
    text: string;
    position: number;
  }[]>([]);
  const [forceComplete, setForceComplete] = useState(false);
  const [allMessagesShown, setAllMessagesShown] = useState(false);

  const messageIdRef = useRef(0);
  const currentIndexRef = useRef(0);
  const timeoutsRef = useRef<number[]>([]);
  const startTimeRef = useRef<number | null>(null);
  const hasClosedRef = useRef(false);
  const cvCompletedRef = useRef(false);
  const rotationIntervalRef = useRef<number | null>(null);

  const nomessages = [
    "Reviewing your updated details…",
    "Cross-checking your work experience & career progression…",
    "Understanding your location preferences…",
    "Confirming salary expectations & availability…",
    "Analyzing your technical & soft skills…",
    "Finding the most relevant job matches for you…",
  ];
  
  const initialMessage = [
    "Scanning your CV…",
    "Identifying your core skills…",
    "Mapping your work experience…",
    "Analysing your career progression…",
    "Detecting your preferred job functions & departments…",
    "Preparing your profile form",
  ];
  
  const messages = isInitial ? initialMessage : nomessages;

  const TRANSITION_MS = 700;
  const MOVE_DELAY = 50;
  const OFFSET_PX = 56;
  
  // Calculate rotation speed based on CV completion status
  const getRotationSpeed = () => {
    if (cvCompletedRef.current) {
      // Speed up to 2 seconds per message when CV is done
      return 2000;
    }
    return 5000; // Normal speed
  };

  // Initialize with first message
  useEffect(() => {
    if (messages.length > 0) {
      setVisibleMessages([
        {
          id: messageIdRef.current++,
          text: messages[0],
          position: 0,
        },
        {
          id: messageIdRef.current++,
          text: messages[1],
          position: 1,
        },
      ]);
      currentIndexRef.current = 0;
      setCurrentMessageIndex(0);
    }
    startTimeRef.current = Date.now();
  }, []);

  // Rotation logic
  const rotate = () => {
    const nextIndex = currentIndexRef.current + 1;

    // Check if we've shown all messages
    if (nextIndex >= messages.length) {
      setAllMessagesShown(true);
      if (rotationIntervalRef.current) {
        window.clearInterval(rotationIntervalRef.current);
      }
      return;
    }

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

    // Remove messages off screen
    const removeTimeout = window.setTimeout(() => {
      setVisibleMessages((prev) => prev.filter(m => m.position >= -1));
    }, MOVE_DELAY + TRANSITION_MS + 20);

    timeoutsRef.current.push(moveTimeout, removeTimeout);

    currentIndexRef.current = nextIndex;
    setCurrentMessageIndex(nextIndex);
  };

  // Rotation interval with dynamic speed
  useEffect(() => {
    const startRotation = () => {
      if (rotationIntervalRef.current) {
        window.clearInterval(rotationIntervalRef.current);
      }
      rotationIntervalRef.current = window.setInterval(rotate, getRotationSpeed());
    };

    startRotation();

    return () => {
      if (rotationIntervalRef.current) {
        window.clearInterval(rotationIntervalRef.current);
      }
      timeoutsRef.current.forEach((t) => window.clearTimeout(t));
      timeoutsRef.current = [];
    };
  }, []);

  // Update rotation speed when CV completes
  useEffect(() => {
    if (cvCompletedRef.current) {
      if (rotationIntervalRef.current) {
        window.clearInterval(rotationIntervalRef.current);
      }
      rotationIntervalRef.current = window.setInterval(rotate, getRotationSpeed());
    }
  }, [cvCompletedRef.current]);

  // Mock polling (replace with your actual API call)
  useEffect(() => {
    const pollInterval = window.setInterval(async () => {
      if (hasClosedRef.current) return;
      
      const now = Date.now();
      const start = startTimeRef.current ?? now;
      const elapsed = now - start;

      if (elapsed > maxDurationMs) {
        setForceComplete(true);
        hasClosedRef.current = true;
        // alert("Error fetching CV. Please try again.");
        onClose();
        return;
      }

      // Simulate CV completion after 8 seconds for demo
      if (elapsed > 8000 && !cvCompletedRef.current) {
        cvCompletedRef.current = true;
        setForceComplete(true);
      }
    }, checkIntervalMs);

    return () => window.clearInterval(pollInterval);
  }, [maxDurationMs, checkIntervalMs, onClose]);

  // Close popup only after all messages are shown AND CV is complete
  useEffect(() => {
    if (allMessagesShown && cvCompletedRef.current) {
      // Wait a bit after last message, then close
      const closeTimeout = window.setTimeout(() => {
        onClose();
      }, 2000);

      return () => window.clearTimeout(closeTimeout);
    }
  }, [allMessagesShown, onClose]);

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50">
      <div className="relative bg-white/95 backdrop-blur-sm p-8 rounded-2xl w-[650px] max-w-full shadow-2xl border border-white/20">
        
        <div className="flex flex-row gap-6 w-full">
          
          {/* Left Column: Loader */}
          <div className="w-1/2 flex flex-col items-center justify-center h-60">
            <WaterFillLoader 
              forceComplete={forceComplete}
              messageCount={messages.length}
              currentMessageIndex={currentMessageIndex}
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
                  <div className="min-w-8 min-h-8 rounded border bg-white flex items-center justify-center text-center">
                    <Loader className="w-4 h-4 text-blue-500 animate-spin" />
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
          <p className="text-gray-600 font-semibold text-base">
            {allMessagesShown ? "Finalizing..." : `${isInitial ? "Parsing your CV" : "Finding most suitable jobs"}... Please wait.`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CVParsingPopup;