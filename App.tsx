
import React, { useState, useCallback } from 'react';
import { SURVEYS } from './constants';
import { Answer, Survey, Demographics } from './types';
import { getPersonalityInsight } from './services/geminiService';
import Header from './components/Header';
import Footer from './components/Footer';
import QuestionCard from './components/QuestionCard';
import InsightDisplay from './components/InsightDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import Button from './components/Button';
import DemographicsForm from './components/DemographicsForm';

type QuizState = 'selection' | 'demographics' | 'quiz' | 'loading' | 'result' | 'error';

const App: React.FC = () => {
  const [quizState, setQuizState] = useState<QuizState>('selection');
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [demographics, setDemographics] = useState<Demographics | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [personalityInsight, setPersonalityInsight] = useState('');
  const [error, setError] = useState('');

  const handleSelectSurvey = (survey: Survey) => {
    setSelectedSurvey(survey);
    setQuizState('demographics');
  };

  const handleStartQuiz = (data: Demographics) => {
    setDemographics(data);
    setQuizState('quiz');
  };

  const handleAnswerSelect = useCallback((answer: string) => {
    if (!selectedSurvey) return;

    const currentQuestion = selectedSurvey.questions[currentQuestionIndex];
    const newAnswers = [
      ...answers,
      {
        questionId: currentQuestion.id,
        questionText: currentQuestion.text,
        answer: answer,
      },
    ];
    setAnswers(newAnswers);

    if (currentQuestionIndex < selectedSurvey.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizState('loading');
      generateInsight(newAnswers, selectedSurvey.title);
    }
  }, [answers, currentQuestionIndex, selectedSurvey]);

  const generateInsight = async (finalAnswers: Answer[], surveyTitle: string) => {
    try {
      const insight = await getPersonalityInsight(finalAnswers, surveyTitle, demographics);
      setPersonalityInsight(insight);
      setQuizState('result');
    } catch (err) {
      console.error(err);
      setError('Failed to generate your personality insight. Please try again later.');
      setQuizState('error');
    }
  };

  const handleReset = () => {
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setPersonalityInsight('');
    setError('');
    setSelectedSurvey(null);
    setDemographics(null);
    setQuizState('selection');
  };

  const renderContent = () => {
    switch (quizState) {
      case 'selection':
        return (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-2">Choose Your Insight Journey</h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Select a category below to start the quiz and uncover a new perspective on yourself.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {SURVEYS.map(survey => (
                <div
                  key={survey.slug}
                  onClick={() => handleSelectSurvey(survey)}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20 hover:bg-white/20 hover:border-cyan-400 transition-all duration-300 ease-in-out transform hover:-translate-y-2 cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleSelectSurvey(survey)}
                >
                  <h3 className="text-xl font-bold text-cyan-400 mb-2">{survey.title}</h3>
                  <p className="text-gray-300 font-light">{survey.description}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'demographics':
        return (
          <DemographicsForm
            onSubmit={handleStartQuiz}
            onBack={handleReset}
          />
        );
      case 'quiz':
        if (!selectedSurvey) return null;
        return (
          <div>
            <div className="max-w-2xl mx-auto mb-4 flex justify-start">
              <button
                  onClick={handleReset}
                  className="flex items-center text-cyan-400 hover:text-cyan-300 transition-colors duration-200 font-semibold p-2 rounded-lg -ml-2"
                  aria-label="Go back to survey selection"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Back to Selection
              </button>
            </div>
            <QuestionCard
              question={selectedSurvey.questions[currentQuestionIndex]}
              onAnswer={handleAnswerSelect}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={selectedSurvey.questions.length}
            />
          </div>
        );
      case 'loading':
        return <LoadingSpinner />;
      case 'result':
        return <InsightDisplay insight={personalityInsight} onReset={handleReset} />;
      case 'error':
        return (
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold text-red-400 mb-4">An Error Occurred</h2>
            <p className="mb-6">{error}</p>
            <Button onClick={handleReset}>Try Again</Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-4xl mx-auto flex flex-col min-h-[80vh]">
        <Header />
        <main className="flex-grow flex items-center justify-center py-10">
          <div className="w-full">
            {renderContent()}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default App;
