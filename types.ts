
export interface MCQ {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface SubjectiveQuestion {
  id: string;
  question: string;
  keyPoints: string[];
  modelAnswer: string;
}

export interface ExamData {
  title: string;
  mcqs: MCQ[];
  subjective: SubjectiveQuestion[];
}

export interface QuizResult {
  mcqResults: {
    questionId: string;
    selectedAnswer: string;
    isCorrect: boolean;
  }[];
  subjectiveResults: {
    questionId: string;
    transcript: string;
    score: number; // 0-100
    feedback: string;
  }[];
}

export enum AppState {
  UPLOAD = 'UPLOAD',
  ANALYZING = 'ANALYZING',
  QUIZ_MCQ = 'QUIZ_MCQ',
  MCQ_INTERMEDIATE = 'MCQ_INTERMEDIATE',
  QUIZ_SUBJECTIVE = 'QUIZ_SUBJECTIVE',
  RESULTS = 'RESULTS'
}
