import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Zap, GraduationCap, Rocket, Settings, ArrowLeft, Brain, Target } from 'lucide-react';
import { AuthStatus } from '../types';
import ElectricBorder from './ElectricBorder';

export default function Selection({ 
  authStatus, 
  onStart, 
  onLogout,
  onAdmin 
}: { 
  authStatus: AuthStatus | null;
  onStart: (group: 'primary' | 'junior', track: 'track1' | 'track2') => void;
  onLogout: () => void;
  onAdmin: () => void;
}) {
  const [adminCode, setAdminCode] = useState('');
  const [showAdmin, setShowAdmin] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<'track1' | 'track2' | null>(null);

  const handleAdminEnter = () => {
    if (adminCode === 'xxxb520') {
      onAdmin();
    } else {
      alert('密码错误');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full h-full flex flex-col px-4 md:px-0"
    >
      {/* Navbar */}
      <nav className="flex items-center justify-between glass-panel bg-white/20 text-white px-6 py-4 rounded-2xl mb-4 md:mb-8 mt-4 shrink-0">
        <div className="flex items-center space-x-4">
          <div className="bg-amber-400/20 text-amber-300 px-4 py-2 rounded-full flex items-center font-bold text-sm tracking-wider border border-amber-400/30">
            <Zap className="w-4 h-4 mr-2 shrink-0" />
            <span className="truncate max-w-[120px] md:max-w-none">剩余能量: {authStatus?.remaining === 999 ? '无限' : authStatus?.remaining} 次</span>
          </div>
          <div className="text-white/90 text-sm font-medium hidden md:block">
            类型: {authStatus?.type === 'PAID_5' ? '次卡' : '年卡'}
          </div>
        </div>
        <button onClick={onLogout} className="text-white/80 hover:text-white transition-colors flex items-center text-sm font-medium bg-white/10 px-4 py-2 rounded-xl hover:bg-white/20 shrink-0">
          <LogOut className="w-4 h-4 md:mr-2" />
          <span className="hidden md:inline">退出登录</span>
        </button>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center py-2 md:py-4 min-h-0 relative">
        <AnimatePresence mode="wait">
          {!selectedTrack ? (
            <motion.div
              key="tracks"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full flex flex-col items-center justify-center h-full min-h-0"
            >
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6 md:mb-12 tracking-wider drop-shadow-lg shrink-0">选择测试赛道</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 w-full max-w-4xl flex-1 min-h-0">
                {/* Track 1 */}
                <ElectricBorder color="#a855f7" speed={1} chaos={0.12} borderRadius={32} className="cursor-pointer h-full">
                  <motion.div 
                    whileHover={{ y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedTrack('track1')}
                    className="w-full h-full p-4 md:p-8 group flex flex-col items-center text-center justify-center"
                  >
                    <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-3xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center mb-3 md:mb-8 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(168,85,247,0.2)] shrink-0">
                      <Target className="w-8 h-8 md:w-12 md:h-12 text-purple-400" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black text-white mb-1 md:mb-3 tracking-wide">赛道一 <span className="text-lg md:text-xl font-bold opacity-80">(基础)</span></h3>
                    <p className="text-purple-100/80 text-sm md:text-lg mb-3 md:mb-6">客观题测试 (单选、判断)</p>
                    <div className="mt-auto inline-flex items-center text-xs md:text-sm font-bold text-purple-300 bg-purple-500/20 px-4 md:px-5 py-2 md:py-2.5 rounded-full border border-purple-500/30">
                      下一步
                    </div>
                  </motion.div>
                </ElectricBorder>

                {/* Track 2 */}
                <ElectricBorder color="#f43f5e" speed={1} chaos={0.12} borderRadius={32} className="cursor-pointer h-full">
                  <motion.div 
                    whileHover={{ y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedTrack('track2')}
                    className="w-full h-full p-4 md:p-8 group flex flex-col items-center text-center justify-center"
                  >
                    <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-3xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center mb-3 md:mb-8 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(244,63,94,0.2)] shrink-0">
                      <Brain className="w-8 h-8 md:w-12 md:h-12 text-rose-400" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black text-white mb-1 md:mb-3 tracking-wide">赛道二 <span className="text-lg md:text-xl font-bold opacity-80">(进阶)</span></h3>
                    <p className="text-rose-100/80 text-sm md:text-lg mb-3 md:mb-6">主客观混合测试 (多选、简答)</p>
                    <div className="mt-auto inline-flex items-center text-xs md:text-sm font-bold text-rose-300 bg-rose-500/20 px-4 md:px-5 py-2 md:py-2.5 rounded-full border border-rose-500/30">
                      下一步
                    </div>
                  </motion.div>
                </ElectricBorder>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="groups"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full flex flex-col items-center justify-center h-full min-h-0"
            >
              <div className="w-full max-w-4xl flex items-center justify-between mb-4 md:mb-12 shrink-0 px-2">
                <button 
                  onClick={() => setSelectedTrack(null)}
                  className="text-white/70 hover:text-white flex items-center transition-colors p-2 md:px-4 md:py-2 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 text-sm md:text-base"
                >
                  <ArrowLeft className="w-5 h-5 md:mr-2" /> <span className="hidden md:inline">返回重选</span>
                </button>
                <h2 className="text-2xl md:text-4xl font-black text-white tracking-wider drop-shadow-lg text-center flex-1">
                  选择考试组别
                </h2>
                <div className="w-10 md:w-24"></div> {/* Spacer */}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 w-full max-w-4xl flex-1 min-h-0">
                {/* Primary */}
                <ElectricBorder color="#10b981" speed={1} chaos={0.12} borderRadius={32} className="cursor-pointer h-full">
                  <motion.div 
                    whileHover={{ y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onStart('primary', selectedTrack)}
                    className="w-full h-full p-4 md:p-8 group flex flex-col items-center text-center justify-center"
                  >
                    <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-3xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center mb-3 md:mb-8 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(16,185,129,0.2)] shrink-0">
                      <GraduationCap className="w-8 h-8 md:w-12 md:h-12 text-emerald-400" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black text-white mb-1 md:mb-3 tracking-wide">小学组 <span className="text-lg md:text-xl font-bold opacity-80">(Primary)</span></h3>
                    <p className="text-emerald-100/80 text-sm md:text-lg mb-3 md:mb-6">适合 1-6 年级</p>
                    <div className="mt-auto inline-flex items-center text-xs md:text-sm font-bold text-emerald-300 bg-emerald-500/20 px-4 md:px-5 py-2 md:py-2.5 rounded-full border border-emerald-500/30">
                      扣除 1 次能量
                    </div>
                  </motion.div>
                </ElectricBorder>

                {/* Junior */}
                <ElectricBorder color="#3b82f6" speed={1} chaos={0.12} borderRadius={32} className="cursor-pointer h-full">
                  <motion.div 
                    whileHover={{ y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onStart('junior', selectedTrack)}
                    className="w-full h-full p-4 md:p-8 group flex flex-col items-center text-center justify-center"
                  >
                    <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-3xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center mb-3 md:mb-8 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(59,130,246,0.2)] shrink-0">
                      <Rocket className="w-8 h-8 md:w-12 md:h-12 text-blue-400" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black text-white mb-1 md:mb-3 tracking-wide">初中组 <span className="text-lg md:text-xl font-bold opacity-80">(Junior)</span></h3>
                    <p className="text-blue-100/80 text-sm md:text-lg mb-3 md:mb-6">适合初中生，进阶题库</p>
                    <div className="mt-auto inline-flex items-center text-xs md:text-sm font-bold text-blue-300 bg-blue-500/20 px-4 md:px-5 py-2 md:py-2.5 rounded-full border border-blue-500/30">
                      扣除 1 次能量
                    </div>
                  </motion.div>
                </ElectricBorder>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Admin Entrance */}
      <div className="mt-auto pt-4 pb-4 flex justify-center shrink-0">
        {!showAdmin ? (
          <button 
            onClick={() => setShowAdmin(true)}
            className="text-white/50 hover:text-white flex items-center text-sm transition-colors font-medium bg-black/10 px-4 py-2 rounded-full backdrop-blur-md"
          >
            <Settings className="w-4 h-4 mr-2" />
            进入后台管理
          </button>
        ) : (
          <div className="flex items-center space-x-2 bg-slate-900/60 p-2.5 rounded-2xl backdrop-blur-xl border border-white/10 shadow-2xl">
            <input 
              type="password" 
              placeholder="后台密码" 
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              className="bg-white/10 px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-white/40 outline-none w-32 md:w-40 focus:bg-white/20 focus:ring-2 focus:ring-blue-400 transition-all border border-white/5"
            />
            <button 
              onClick={handleAdminEnter}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-lg"
            >
              确认
            </button>
            <button 
              onClick={() => setShowAdmin(false)}
              className="text-white/60 hover:text-white px-2 text-sm font-medium transition-colors"
            >
              取消
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}