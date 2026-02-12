
import React, { useState } from 'react';
import { AppState, ExamData, QuizResult } from './types';
import { analyzeExamFile, evaluateSubjectiveAnswer } from './geminiService';
import FileUpload from './components/FileUpload';
import MCQQuiz from './components/MCQQuiz';
import SubjectiveQuiz from './components/SubjectiveQuiz';
import ResultsView from './components/ResultsView';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.UPLOAD);
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [results, setResults] = useState<QuizResult>({ mcqResults: [], subjectiveResults: [] });
  const [loadingMsg, setLoadingMsg] = useState('');

  const handleFileUpload = async (base64: string, mimeType: string) => {
    setState(AppState.ANALYZING);
    setLoadingMsg("AI is reading your paper... Please wait.");
    try {
      const data = await analyzeExamFile(base64, mimeType);
      setExamData(data);
      if (data.mcqs.length > 0) {
        setState(AppState.QUIZ_MCQ);
      } else if (data.subjective.length > 0) {
        setState(AppState.QUIZ_SUBJECTIVE);
      } else {
        alert("No questions found in this file.");
        setState(AppState.UPLOAD);
      }
    } catch (err) {
      alert("Error analyzing file. Please try again.");
      setState(AppState.UPLOAD);
    }
  };

  const handleMCQComplete = (mcqResults: QuizResult['mcqResults']) => {
    setResults(prev => ({ ...prev, mcqResults }));
    setState(AppState.MCQ_INTERMEDIATE);
  };

  const proceedToSubjective = () => {
    if (examData && examData.subjective.length > 0) {
      setState(AppState.QUIZ_SUBJECTIVE);
    } else {
      setState(AppState.RESULTS);
    }
  };

  const handleSubjectiveComplete = (subjectiveResults: QuizResult['subjectiveResults']) => {
    setResults(prev => ({ ...prev, subjectiveResults }));
    setState(AppState.RESULTS);
  };

  const resetApp = () => {
    setExamData(null);
    setResults({ mcqResults: [], subjectiveResults: [] });
    setState(AppState.UPLOAD);
  };

  // Helper for intermediate view
  const correctCount = results.mcqResults.filter(r => r.isCorrect).length;
  const totalMCQs = results.mcqResults.length;

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8">
      <header className="w-full max-w-4xl mb-12 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">ExamAI</h1>
        </div>
        {state !== AppState.UPLOAD && state !== AppState.ANALYZING && (
          <button 
            onClick={resetApp}
            className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
          >
            Start New
          </button>
        )}
      </header>

      <main className="w-full max-w-4xl flex-1 flex flex-col items-center justify-center">
        {state === AppState.UPLOAD && (
          <FileUpload onUpload={handleFileUpload} />
        )}

        {state === AppState.ANALYZING && (
          <div className="text-center animate-pulse">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-xl font-medium text-gray-700">{loadingMsg}</p>
          </div>
        )}

        {state === AppState.QUIZ_MCQ && examData && (
          <MCQQuiz 
            mcqs={examData.mcqs} 
            onComplete={handleMCQComplete} 
          />
        )}

        {state === AppState.MCQ_INTERMEDIATE && (
          <div className="w-full bg-white rounded-3xl p-10 shadow-sm border border-gray-100 text-center animate-in zoom-in-95 duration-300">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">MCQ Section Results</h2>
            <div className="flex justify-center gap-8 mb-8">
              <div className="text-center">
                <p className="text-4xl font-black text-emerald-500">{correctCount}</p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Correct</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-black text-red-400">{totalMCQs - correctCount}</p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Incorrect</p>
              </div>
            </div>

            <div className="text-left mb-10 space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              <h3 className="font-bold text-gray-700 mb-2 uppercase tracking-widest text-xs">Question-wise Breakdown</h3>
              {results.mcqResults.map((res, i) => {
                const q = examData?.mcqs.find(m => m.id === res.questionId);
                return (
                  <div key={i} className={`p-4 rounded-2xl border-2 flex items-start gap-4 ${res.isCorrect ? 'border-emerald-50 bg-emerald-50/30' : 'border-red-50 bg-red-50/30'}`}>
                    <div className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${res.isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                      {res.isCorrect ? '✓' : '✕'}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800 mb-1">{q?.question}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                        <span className="text-gray-500">Your choice: <span className={res.isCorrect ? 'text-emerald-600 font-bold' : 'text-red-500 font-bold'}>{res.selectedAnswer}</span></span>
                        {!res.isCorrect && (
                          <span className="text-gray-500">Correct: <span className="text-emerald-600 font-bold">{q?.correctAnswer}</span></span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={proceedToSubjective}
              className="w-full max-w-xs py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
            >
              {examData?.subjective.length ? "Proceed to Subjective Section" : "Finish & Show Final Report"}
            </button>
          </div>
        )}

        {state === AppState.QUIZ_SUBJECTIVE && examData && (
          <SubjectiveQuiz 
            questions={examData.subjective} 
            onComplete={handleSubjectiveComplete} 
          />
        )}

        {state === AppState.RESULTS && examData && (
          <ResultsView 
            examData={examData} 
            results={results} 
            onReset={resetApp} 
          />
        )}
      </main>

      <footer className="mt-12 text-sm text-gray-400">
        Powered by Gemini 3-Pro & Web Speech API
      </footer>
    </div>
  );
};

export default App;
