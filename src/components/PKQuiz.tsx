import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle2, XCircle, Loader2, Trophy, ArrowLeft, ArrowRight, Zap, Target, Hourglass } from 'lucide-react';
import { Question } from '../types';
import questionsData from '../data/questions.json';
import { scoreWithAI } from '../services/aiScoring';

// 动画配置
const FEEDBACK_DURATION = 500;
const FEEDBACK_DURATION_WRONG = 1000;

// PK赛配置
const PK_CONFIG = {
  junior: { totalTime: 20 * 60, title: '初中组 PK 赛' },
  primary: { totalTime: 30 * 60, title: '小学组 PK 赛' },
  fillTime: 60, // 填空题 1 分钟
  shortTime: 5 * 60, // 简答题 5 分钟
};

// 辅助函数：Fisher-Yates 洗牌算法
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function PKQuiz({ 
  group, 
  onFinish, 
  onExit 
}: { 
  group: 'primary' | 'junior';
  onFinish: (winner: 'left' | 'right' | 'draw', scores: { left: number, right: number }) => void;
  onExit: () => void;
}) {
  const config = PK_CONFIG[group];
  
  // 基础状态
  const [leftQuestions, setLeftQuestions] = useState<Question[]>([]);
  const [rightQuestions, setRightQuestions] = useState<Question[]>([]);
  const [leftIndex, setLeftIndex] = useState(0);
  const [rightIndex, setRightIndex] = useState(0);
  const [leftScore, setLeftScore] = useState(0);
  const [rightScore, setRightScore] = useState(0);
  
  // 计时状态
  const [leftTime, setLeftTime] = useState(config.totalTime);
  const [rightTime, setRightTime] = useState(config.totalTime);
  
  // 答题状态
  const [leftAnswers, setLeftAnswers] = useState<string[]>([]);
  const [rightAnswers, setRightAnswers] = useState<string[]>([]);
  const [leftFeedback, setLeftFeedback] = useState<'correct' | 'wrong' | 'partial' | null>(null);
  const [rightFeedback, setRightFeedback] = useState<'correct' | 'wrong' | 'partial' | null>(null);
  const [leftIsAiScoring, setLeftIsAiScoring] = useState(false);
  const [rightIsAiScoring, setRightIsAiScoring] = useState(false);
  const [leftQTimeLeft, setLeftQTimeLeft] = useState<number | null>(null);
  const [rightQTimeLeft, setRightQTimeLeft] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  // 初始化题目
  useEffect(() => {
    const pool = (questionsData as Question[]).filter(q => 
      (group === 'primary' && q.group === 'primary') ||
      (group === 'junior' && q.group === 'junior')
    );

    // 辅助函数：基于题目内容去重
    const cleanContent = (text: string) => text.trim().replace(/\s+/g, '');

    const getUniqueSet = (existingTexts: Set<string> = new Set()) => {
      const getRand = (type: string, count: number) => {
        const typePool = pool.filter(q => q.type === type && !existingTexts.has(cleanContent(q.question)));
        return shuffle(typePool).slice(0, count);
      };

      const single = getRand('single', 10);
      const multi = getRand('multiple', 10);
      const bool = getRand('boolean', 10);
      const fill = getRand('fill_in_the_blanks', 10);
      const short = getRand('short_answer', 2);
      
      const set = [...single, ...multi, ...bool, ...fill, ...short];
      set.forEach(q => {
        if (q.type === 'short_answer') q.points = 10;
        else q.points = 2;
      });
      return set;
    };

    const leftSet = getUniqueSet();
    const leftTexts = new Set(leftSet.map(q => cleanContent(q.question)));
    const rightSet = getUniqueSet(leftTexts);

    setLeftQuestions(leftSet);
    setRightQuestions(rightSet);
    setIsLoading(false);
  }, [group]);

  // 阻塞状态判断
  const leftCurrentQ = leftQuestions[leftIndex];
  const rightCurrentQ = rightQuestions[rightIndex];
  
  const leftIsBlocking = leftCurrentQ && (leftCurrentQ.type === 'fill_in_the_blanks' || leftCurrentQ.type === 'short_answer') && !leftFeedback;
  const rightIsBlocking = rightCurrentQ && (rightCurrentQ.type === 'fill_in_the_blanks' || rightCurrentQ.type === 'short_answer') && !rightFeedback;

  // 核心计时逻辑
  useEffect(() => {
    if (isLoading) return;

    const timer = setInterval(() => {
      // 1. 处理左侧计时
      if (leftIndex < leftQuestions.length) {
        if (leftQTimeLeft !== null) {
          // 专项计时中
          setLeftQTimeLeft(prev => {
            if (prev !== null && prev <= 1) {
              handleConfirm('left'); // 强制提交
              return null;
            }
            return prev !== null ? prev - 1 : null;
          });
        } else if (!rightIsBlocking && !leftFeedback) {
          // 正常计时（未被对手阻塞，且自身未在反馈停留）
          setLeftTime(prev => (prev <= 1 ? 0 : prev - 1));
        }
      }

      // 2. 处理右侧计时
      if (rightIndex < rightQuestions.length) {
        if (rightQTimeLeft !== null) {
          setRightQTimeLeft(prev => {
            if (prev !== null && prev <= 1) {
              handleConfirm('right');
              return null;
            }
            return prev !== null ? prev - 1 : null;
          });
        } else if (!leftIsBlocking && !rightFeedback) {
          setRightTime(prev => (prev <= 1 ? 0 : prev - 1));
        }
      }

      // 检查结束
      if ((leftTime <= 0 || leftIndex >= leftQuestions.length) && (rightTime <= 0 || rightIndex >= rightQuestions.length)) {
        handlePKFinish();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isLoading, leftIndex, rightIndex, leftIsBlocking, rightIsBlocking, leftFeedback, rightFeedback, leftQTimeLeft, rightQTimeLeft, leftQuestions.length, rightQuestions.length]);

  // 专项限时初始化
  useEffect(() => {
    if (leftCurrentQ?.type === 'fill_in_the_blanks') setLeftQTimeLeft(PK_CONFIG.fillTime);
    else if (leftCurrentQ?.type === 'short_answer') setLeftQTimeLeft(PK_CONFIG.shortTime);
    else setLeftQTimeLeft(null);
  }, [leftIndex, leftCurrentQ]);

  useEffect(() => {
    if (rightCurrentQ?.type === 'fill_in_the_blanks') setRightQTimeLeft(PK_CONFIG.fillTime);
    else if (rightCurrentQ?.type === 'short_answer') setRightQTimeLeft(PK_CONFIG.shortTime);
    else setRightQTimeLeft(null);
  }, [rightIndex, rightCurrentQ]);

  const handlePKFinish = () => {
    let winner: 'left' | 'right' | 'draw' = 'draw';
    if (leftScore > rightScore) winner = 'left';
    else if (rightScore > leftScore) winner = 'right';
    onFinish(winner, { left: leftScore, right: rightScore });
  };

  const handleConfirm = async (side: 'left' | 'right') => {
    const isLeft = side === 'left';
    const q = isLeft ? leftCurrentQ : rightCurrentQ;
    const answers = isLeft ? leftAnswers : rightAnswers;
    const setScore = isLeft ? setLeftScore : setRightScore;
    const setFeedback = isLeft ? setLeftFeedback : setRightFeedback;
    const setIndex = isLeft ? setLeftIndex : setRightIndex;
    const setAnswers = isLeft ? setLeftAnswers : setRightAnswers;
    const setIsAiScoring = isLeft ? setLeftIsAiScoring : setRightIsAiScoring;

    if (!q) return;

    let isCorrect = false;
    let earnedPoints = 0;
    const answerText = answers[0] || '';

    if (q.type === 'single' || q.type === 'boolean') {
      isCorrect = answers[0] === q.answer;
      earnedPoints = isCorrect ? q.points : 0;
    } else if (q.type === 'multiple') {
      const correct = q.answer as string[];
      isCorrect = answers.length === correct.length && answers.every(a => correct.includes(a));
      earnedPoints = isCorrect ? q.points : 0;
    } else if (q.type === 'fill_in_the_blanks') {
      const normalizeText = (text: string) => {
        return text.toLowerCase()
          .replace(/[^\u4e00-\u9fa5a-z0-9]/g, '')
          .trim();
      };
      const userNorm = normalizeText(answerText);
      const correctNorm = normalizeText(String(q.answer));
      
      isCorrect = userNorm === correctNorm;
      if (!isCorrect) {
        // 检查备选答案
        const possibleAnswers = String(q.answer).split(/[或\/|,，]/).map(a => normalizeText(a)).filter(a => a.length > 0);
        isCorrect = possibleAnswers.some(a => a === userNorm);
      }
      earnedPoints = isCorrect ? q.points : 0;
    } else if (q.type === 'short_answer') {
      setIsAiScoring(true);
      try {
        const res = await scoreWithAI(q.question, q.answer as string, answerText, q.points);
        earnedPoints = res.score;
        isCorrect = earnedPoints >= q.points * 0.6;
      } catch { earnedPoints = 0; }
      setIsAiScoring(false);
    }

    setScore(prev => prev + earnedPoints);
    setFeedback(isCorrect ? 'correct' : 'wrong');

    setTimeout(() => {
      setFeedback(null);
      setAnswers([]);
      setIndex(prev => prev + 1);
    }, earnedPoints > 0 ? FEEDBACK_DURATION : FEEDBACK_DURATION_WRONG);
  };

  if (isLoading) return <div className="flex items-center justify-center h-full text-white">正在初始化 PK 赛场...</div>;

  return (
    <div className="flex flex-col w-full h-full max-w-7xl mx-auto">
      {/* 顶部状态栏 */}
      <div className="flex justify-between items-center mb-6 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
        <div className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${!rightIsBlocking ? 'border-blue-400 bg-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-transparent'}`}>
          <span className="text-blue-400 font-black text-sm uppercase mb-1">Player 1 (Left)</span>
          <div className="flex items-center gap-4">
            <span className="text-3xl font-mono text-white">{Math.floor(leftTime/60)}:{(leftTime%60).toString().padStart(2,'0')}</span>
            <div className="h-8 w-px bg-white/20"></div>
            <span className="text-3xl font-black text-blue-400">{leftScore}</span>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-yellow-400 animate-bounce" />
            <h2 className="text-2xl font-black text-white tracking-widest">{config.title}</h2>
          </div>
          <div className="flex gap-4">
            {leftQTimeLeft !== null && (
              <div className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 rounded-full text-blue-400 text-xs font-bold flex items-center gap-1">
                <Hourglass size={14} className="animate-spin" /> P1 限时: {leftQTimeLeft}s
              </div>
            )}
            {rightQTimeLeft !== null && (
              <div className="px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full text-red-400 text-xs font-bold flex items-center gap-1">
                <Hourglass size={14} className="animate-spin" /> P2 限时: {rightQTimeLeft}s
              </div>
            )}
          </div>
        </div>

        <div className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${!leftIsBlocking ? 'border-red-400 bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'border-transparent'}`}>
          <span className="text-red-400 font-black text-sm uppercase mb-1">Player 2 (Right)</span>
          <div className="flex items-center gap-4">
            <span className="text-3xl font-black text-red-400">{rightScore}</span>
            <div className="h-8 w-px bg-white/20"></div>
            <span className="text-3xl font-mono text-white">{Math.floor(rightTime/60)}:{(rightTime%60).toString().padStart(2,'0')}</span>
          </div>
        </div>
      </div>

      {/* 对战区域 */}
      <div className="flex flex-1 gap-6 min-h-0 relative">
        <PKSide 
          side="left"
          index={leftIndex}
          total={leftQuestions.length}
          question={leftCurrentQ} 
          selectedAnswers={leftAnswers}
          onSelect={setLeftAnswers}
          feedback={leftFeedback}
          isAiScoring={leftIsAiScoring}
          isBlocked={rightIsBlocking}
          onConfirm={() => handleConfirm('left')}
        />

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.5)] border-4 border-[#1a1c2e] text-[#1a1c2e] font-black italic">
            VS
          </div>
        </div>

        <PKSide 
          side="right"
          index={rightIndex}
          total={rightQuestions.length}
          question={rightCurrentQ} 
          selectedAnswers={rightAnswers}
          onSelect={setRightAnswers}
          feedback={rightFeedback}
          isAiScoring={rightIsAiScoring}
          isBlocked={leftIsBlocking && !rightIsBlocking}
          onConfirm={() => handleConfirm('right')}
        />
      </div>

      {/* 底部操作 */}
      <div className="mt-6 flex justify-center">
        <button 
          onClick={onExit}
          className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-white/40 text-xs font-bold hover:bg-white/10 hover:text-white transition-all"
        >
          退出 PK 赛
        </button>
      </div>
    </div>
  );
}

function PKSide({ side, index, total, question, selectedAnswers, onSelect, feedback, isAiScoring, isBlocked, onConfirm }: any) {
  if (!question) return <div className="flex-1 glass-panel bg-white/5 border border-white/10 rounded-[32px] flex items-center justify-center text-white/20">已完成所有题目</div>;

  return (
    <div className={`flex-1 flex flex-col transition-all duration-300 relative ${isBlocked ? 'opacity-40 grayscale scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
      {isBlocked && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[2px] rounded-[32px]">
          <div className="bg-black/60 px-6 py-3 rounded-full border border-white/20 text-white font-bold animate-pulse flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            等待对手完成挑战...
          </div>
        </div>
      )}

      <div className={`flex-1 glass-panel bg-white/5 border-2 ${side === 'left' ? 'border-blue-500/30' : 'border-red-500/30'} rounded-[32px] p-6 flex flex-col relative overflow-hidden`}>
        <div className={`absolute top-0 ${side === 'left' ? 'left-0' : 'right-0'} p-4 opacity-10`}>
          {side === 'left' ? <ArrowLeft size={80} /> : <ArrowRight size={80} />}
        </div>

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-lg text-xs font-bold ${side === 'left' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'}`}>
                {question.type === 'single' ? '单选题' : question.type === 'multiple' ? '多选题' : question.type === 'boolean' ? '判断题' : question.type === 'fill_in_the_blanks' ? '填空题' : '简答题'}
              </span>
              <span className="text-white/40 text-xs font-bold">PTS: {question.points}</span>
            </div>
            <div className="text-white/40 text-xs font-mono font-bold">
              PROGRESS: {index + 1}/{total}
            </div>
          </div>

          <h3 className="text-xl font-bold text-white mb-6 leading-relaxed line-clamp-3">
            {question.question}
          </h3>

          <div className="flex-1 flex flex-col gap-2.5">
            {(question.type === 'single' || question.type === 'multiple' || question.type === 'boolean') && (
              <>
                {(question.options ? Object.entries(question.options) : [['对', '正确'], ['错', '错误']]).map(([key, val]: any) => {
                  const isSelected = selectedAnswers.includes(key);
                  const isCorrect = Array.isArray(question.answer) ? question.answer.includes(key) : question.answer === key;
                  
                  let borderClass = 'border-white/10 bg-white/5';
                  if (feedback) {
                    if (isCorrect) borderClass = 'border-emerald-500 bg-emerald-500/20';
                    else if (isSelected) borderClass = 'border-red-500 bg-red-500/20';
                  } else if (isSelected) {
                    borderClass = side === 'left' ? 'border-blue-500 bg-blue-500/20' : 'border-red-500 bg-red-500/20';
                  }

                  return (
                    <button
                      key={key}
                      onClick={() => {
                        if (feedback) return;
                        if (question.type === 'multiple') {
                          onSelect((prev: any) => isSelected ? prev.filter((k: any) => k !== key) : [...prev, key]);
                        } else {
                          onSelect([key]);
                        }
                      }}
                      className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all flex items-center gap-4 ${borderClass}`}
                    >
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black shrink-0 ${isSelected ? 'bg-white text-black' : 'bg-white/10 text-white/60'}`}>
                        {key}
                      </span>
                      <span className="text-white text-sm font-medium leading-snug">{val}</span>
                    </button>
                  );
                })}
              </>
            )}

            {(question.type === 'fill_in_the_blanks' || question.type === 'short_answer') && (
              <div className="flex flex-col h-full gap-3">
                <textarea 
                  key={question.id}
                  value={selectedAnswers[0] || ''}
                  onChange={(e) => onSelect([e.target.value])}
                  disabled={!!feedback}
                  placeholder="在此输入你的回答..."
                  className="flex-1 w-full bg-black/20 border-2 border-white/10 rounded-2xl p-4 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/30 resize-none"
                />
                {feedback && (
                  <div className={`p-3 rounded-xl border-2 ${feedback === 'correct' ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400' : 'border-red-500 bg-red-500/20 text-red-400'}`}>
                    <div className="text-[10px] uppercase font-black mb-1">参考答案:</div>
                    <div className="font-bold text-sm">{Array.isArray(question.answer) ? question.answer.join(', ') : question.answer}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          <button 
            onClick={onConfirm}
            disabled={isAiScoring || feedback || (selectedAnswers.length === 0 && question.type !== 'short_answer' && question.type !== 'fill_in_the_blanks')}
            className={`mt-4 w-full py-3 rounded-xl font-black text-sm shadow-lg transition-all ${
              side === 'left' ? 'bg-blue-600 shadow-blue-500/30' : 'bg-red-600 shadow-red-500/30'
            } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isAiScoring ? 'AI 评分中...' : feedback ? '准备下一题...' : '提交回答'}
          </button>
        </div>
      </div>
    </div>
  );
}

