// Context and Interfaces for Mock Interview
import React, { createContext, useContext, useState, useCallback } from 'react';

const MockInterviewContext = createContext<MockInterviewContextType | undefined>(undefined);

type Recording = {
  blob: Blob;
  duration: number;
  timestamp: number;
  questionId: string;
};
type MockInterviewContextType = {
    currentQuestionIndex: number;
    setCurrentQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
    recordings: Recording[];
    setRecordings: React.Dispatch<React.SetStateAction<Recording[]>>;
    isRecording: boolean;
    setIsRecording: React.Dispatch<React.SetStateAction<boolean>>;
    stream: MediaStream | null;
    setStream: React.Dispatch<React.SetStateAction<MediaStream | null>>;
    timer: number;
    setTimer: React.Dispatch<React.SetStateAction<number>>;
    answerTimer: number; // Add answerTimer state
    setAnswerTimer: React.Dispatch<React.SetStateAction<number>>; // For updating answerTimer
    startRecording: (questionId: string) => Promise<void>;
    stopRecording: () => Promise<Recording>;
    speak: (text: string) => Promise<void>;
    cancelSpeech: () => void;
    nextQuestion: () => void; // Function to go to the next question
    endInterview: () => void; // Function to end the interview
    nextTimer: () => void; // Function to increment the timer
  };
  
  export const MockInterviewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [recordings, setRecordings] = useState<Recording[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [timer, setTimer] = useState(0);
    const [answerTimer, setAnswerTimer] = useState(0); // Initialize answerTimer
  
    const startRecording = useCallback(async (questionId: string) => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          setStream(stream);
          setIsRecording(true);
          setTimer(0);
          setAnswerTimer(0);
          // Additional logic to handle recording...
        } catch (err) {
          console.error('Failed to start recording:', err);
        }
      }, []);
      
  
    const stopRecording = useCallback(async (): Promise<Recording> => {
      return new Promise((resolve, reject) => {
        // Logic to stop recording and resolve with the recording data...
      });
    }, []);
  
    const speak = useCallback(async (text: string) => {
      // Logic for speech synthesis...
    }, []);
  
    const cancelSpeech = useCallback(() => {
      window.speechSynthesis.cancel();
    }, []);
  
    const nextQuestion = useCallback(() => {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1); // Move to next question
      setAnswerTimer(0); // Reset answer timer when moving to the next question
    }, []);
  
    const endInterview = useCallback(() => {
      setCurrentQuestionIndex(0); // Reset interview
      setRecordings([]); // Clear recordings
      setIsRecording(false); // Stop recording
      setStream(null); // Stop stream
      setTimer(0); // Reset timer
      setAnswerTimer(0); // Reset answer timer
      // Additional logic to end the interview...
    }, []);
  
    const nextTimer = useCallback(() => {
        setAnswerTimer((prev) => prev + 1); // Increment the answerTimer
      }, []);
      
    return (
      <MockInterviewContext.Provider
        value={{
          currentQuestionIndex,
          setCurrentQuestionIndex,
          recordings,
          setRecordings,
          isRecording,
          setIsRecording,
          stream,
          setStream,
          timer,
          setTimer,
          answerTimer,
          setAnswerTimer,
          startRecording,
          stopRecording,
          speak,
          cancelSpeech,
          nextQuestion,
          endInterview,
          nextTimer,
        }}
      >
        {children}
      </MockInterviewContext.Provider>
    );
  };
  
export const useMockInterview = (): MockInterviewContextType => {
  const context = useContext(MockInterviewContext);
  if (!context) {
    throw new Error('useMockInterview must be used within a MockInterviewProvider');
  }
  return context;
};
