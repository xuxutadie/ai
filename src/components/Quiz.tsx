import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { Question } from '../types';
import questionsData from '../data/questions.json';

function calculateFillInBlanksScore(userAnswer: string, correctAnswer: string, maxPoints: number): number {
  if (!userAnswer.trim()) return 0;
  
  const normalizeText = (text: string) => {
    return text.toLowerCase()
      .replace(/[^\u4e00-\u9fa5a-z0-9]/g, '')
      .trim();
  };
  
  const userNorm = normalizeText(userAnswer);
  const correctNorm = normalizeText(correctAnswer);
  
  // 填空题使用精确匹配
  if (userNorm === correctNorm) {
    return maxPoints;
  }
  
  // 如果答案包含多个选项（用"或"、"/"、","分隔），检查是否匹配任一选项
  const possibleAnswers = correctAnswer.split(/[或\/|,，]/).map(a => normalizeText(a)).filter(a => a.length > 0);
  for (const possible of possibleAnswers) {
    if (userNorm === possible) {
      return maxPoints;
    }
  }
  
  return 0;
}

function calculateShortAnswerScore(userAnswer: string, correctAnswer: string, maxPoints: number): number {
  if (!userAnswer.trim()) return 0;
  
  const normalizeText = (text: string) => {
    return text.toLowerCase()
      .replace(/[^\u4e00-\u9fa5a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };
  
  const userNorm = normalizeText(userAnswer);
  const correctNorm = normalizeText(correctAnswer);
  
  if (userNorm.length < 5) return 0;
  
  const correctParts = correctNorm.split(/[；;,，、]/).filter(p => p.length > 2);
  
  if (correctParts.length === 0) {
    const similarity = calculateSimilarity(userNorm, correctNorm);
    return Math.round(similarity * maxPoints);
  }
  
  let matchedPoints = 0;
  for (const part of correctParts) {
    if (userNorm.includes(part) || part.includes(userNorm)) {
      matchedPoints += 1;
    } else {
      const similarity = calculateSimilarity(userNorm, part);
      if (similarity > 0.6) {
        matchedPoints += similarity;
      }
    }
  }
  
  const score = (matchedPoints / correctParts.length) * maxPoints;
  return Math.round(score * 10) / 10;
}

function calculateSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1;
  if (str1.length < 2 || str2.length < 2) return 0;
  
  const longer = str1.length >= str2.length ? str1 : str2;
  const shorter = str1.length < str2.length ? str1 : str2;
  
  const longerLength = longer.length;
  if (longerLength === 0) return 1;
  
  const matches = [...shorter].filter(char => longer.includes(char)).length;
  return matches / longerLength;
}

export default function Quiz({ 
  group, 
  track,
  onFinish, 
  onExit 
}: { 
  group: 'primary' | 'junior';
  track: 'track1' | 'track2';
  onFinish: (score: number, total: number) => void;
  onExit: () => void;
}) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes
  
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | 'partial' | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    let filtered = (questionsData as Question[]);

    if (track === 'track1') {
      filtered = filtered.filter(q => 
        (group === 'primary' && q.group === 'track1_primary') ||
        (group === 'junior' && q.group === 'track1_junior')
      );
    } else {
      filtered = filtered.filter(q =>
        (group === 'primary' && q.group === 'primary') ||
        (group === 'junior' && q.group === 'junior')
      );
    }

    if (track === 'track2') {
      const singleQs = filtered.filter(q => q.type === 'single').sort(() => Math.random() - 0.5).slice(0, 10);
      const multiQs = filtered.filter(q => q.type === 'multiple').sort(() => Math.random() - 0.5).slice(0, 10);
      const boolQs = filtered.filter(q => q.type === 'boolean').sort(() => Math.random() - 0.5).slice(0, 10);
      const fillQs = filtered.filter(q => q.type === 'fill_in_the_blanks').sort(() => Math.random() - 0.5).slice(0, 10);
      const shortQs = filtered.filter(q => q.type === 'short_answer').sort(() => Math.random() - 0.5).slice(0, 2);

      [...singleQs, ...multiQs, ...boolQs, ...fillQs].forEach(q => q.points = 2);
      shortQs.forEach(q => q.points = 10);

      filtered = [...singleQs, ...multiQs, ...boolQs, ...fillQs, ...shortQs];
      
      if (filtered.length === 0) {
        filtered = (questionsData as Question[]).slice(0, 10);
      }
    } else {
      const singleQs = filtered.filter(q => q.type === 'single').sort(() => Math.random() - 0.5).slice(0, 10);
      const multiQs = filtered.filter(q => q.type === 'multiple').sort(() => Math.random() - 0.5).slice(0, 5);
      const boolQs = filtered.filter(q => q.type === 'boolean').sort(() => Math.random() - 0.5).slice(0, 5);
      const shortQs = filtered.filter(q => q.type === 'short_answer').sort(() => Math.random() - 0.5).slice(0, 1);

      [...singleQs, ...multiQs, ...boolQs].forEach(q => q.points = 4);
      shortQs.forEach(q => q.points = 60);

      filtered = [...singleQs, ...multiQs, ...boolQs, ...shortQs];
      if (filtered.length === 0) {
        filtered = (questionsData as Question[]).slice(0, 10);
      }
    }

    setQuestions(filtered);
  }, [group, track]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setScore(s => {
            onFinish(s, questions.reduce((acc, q) => acc + q.points, 0));
            return s;
          }); // auto submit
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [questions, onFinish]);

  const isLast = currentIndex === questions.length - 1;

  if (questions.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-white text-xl flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          正在生成专属试卷...
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  const handleOptionClick = (optionKey: string) => {
    if (feedback) return; // Prevent click during feedback

    if (currentQ.type === 'single' || currentQ.type === 'boolean') {
      setSelectedAnswers([optionKey]);
    } else if (currentQ.type === 'multiple') {
      setSelectedAnswers(prev => 
        prev.includes(optionKey) 
          ? prev.filter(k => k !== optionKey)
          : [...prev, optionKey]
      );
    }
  };

  const handleConfirm = () => {
    if (selectedAnswers.length === 0 && currentQ.type !== 'short_answer' && currentQ.type !== 'fill_in_the_blanks') return;

    let isCorrect = false;
    let earnedPoints = 0;
    
    if (currentQ.type === 'single') {
      isCorrect = selectedAnswers[0] === currentQ.answer;
      earnedPoints = isCorrect ? 1 : 0;
    } else if (currentQ.type === 'boolean') {
      const isUserTrue = selectedAnswers[0] === '正确' || selectedAnswers[0] === 'True' || selectedAnswers[0] === '√' || selectedAnswers[0] === '对';
      
      const answerStr = String(currentQ.answer).trim();
      const isAnswerTrue = answerStr === 'True' || answerStr === '正确' || answerStr === '√' || answerStr === '对';
      const isAnswerFalse = answerStr === 'False' || answerStr === '错误' || answerStr === '×' || answerStr === '错';
      
      if (isAnswerTrue) {
        isCorrect = isUserTrue;
      } else if (isAnswerFalse) {
        isCorrect = !isUserTrue;
      } else {
        isCorrect = false;
      }
      earnedPoints = isCorrect ? 1 : 0;
    } else if (currentQ.type === 'multiple') {
      const correctAnswers = currentQ.answer as string[];
      isCorrect = 
        selectedAnswers.length === correctAnswers.length && 
        selectedAnswers.every(a => correctAnswers.includes(a));
      earnedPoints = isCorrect ? 1 : 0;
    }

    if (currentQ.type === 'fill_in_the_blanks') {
      const userAnswer = selectedAnswers[0] || '';
      const correctAnswer = currentQ.answer as string;
      const earnedPoints = calculateFillInBlanksScore(userAnswer, correctAnswer, currentQ.points);
      setScore(prev => prev + earnedPoints);
      setShowAnswer(true);
      if (earnedPoints >= currentQ.points) {
        setFeedback('correct');
      } else {
        setFeedback('wrong');
      }
      return;
    }

    if (currentQ.type === 'short_answer') {
      const userAnswer = selectedAnswers[0] || '';
      const correctAnswer = currentQ.answer as string;
      const earnedPoints = calculateShortAnswerScore(userAnswer, correctAnswer, currentQ.points);
      setScore(prev => prev + earnedPoints);
      setShowAnswer(true);
      if (earnedPoints >= currentQ.points * 0.6) {
        setFeedback('correct');
      } else if (earnedPoints >= currentQ.points * 0.3) {
        setFeedback('partial');
      } else {
        setFeedback('wrong');
      }
      return;
    }

    if (isCorrect) {
      setScore(prev => prev + earnedPoints);
      setFeedback('correct');
      setTimeout(() => {
        handleNext();
      }, 300);
    } else {
      setFeedback('wrong');
      setShowAnswer(true);
      setTimeout(() => {
        handleNext();
      }, 1500);
    }
  };

  const handleNext = () => {
    setFeedback(null);
    setShowAnswer(false);
    setSelectedAnswers([]);
    
    if (isLast) {
      // Use the latest score state to avoid closure stale data or double-counting
      onFinish(score, questions.reduce((acc, q) => acc + q.points, 0));
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      single: '单选题',
      multiple: '多选题',
      boolean: '判断题',
      short_answer: '简答题',
      fill_in_the_blanks: '填空题'
    };
    return map[type] || '未知题型';
  };

  const getTypeScoreInfo = (type: string) => {
    const scoreMap: Record<string, number> = {
      single: 2,
      multiple: 2,
      boolean: 2,
      short_answer: 60,
      fill_in_the_blanks: 2
    };
    const countMap: Record<string, number> = {
      single: 10,
      multiple: 5,
      boolean: 5,
      short_answer: 1,
      fill_in_the_blanks: 10
    };
    const perQuestion = scoreMap[type] || 2;
    const count = countMap[type] || 1;
    const total = perQuestion * count;
    return { perQuestion, count, total };
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full h-full flex flex-col"
    >
      {/* Header Info */}
      <div className="glass-panel bg-white/10 border border-white/20 rounded-2xl p-4 flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <div className="text-white font-bold text-lg tracking-wider">
            {currentIndex + 1} <span className="text-white/50 text-sm">/ {questions.length}</span>
          </div>
          <div className="h-6 w-px bg-white/20"></div>
          <div className="text-blue-200 font-medium flex items-center">
            <span className="text-lg font-bold text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.8)]">{getTypeLabel(currentQ.type)}</span><span className="ml-3 text-xs bg-gradient-to-r from-yellow-500/20 to-amber-500/20 px-3 py-1.5 rounded-full text-yellow-200 font-medium border border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.3)]">每题{(() => {const scoreInfo = getTypeScoreInfo(currentQ.type);return scoreInfo.perQuestion;})()}分，共计{(() => {const scoreInfo = getTypeScoreInfo(currentQ.type);return scoreInfo.total;})()}分</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-amber-300 flex items-center font-mono text-lg bg-black/20 px-3 py-1 rounded-lg backdrop-blur-md border border-white/10">
            <Clock className="w-5 h-5 mr-2 text-amber-400" />
            {formatTime(timeLeft)}
          </div>
          <button onClick={onExit} className="text-white/60 hover:text-white text-sm ml-4 transition-colors font-medium">
            退出
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-white/10 rounded-full mb-8 overflow-hidden shadow-inner border border-white/5">
        <motion.div 
          className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <AnimatePresence>
        <motion.div 
          key={currentQ.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="flex-1 flex flex-col min-h-0 glass-card p-4 md:p-8"
        >
          <div className="flex-1 overflow-y-auto pr-2 pb-2">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-6 leading-relaxed drop-shadow-md whitespace-pre-wrap">
              {currentQ.question.replace(/^\d+[.、：:]\s*/, '')}
            </h2>

            <div className="space-y-3">
              {currentQ.type === 'boolean' && (
                <>
                  {['True', 'False'].map(opt => (
                    <button
                      key={opt}
                      onClick={() => handleOptionClick(opt)}
                      disabled={feedback !== null}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        selectedAnswers.includes(opt)
                          ? 'bg-blue-500/20 border-blue-400/50 shadow-[0_4px_15px_rgba(59,130,246,0.2)]'
                          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                      } ${
                        showAnswer && currentQ.answer === opt
                          ? 'bg-emerald-500/20 border-emerald-400/50'
                          : ''
                      } ${
                        showAnswer && selectedAnswers.includes(opt) && currentQ.answer !== opt
                          ? 'bg-red-500/20 border-red-400/50'
                          : ''
                      }`}
                    >
                      <span className="text-base md:text-lg font-medium text-white">{opt === 'True' ? '正确' : '错误'}</span>
                    </button>
                  ))}
                </>
              )}

              {(currentQ.type === 'single' || currentQ.type === 'multiple') && currentQ.options && (
                Object.entries(currentQ.options).map(([key, val]) => {
                  const isSelected = selectedAnswers.includes(key);
                  const isCorrectAnswer = Array.isArray(currentQ.answer) ? currentQ.answer.includes(key) : currentQ.answer === key;
                  
                  let optionStateClass = 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20';
                  if (isSelected) optionStateClass = 'bg-blue-500/20 border-blue-400/50 shadow-[0_4px_15px_rgba(59,130,246,0.2)]';
                  
                  if (showAnswer) {
                    if (isCorrectAnswer) {
                      optionStateClass = 'bg-emerald-500/20 border-emerald-400/50';
                    } else if (isSelected) {
                      optionStateClass = 'bg-red-500/20 border-red-400/50';
                    }
                  }

                  return (
                    <button
                      key={key}
                      onClick={() => handleOptionClick(key)}
                      disabled={feedback !== null}
                      className={`w-full text-left p-3 md:p-4 rounded-xl border-2 transition-all flex items-center ${optionStateClass}`}
                    >
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 md:mr-4 font-bold shrink-0 ${
                        isSelected ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70'
                      }`}>
                        {key}
                      </span>
                      <span className="text-base md:text-lg font-medium text-white">{val}</span>
                      
                      {showAnswer && isCorrectAnswer && <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-emerald-400 ml-auto shrink-0" />}
                      {showAnswer && isSelected && !isCorrectAnswer && <XCircle className="w-5 h-5 md:w-6 md:h-6 text-red-400 ml-auto shrink-0" />}
                    </button>
                  );
                })
              )}
              
              {(currentQ.type === 'short_answer' || currentQ.type === 'fill_in_the_blanks') && (
                <div className="bg-white/5 rounded-xl p-2 border-2 border-white/10 focus-within:border-blue-400/50 focus-within:bg-white/10 transition-colors shadow-sm">
                  <textarea 
                    className="w-full h-24 md:h-32 bg-transparent p-3 md:p-4 text-white outline-none resize-none placeholder:text-white/30"
                    placeholder={currentQ.type === 'fill_in_the_blanks' ? "请输入填空答案（多个空用逗号分隔）..." : "请输入你的答案..."}
                    onChange={(e) => setSelectedAnswers([e.target.value])}
                    disabled={feedback !== null}
                  />
                  {showAnswer && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2 p-3 md:p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl"
                    >
                      <p className="text-emerald-400 font-bold mb-1 text-sm md:text-base">参考答案：</p>
                      <p className="text-white/90 text-sm md:text-base">{currentQ.answer}</p>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Action Area */}
          <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center relative shrink-0">
            <div className="absolute left-1/2 -translate-x-1/2 top-0 mt-4 flex items-center justify-center">
              {feedback === 'correct' && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-emerald-400 flex items-center bg-emerald-500/20 px-4 py-2 md:px-6 md:py-3 rounded-full font-bold text-base md:text-xl shadow-lg border border-emerald-500/30 backdrop-blur-md"
                >
                  <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 mr-2" /> 回答正确
                </motion.div>
              )}
              {feedback === 'wrong' && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="text-red-400 flex items-center bg-red-500/20 px-4 py-2 md:px-6 md:py-3 rounded-full font-bold text-base md:text-xl shadow-lg border border-red-500/30 backdrop-blur-md"
                >
                  <XCircle className="w-5 h-5 md:w-6 md:h-6 mr-2" /> 回答错误
                </motion.div>
              )}
              {feedback === 'partial' && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-amber-400 flex items-center bg-amber-500/20 px-4 py-2 md:px-6 md:py-3 rounded-full font-bold text-base md:text-xl shadow-lg border border-amber-500/30 backdrop-blur-md"
                >
                  <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 mr-2" /> 部分正确
                </motion.div>
              )}
            </div>

            <div /> {/* Spacer */}
            
            {(currentQ.type === 'short_answer' || currentQ.type === 'fill_in_the_blanks') && showAnswer ? (
              <button
                onClick={handleNext}
                className="h-12 md:h-14 px-6 md:px-8 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all flex items-center justify-center text-white font-bold text-base md:text-lg shadow-[0_4px_15px_rgba(37,99,235,0.3)] group z-10 border border-blue-500/50"
              >
                {isLast ? '提交试卷' : '下一题'}
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button
                onClick={handleConfirm}
                disabled={feedback !== null || (selectedAnswers.length === 0 && currentQ.type !== 'short_answer' && currentQ.type !== 'fill_in_the_blanks')}
                className={`h-12 md:h-14 px-6 md:px-8 rounded-xl transition-all flex items-center justify-center text-white font-bold text-base md:text-lg group z-10 ${
                  feedback !== null || (selectedAnswers.length === 0 && currentQ.type !== 'short_answer' && currentQ.type !== 'fill_in_the_blanks')
                    ? 'bg-white/10 text-white/40 cursor-not-allowed border border-white/5'
                    : 'bg-blue-600 hover:bg-blue-500 active:scale-95 shadow-[0_4px_15px_rgba(37,99,235,0.3)] border border-blue-500/50'
                }`}
              >
                {currentQ.type === 'short_answer' || currentQ.type === 'fill_in_the_blanks' ? '确认答案' : '确认答案'}
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
