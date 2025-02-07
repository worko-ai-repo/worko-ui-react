export interface Question {
    id: string;
    text: string;
    guide: string;
    category: string;
    duration?: number;
  }
  
  export interface Recording {
    questionId: string;
    blob: Blob;
    duration: number;
    timestamp: number;
  }
  
  export interface InterviewSession {
    id: string;
    recordings: Recording[];
    currentQuestionIndex: number;
    startTime: number;
    endTime?: number;
  }