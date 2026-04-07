import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, RotateCcw, Trophy, Star, ChevronDown, XCircle, AlertCircle, CheckCircle } from 'lucide-react';
import { Question } from '../types';

interface QuestionResult {
  question: Question;
  userAnswer: string[];
  earnedPoints: number;
  maxPoints: number;
  isCorrect: boolean;
}

export default function Result({ 
  score, 
  total, 
  questionResults = [],
  onRetry 
}: { 
  score: number; 
  total: number; 
  questionResults?: QuestionResult[];
  onRetry: () => void 
}) {
  const [showDetails, setShowDetails] = useState(false);
  const percentage = Math.round((score / total) * 100) || 0;
  
  // 筛选出答错的题目
  const wrongAnswers = questionResults.filter(r => !r.isCorrect || r.earnedPoints < r.maxPoints);
  
  let grade = 'C';
  let message = '继续努力！';
  let colorClass = 'text-slate-400';
  let icon = <Star className="w-16 h-16 text-slate-400" />;

  if (percentage >= 90) {
    grade = 'S';
    message = '太棒了！AI 大师！';
    colorClass = 'text-amber-400';
    icon = <Trophy className="w-16 h-16 text-amber-400" />;
  } else if (percentage >= 75) {
    grade = 'A';
    message = '表现优异！';
    colorClass = 'text-emerald-400';
    icon = <Award className="w-16 h-16 text-emerald-400" />;
  } else if (percentage >= 60) {
    grade = 'B';
    message = '干得不错，再接再厉！';
    colorClass = 'text-blue-400';
    icon = <Star className="w-16 h-16 text-blue-400" />;
  }

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

  const formatAnswer = (result: QuestionResult) => {
    if (result.userAnswer.length === 0) return '未作答';
    
    if (result.question.type === 'multiple') {
      return result.userAnswer.join(', ');
    }
    
    return result.userAnswer[0] || '未作答';
  };

  const formatCorrectAnswer = (result: QuestionResult) => {
    if (Array.isArray(result.question.answer)) {
      return result.question.answer.join(', ');
    }
    return String(result.question.answer);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="m-auto max-w-2xl w-full flex flex-col items-center justify-center h-full overflow-hidden"
    >
      <div className="glass-card w-full p-6 md:p-8 flex flex-col items-center text-center max-h-full overflow-y-auto">
        <motion.div 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 10, delay: 0.2 }}
          className="mb-4 drop-shadow-[0_0_20px_rgba(251,191,36,0.3)]"
        >
          {icon}
        </motion.div>
        
        <h2 className="text-2xl md:text-3xl font-black text-white mb-2 tracking-widest drop-shadow-md">测试完成</h2>
        <p className="text-white/70 mb-6 font-medium">{message}</p>

        <div className="flex w-full justify-between items-center bg-black/20 border border-white/10 rounded-2xl p-4 md:p-6 mb-6 shadow-inner">
          <div className="flex flex-col items-center w-1/2">
            <span className="text-white/50 text-sm mb-1 font-medium">得分</span>
            <span className="text-3xl md:text-4xl font-black text-white drop-shadow-sm">{score}</span>
            <span className="text-white/40 text-xs mt-1 font-medium">满分 {total}</span>
          </div>
          
          <div className="w-px h-12 md:h-16 bg-white/10"></div>
          
          <div className="flex flex-col items-center w-1/2">
            <span className="text-white/50 text-sm mb-1 font-medium">评级</span>
            <span className={`text-4xl md:text-5xl font-black ${colorClass} drop-shadow-lg`}>{grade}</span>
            <span className="text-white/40 text-xs mt-1 font-medium">正确率 {percentage}%</span>
          </div>
        </div>

        {/* 错题详情 */}
        {wrongAnswers.length > 0 && (
          <div className="w-full mb-6">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-colors"
            >
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                <span className="text-red-200 font-medium">答错的题目 ({wrongAnswers.length}道)</span>
              </div>
              <ChevronDown className={`w-5 h-5 text-red-400 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 space-y-3 max-h-60 overflow-y-auto pr-2">
                    {wrongAnswers.map((result, index) => (
                      <div 
                        key={index}
                        className="p-4 bg-white/5 border border-white/10 rounded-xl text-left"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-xs text-white/50 bg-white/10 px-2 py-1 rounded">
                            {getTypeLabel(result.question.type)}
                          </span>
                          <span className="text-sm font-medium text-red-300">
                            -{result.maxPoints - result.earnedPoints}分
                          </span>
                        </div>
                        
                        <p className="text-white text-sm mb-3 line-clamp-2">
                          {result.question.question.replace(/^\d+[.、：:]\s*/, '')}
                        </p>
                        
                        <div className="space-y-2 text-xs">
                          <div className="flex items-start">
                            <XCircle className="w-4 h-4 text-red-400 mr-2 shrink-0 mt-0.5" />
                            <div>
                              <span className="text-white/50">你的答案：</span>
                              <span className="text-red-200">{formatAnswer(result)}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <CheckCircle className="w-4 h-4 text-emerald-400 mr-2 shrink-0 mt-0.5" />
                            <div>
                              <span className="text-white/50">正确答案：</span>
                              <span className="text-emerald-200">{formatCorrectAnswer(result)}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between pt-2 border-t border-white/10 mt-2">
                            <span className="text-white/40">得分：{result.earnedPoints}/{result.maxPoints}</span>
                            <span className="text-white/40">扣分：{result.maxPoints - result.earnedPoints}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {wrongAnswers.length === 0 && (
          <div className="w-full p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-6">
            <div className="flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-400 mr-2" />
              <span className="text-emerald-200 font-medium">恭喜！全部答对，没有扣分！</span>
            </div>
          </div>
        )}

        <button
          onClick={onRetry}
          className="w-full h-12 md:h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all flex items-center justify-center text-white font-bold text-base md:text-lg shadow-[0_4px_15px_rgba(37,99,235,0.3)] group border border-blue-500/50"
        >
          <RotateCcw className="w-5 h-5 mr-2 group-hover:-rotate-180 transition-transform duration-500" />
          重新训练
        </button>
      </div>
    </motion.div>
  );
}
