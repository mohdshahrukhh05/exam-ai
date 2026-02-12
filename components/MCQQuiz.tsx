
import React, { useState } from 'react';
import { MCQ, QuizResult } from '../types';

interface MCQQuizProps {
  mcqs: MCQ[];
  onComplete: (results: QuizResult['mcqResults']) => void;
}

const MCQQuiz: React.FC<MCQQuizProps> = ({ mcqs, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answers, setAnswers] = useState<QuizResult['mcqResults']>([]);

  const currentMCQ = mcqs[currentIndex];

  const handleNext = () => {
    if (selectedOption === null) return;

    const result = {
      questionId: currentMCQ.id,
      selectedAnswer: selectedOption,
      isCorrect: selectedOption.toLowerCase() === currentMCQ.correctAnswer.toLowerCase()
    };

    const newAnswers = [...answers, result];
    
    if (currentIndex < mcqs.length - 1) {
      setAnswers(newAnswers);
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
    } else {
      onComplete(newAnswers);
    }
  };

  const progress = ((currentIndex + 1) / mcqs.length) * 100;

  return (
    <div className="w-full bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <span className="text-sm font-bold text-indigo-600 uppercase tracking-wider">Part 1: Multiple Choice</span>
        <span className="text-sm font-medium text-gray-400">{currentIndex + 1} of {mcqs.length}</span>
      </div>

      <div className="w-full h-1.5 bg-gray-100 rounded-full mb-10 overflow-hidden">
        <div 
          className="h-full bg-indigo-600 transition-all duration-500 ease-out" 
          style={{ width: `${progress}%` }}
        />
      </div>

      <h3 className="text-2xl font-bold text-gray-800 mb-8 leading-snug">
        {currentMCQ.question}
      </h3>

      <div className="space-y-4 mb-10">
        {currentMCQ.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedOption(option)}
            className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center gap-4 group ${
              selectedOption === option 
                ? 'border-indigo-600 bg-indigo-50 shadow-sm' 
                : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50'
            }`}
          >
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
              selectedOption === option ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
            }`}>
              {selectedOption === option && (
                <div className="w-2 h-2 bg-white rounded-full" />
              )}
            </div>
            <span className={`font-medium ${selectedOption === option ? 'text-indigo-900' : 'text-gray-700'}`}>
              {option}
            </span>
          </button>
        ))}
      </div>

      <button
        onClick={handleNext}
        disabled={selectedOption === null}
        className={`w-full py-4 rounded-2xl font-bold text-white transition-all shadow-lg ${
          selectedOption === null 
            ? 'bg-gray-300 cursor-not-allowed shadow-none' 
            : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-indigo-100'
        }`}
      >
        {currentIndex === mcqs.length - 1 ? 'Finish MCQs' : 'Next Question'}
      </button>
    </div>
  );
};

export default MCQQuiz;
