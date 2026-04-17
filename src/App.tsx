import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Background from './components/Background';
import Auth from './components/Auth';
import Selection from './components/Selection';
import Quiz from './components/Quiz';
import PKQuiz from './components/PKQuiz';
import Result from './components/Result';
import AdminPanel from './components/AdminPanel';
import { AuthStatus, Question } from './types';

type Screen = 'auth' | 'selection' | 'quiz' | 'result' | 'admin' | 'pk_quiz';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('auth');
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<'primary' | 'junior' | null>(null);
  const [track, setTrack] = useState<'track1' | 'track2' | 'track3' | 'pk' | null>(null);
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

  const handleStartQuiz = (group: 'primary' | 'junior', selectedTrack: 'track1' | 'track2' | 'track3' | 'pk') => {
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
    
    if (selectedTrack === 'pk') {
      setCurrentScreen('pk_quiz');
    } else {
      setCurrentScreen('quiz');
    }
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

  const handlePKFinish = (winner: 'left' | 'right' | 'draw', scores: { left: number, right: number }) => {
    setScore(winner === 'left' ? scores.left : scores.right); // 临时记录赢家分数用于显示，PK赛有专属结果页更好，这里先复用
    setTotalQuestions(100);
    setCurrentScreen('result');
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
        <div className="hidden md:flex absolute right-4 lg:right-12 top-24 bottom-12 z-10 w-[280px] md:w-[350px] lg:w-[420px] xl:w-[480px] flex-col gap-3 animate-fadeIn [animation-delay:300ms] [animation-fill-mode:both] items-center justify-center">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 shadow-2xl w-full">
            <h3 className="text-white font-bold text-lg mb-4 flex items-center justify-center gap-2 border-b border-white/10 pb-3">
              <span className="w-1.5 h-4 bg-blue-400 rounded-full"></span>
              2020 AI 相关白名单赛事
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
                  className="text-center w-full text-sm text-blue-100/80 hover:text-white bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/20 rounded-xl px-4 py-3 transition-all duration-300 group relative overflow-hidden"
                >
                  <span className="relative z-10 line-clamp-2 leading-snug">{item}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className={`relative z-10 w-full ${currentScreen === 'selection' ? 'max-w-6xl' : 'max-w-4xl'} h-full max-h-[900px] flex flex-col p-4 md:p-8 transition-all duration-500`}>
        {currentScreen === 'auth' && <Auth onAuthSuccess={handleAuthSuccess} />}
        {currentScreen === 'selection' && (
          <Selection 
            authStatus={authStatus!} 
            onStart={handleStartQuiz} 
            onLogout={handleLogout}
            onAdmin={() => setCurrentScreen('admin')}
          />
        )}
        {currentScreen === 'quiz' && selectedGroup && track && track !== 'pk' && (
          <Quiz 
            group={selectedGroup} 
            track={track as 'track1' | 'track2' | 'track3'}
            onFinish={handleFinishQuiz} 
            onExit={() => setCurrentScreen('selection')} 
          />
        )}
        {currentScreen === 'result' && <Result score={score} total={totalQuestions} questionResults={questionResults} onRetry={() => setCurrentScreen('selection')} />}
        {currentScreen === 'admin' && <AdminPanel onExit={() => setCurrentScreen('selection')} />}
      </div>

      {/* PK Quiz Container (FullScreen) */}
      <AnimatePresence>
        {currentScreen === 'pk_quiz' && selectedGroup && (
          <motion.div 
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[100] bg-[#0f111a] p-8 flex items-center justify-center"
          >
            <PKQuiz 
              group={selectedGroup}
              onFinish={handlePKFinish}
              onExit={() => setCurrentScreen('selection')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
