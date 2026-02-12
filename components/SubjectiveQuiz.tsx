
import React, { useState, useEffect, useRef } from 'react';
import { SubjectiveQuestion, QuizResult } from '../types';
import { evaluateSubjectiveAnswer } from '../geminiService';

interface SubjectiveQuizProps {
  questions: SubjectiveQuestion[];
  onComplete: (results: QuizResult['subjectiveResults']) => void;
}

const SubjectiveQuiz: React.FC<SubjectiveQuizProps> = ({ questions, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<{ score: number; feedback: string } | null>(null);
  const [results, setResults] = useState<QuizResult['subjectiveResults']>([]);
  
  const recognitionRef = useRef<any>(null);
  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            setTranscript(prev => prev + event.results[i][0].transcript);
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setTranscript('');
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!transcript) return;
    setIsEvaluating(true);
    try {
      const evaluation = await evaluateSubjectiveAnswer(
        currentQuestion.question,
        currentQuestion.modelAnswer,
        transcript
      );

      setCurrentEvaluation(evaluation);
      
      const newResult = {
        questionId: currentQuestion.id,
        transcript,
        score: evaluation.score,
        feedback: evaluation.feedback
      };

      setResults(prev => [...prev, newResult]);
      setIsEvaluating(false);
    } catch (err) {
      alert("Error evaluating answer. Please try again.");
      setIsEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setTranscript('');
      setCurrentEvaluation(null);
    } else {
      onComplete(results);
    }
  };

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="w-full bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-8">
        <span className="text-sm font-bold text-emerald-600 uppercase tracking-wider">Part 2: Subjective (Speak Answer)</span>
        <span className="text-sm font-medium text-gray-400">{currentIndex + 1} of {questions.length}</span>
      </div>

      <div className="w-full h-1.5 bg-gray-100 rounded-full mb-10 overflow-hidden">
        <div 
          className="h-full bg-emerald-500 transition-all duration-500 ease-out" 
          style={{ width: `${progress}%` }}
        />
      </div>

      <h3 className="text-2xl font-bold text-gray-800 mb-6 leading-snug">
        {currentQuestion.question}
      </h3>

      {!currentEvaluation ? (
        <>
          <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100 italic text-gray-600">
            <p className="font-semibold text-gray-400 text-xs uppercase mb-2">Instructions</p>
            Explain your answer as clearly as possible. Press the microphone and speak your response.
          </div>

          <div className="flex flex-col items-center gap-6 mb-10">
            <button
              onClick={toggleRecording}
              disabled={isEvaluating}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                isRecording 
                  ? 'bg-red-100 text-red-600 animate-pulse scale-110 shadow-lg shadow-red-100' 
                  : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
              }`}
            >
              {isRecording ? (
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              ) : (
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </button>
            <p className={`text-sm font-bold tracking-wide ${isRecording ? 'text-red-500' : 'text-gray-400'}`}>
              {isRecording ? 'RECORDING YOUR ANSWER...' : 'TAP TO START SPEAKING'}
            </p>
          </div>

          {transcript && (
            <div className="mb-8 p-6 bg-indigo-50 rounded-2xl border border-indigo-100 text-indigo-900 animate-in fade-in slide-in-from-bottom-2">
              <p className="text-xs font-bold uppercase mb-2 opacity-50 tracking-widest">Transcript</p>
              <p className="leading-relaxed font-medium">"{transcript}"</p>
            </div>
          )}

          <button
            onClick={handleSubmitAnswer}
            disabled={!transcript || isEvaluating || isRecording}
            className={`w-full py-4 rounded-2xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2 ${
              !transcript || isEvaluating || isRecording
                ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-emerald-100'
            }`}
          >
            {isEvaluating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Grading Your Answer...
              </>
            ) : (
              'Check My Answer'
            )}
          </button>
        </>
      ) : (
        <div className="animate-in zoom-in-95 duration-300">
          <div className="bg-white border-2 border-emerald-100 rounded-3xl p-6 mb-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-bold text-gray-800 uppercase tracking-widest text-xs">AI Evaluation Result</h4>
              <div className="px-4 py-2 bg-emerald-50 rounded-xl">
                <span className="text-2xl font-black text-emerald-600">{currentEvaluation.score}%</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-2xl">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Your Answer Transcript</p>
                <p className="text-gray-700 italic">"{transcript}"</p>
              </div>
              
              <div className="p-4 bg-indigo-50 rounded-2xl">
                <p className="text-xs font-bold text-indigo-400 uppercase mb-2">Feedback & Tips</p>
                <p className="text-indigo-900 leading-relaxed font-medium">{currentEvaluation.feedback}</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleNextQuestion}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {currentIndex === questions.length - 1 ? 'Finish Exam & See Report' : 'Next Question'}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default SubjectiveQuiz;
