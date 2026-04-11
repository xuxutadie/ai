import { useState, useEffect } from 'react';
import Background from './components/Background';
import Auth from './components/Auth';
import Selection from './components/Selection';
import Quiz from './components/Quiz';
import Result from './components/Result';
import AdminPanel from './components/AdminPanel';
import { AuthStatus, Question } from './types';

type Screen = 'auth' | 'selection' | 'quiz' | 'result' | 'admin';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('auth');
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<'primary' | 'junior' | null>(null);
  const [track, setTrack] = useState<'track1' | 'track2' | null>(null);
  const [score, setScore] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [questionResults, setQuestionResults] = useState<{
    question: Question;
    userAnswer: string[];
    earnedPoints: number;
    maxPoints: number;
    isCorrect: boolean;
  }[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('ai_quiz_auth');
    if (saved) {
      setAuthStatus(JSON.parse(saved));
      setCurrentScreen('selection');
    }
  }, []);

  const handleAuthSuccess = (status: AuthStatus) => {
    setAuthStatus(status);
    localStorage.setItem('ai_quiz_auth', JSON.stringify(status));
    
    if (status.type === 'ADMIN') {
      setCurrentScreen('admin');
      return;
    }
    
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

  const handleFinishQuiz = (finalScore: number, total: number, results?: {
    question: Question;
    userAnswer: string[];
    earnedPoints: number;
    maxPoints: number;
    isCorrect: boolean;
  }[]) => {
    setScore(finalScore);
    setTotalQuestions(total);
    if (results) {
      setQuestionResults(results);
    }
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
      
      {/* 全局 Logo 区域 */}
      <div className="absolute top-4 left-4 md:top-8 md:left-8 z-50">
        <img 
          src="/LOGO.png" 
          alt="LOGO" 
          className="h-10 md:h-12 w-auto object-contain drop-shadow-lg"
          onError={(e) => {
            // 如果找不到图片，可以显示一段默认文字或者隐藏
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            if (target.nextElementSibling) {
              (target.nextElementSibling as HTMLElement).style.display = 'block';
            }
          }}
        />
        <div className="hidden text-white/90 font-black text-2xl tracking-widest drop-shadow-md">
          LOGO
        </div>
      </div>

      {/* 左侧装饰图片 (仅在授权页显示) */}
      {currentScreen === 'auth' && (
        <div className="hidden md:flex absolute left-4 md:left-8 lg:left-12 top-24 bottom-12 z-0 w-[250px] lg:w-[350px] xl:w-[450px] pointer-events-none items-center justify-start animate-[fadeIn_1s_ease-out] opacity-30">
          <img 
            src="/zuo.png" 
            alt="Decoration" 
            className="w-full h-full object-contain object-left drop-shadow-2xl"
          />
        </div>
      )}

      {/* 右侧赛事列表 (仅在授权页显示) */}
      {currentScreen === 'auth' && (
        <div className="hidden lg:flex absolute right-4 lg:right-12 top-1/2 -translate-y-1/2 z-10 w-[300px] xl:w-[350px] flex-col gap-3 animate-[fadeIn_1s_ease-out_0.3s_both] opacity-0">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 shadow-2xl">
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
              <span className="w-1.5 h-4 bg-blue-400 rounded-full"></span>
              2026 AI 相关赛事
            </h3>
            <div className="flex flex-col gap-2.5 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {[
                "全国青少年人工智能大赛",
                "全国青少年心理成长知识与应用创新大赛",
                "全球发明大会(中国)竞赛活动官网",
                "全国青少年人工智能辅助生成数字艺术创作者大赛",
                "全国青少年红色文化传承与实践创新大赛",
                "全国青少年人工智能创新挑战赛",
                "中国宋庆龄基金会少年儿童发明奖",
                "全国青少年劳动技能与智能设计大赛",
                "全国青少年安全与应急科普创新大赛",
                "全国青少年信息素养大赛"
              ].map((item, index) => (
                <button
                  key={index}
                  className="text-left w-full text-sm text-blue-100/80 hover:text-white bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/20 rounded-xl px-4 py-3 transition-all duration-300 group relative overflow-hidden"
                >
                  <span className="relative z-10 line-clamp-2 leading-snug">{item}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 w-full max-w-4xl h-full max-h-[900px] flex flex-col p-4 md:p-8">
        {currentScreen === 'auth' && <Auth onAuthSuccess={handleAuthSuccess} />}
        {currentScreen === 'selection' && (
          <Selection 
            authStatus={authStatus!} 
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
        {currentScreen === 'result' && <Result score={score} total={totalQuestions} questionResults={questionResults} onRetry={() => setCurrentScreen('selection')} />}
        {currentScreen === 'admin' && <AdminPanel onExit={() => setCurrentScreen('selection')} />}
      </div>
    </div>
  );
}
