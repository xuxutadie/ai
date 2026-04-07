import React from 'react';
import { motion } from 'framer-motion';
import { Award, RotateCcw, Trophy, Star } from 'lucide-react';

export default function Result({ score, total, onRetry }: { score: number; total: number; onRetry: () => void }) {
  const percentage = Math.round((score / total) * 100) || 0;
  
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

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="m-auto max-w-lg w-full flex flex-col items-center justify-center h-full"
    >
      <div className="glass-card w-full p-10 flex flex-col items-center text-center">
        <motion.div 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 10, delay: 0.2 }}
          className="mb-6 drop-shadow-[0_0_20px_rgba(251,191,36,0.3)]"
        >
          {icon}
        </motion.div>
        
        <h2 className="text-3xl font-black text-white mb-2 tracking-widest drop-shadow-md">测试完成</h2>
        <p className="text-white/70 mb-10 font-medium">{message}</p>

        <div className="flex w-full justify-between items-center bg-black/20 border border-white/10 rounded-2xl p-6 mb-8 shadow-inner">
          <div className="flex flex-col items-center w-1/2">
            <span className="text-white/50 text-sm mb-1 font-medium">得分</span>
            <span className="text-4xl font-black text-white drop-shadow-sm">{score}</span>
            <span className="text-white/40 text-xs mt-1 font-medium">满分 {total}</span>
          </div>
          
          <div className="w-px h-16 bg-white/10"></div>
          
          <div className="flex flex-col items-center w-1/2">
            <span className="text-white/50 text-sm mb-1 font-medium">评级</span>
            <span className={`text-5xl font-black ${colorClass} drop-shadow-lg`}>{grade}</span>
            <span className="text-white/40 text-xs mt-1 font-medium">正确率 {percentage}%</span>
          </div>
        </div>

        <button
          onClick={onRetry}
          className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all flex items-center justify-center text-white font-bold text-lg shadow-[0_4px_15px_rgba(37,99,235,0.3)] group border border-blue-500/50"
        >
          <RotateCcw className="w-5 h-5 mr-2 group-hover:-rotate-180 transition-transform duration-500" />
          重新训练
        </button>
      </div>
    </motion.div>
  );
}
