
import React from 'react';
import { ExamData, QuizResult } from '../types';

interface ResultsViewProps {
  examData: ExamData;
  results: QuizResult;
  onReset: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ examData, results, onReset }) => {
  const correctMCQs = results.mcqResults.filter(r => r.isCorrect).length;
  const mcqScore = examData.mcqs.length > 0 ? (correctMCQs / examData.mcqs.length) * 100 : 0;
  
  const avgSubjectiveScore = results.subjectiveResults.length > 0 
    ? results.subjectiveResults.reduce((acc, curr) => acc + curr.score, 0) / results.subjectiveResults.length 
    : 0;

  const overallPerformance = (mcqScore + avgSubjectiveScore) / ( (examData.mcqs.length > 0 ? 1 : 0) + (examData.subjective.length > 0 ? 1 : 0) );

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-700">
      <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 text-center">
        <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl font-black text-indigo-600">{Math.round(overallPerformance)}%</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Practice Complete!</h2>
        <p className="text-gray-500 max-w-sm mx-auto">
          Great job! Here is a detailed breakdown of your performance on "{examData.title}".
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {examData.mcqs.length > 0 && (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              MCQ Score
            </h3>
            <div className="flex items-end justify-between mb-4">
              <span className="text-4xl font-black text-gray-800">{correctMCQs}/{examData.mcqs.length}</span>
              <span className="text-sm font-bold text-gray-400 uppercase">Correct</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500" 
                style={{ width: `${mcqScore}%` }} 
              />
            </div>
          </div>
        )}

        {examData.subjective.length > 0 && (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </span>
              Spoken Answers
            </h3>
            <div className="flex items-end justify-between mb-4">
              <span className="text-4xl font-black text-gray-800">{Math.round(avgSubjectiveScore)}%</span>
              <span className="text-sm font-bold text-gray-400 uppercase">Accuracy</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500" 
                style={{ width: `${avgSubjectiveScore}%` }} 
              />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-800 px-2">Detailed Analysis</h3>
        
        {results.mcqResults.map((res, i) => {
          const q = examData.mcqs.find(m => m.id === res.questionId);
          return (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex gap-4">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${res.isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {res.isCorrect ? '✓' : '✕'}
              </div>
              <div>
                <p className="font-bold text-gray-800 mb-2">{q?.question}</p>
                <div className="flex gap-4 text-sm">
                  <span className="text-gray-500">Your answer: <span className={res.isCorrect ? 'text-green-600' : 'text-red-600'}>{res.selectedAnswer}</span></span>
                  {!res.isCorrect && <span className="text-gray-500">Correct: <span className="text-green-600 font-bold">{q?.correctAnswer}</span></span>}
                </div>
              </div>
            </div>
          );
        })}

        {results.subjectiveResults.map((res, i) => {
          const q = examData.subjective.find(s => s.id === res.questionId);
          return (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <p className="font-bold text-gray-800">{q?.question}</p>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${res.score > 70 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                  Score: {res.score}
                </span>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2">What you said</p>
                  <p className="text-sm text-gray-700 italic">"{res.transcript}"</p>
                </div>
                <div className="p-4 bg-indigo-50 rounded-xl">
                  <p className="text-xs font-bold text-indigo-400 uppercase mb-2">AI Feedback</p>
                  <p className="text-sm text-indigo-900 font-medium">{res.feedback}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={onReset}
        className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
      >
        Try Another Paper
      </button>
    </div>
  );
};

export default ResultsView;
