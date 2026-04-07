import { useState, useEffect } from 'react';
import Background from './components/Background';
import Auth from './components/Auth';
import Selection from './components/Selection';
import Quiz from './components/Quiz';
import Result from './components/Result';
import AdminPanel from './components/AdminPanel';
import { AuthStatus } from './types';

type Screen = 'auth' | 'selection' | 'quiz' | 'result' | 'admin';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('auth');
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<'primary' | 'junior' | null>(null);
  const [track, setTrack] = useState<'track1' | 'track2' | null>(null);
  const [score, setScore] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);

  useEffect(() => {
    const saved = localStorage.getItem('ai_quiz_auth');
    if (saved) {
      setAuthStatus(JSON.parse(saved));
      setCurrentScreen('selection');
    }
  }, []);

  const handleAuthSuccess = (status: AuthStatus) => {
    if (status.type === 'ADMIN') {
      setCurrentScreen('admin');
      return;
    }
    setAuthStatus(status);
    localStorage.setItem('ai_quiz_auth', JSON.stringify(status));
    setCurrentScreen('selection');
  };

  const handleStartQuiz = (group: 'primary' | 'junior', selectedTrack: 'track1' | 'track2') => {
    if (authStatus?.remaining !== undefined && authStatus.remaining <= 0) {
      alert('您的能量已耗尽，请重新激活！');
      setCurrentScreen('auth');
      return;
    }
    setSelectedGroup(group);
    setTrack(selectedTrack);
    if (authStatus && authStatus.type === 'PAID_5') {
      const newStatus = { ...authStatus, remaining: authStatus.remaining - 1 };
      setAuthStatus(newStatus);
      localStorage.setItem('ai_quiz_auth', JSON.stringify(newStatus));
    }
    setCurrentScreen('quiz');
  };

  const handleFinishQuiz = (finalScore: number, total: number) => {
    setScore(finalScore);
    setTotalQuestions(total);
    setCurrentScreen('result');
  };

  const handleLogout = () => {
    localStorage.removeItem('ai_quiz_auth');
    setAuthStatus(null);
    setCurrentScreen('auth');
  };

  return (
    <div className="relative w-full h-screen overflow-hidden flex items-center justify-center">
      <Background />
      
      <div className="relative z-10 w-full max-w-4xl h-full max-h-[900px] flex flex-col p-4 md:p-8">
        {currentScreen === 'auth' && <Auth onAuthSuccess={handleAuthSuccess} />}
        {currentScreen === 'selection' && (
          <Selection 
            authStatus={authStatus} 
            onStart={handleStartQuiz} 
            onLogout={handleLogout}
            onAdmin={() => setCurrentScreen('admin')}
          />
        )}
        {currentScreen === 'quiz' && selectedGroup && track && (
          <Quiz 
            group={selectedGroup} 
            track={track}
            onFinish={handleFinishQuiz} 
            onExit={() => setCurrentScreen('selection')} 
          />
        )}
        {currentScreen === 'result' && <Result score={score} total={totalQuestions} onRetry={() => setCurrentScreen('selection')} />}
        {currentScreen === 'admin' && <AdminPanel onExit={() => setCurrentScreen('auth')} />}
      </div>
    </div>
  );
}
