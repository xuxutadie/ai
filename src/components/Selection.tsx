﻿﻿import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Zap, GraduationCap, Rocket, Settings, ArrowLeft, Brain, Target } from 'lucide-react';
import { AuthStatus } from '../types';
import ElectricBorder from './ElectricBorder';

export default function Selection({ 
  authStatus, 
  onStart, 
  onAdmin,
  onLogout 
}: { 
  authStatus: AuthStatus; 
  onStart: (group: 'primary' | 'junior', track: 'track1' | 'track2' | 'track3' | 'pk') => void;
  onAdmin: () => void;
  onLogout: () => void;
}) {
  const [selectedTrack, setSelectedTrack] = useState<'track1' | 'track2' | 'track3' | 'pk' | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminCode, setAdminCode] = useState('');

  const isPKUnlocked = authStatus.type === 'PK_SPECIAL' || authStatus.type === 'ADMIN' || authStatus.type === 'UNLIMITED';

  const tracks = [
    {
      id: 'track1',
      title: '赛道一',
      subtitle: '基础知识训练',
      color: '#8b5cf6',
      icon: Brain,
      iconColor: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-400/30',
      shadowColor: 'shadow-[0_0_30px_rgba(139,92,246,0.2)]',
      energyColor: 'text-purple-300',
      energyBg: 'bg-purple-500/20',
      energyBorder: 'border-purple-500/30'
    },
    {
      id: 'track2',
      title: '赛道二',
      subtitle: '工具应用问答',
      color: '#f59e0b',
      icon: Target,
      iconColor: 'text-amber-400',
      bgColor: 'bg-amber-500/20',
      borderColor: 'border-amber-400/30',
      shadowColor: 'shadow-[0_0_30px_rgba(245,158,11,0.2)]',
      energyColor: 'text-amber-300',
      energyBg: 'bg-amber-500/20',
      energyBorder: 'border-amber-500/30'
    },
    {
      id: 'track3',
      title: '赛道三',
      subtitle: '综合大题挑战',
      color: '#3b82f6',
      icon: Rocket,
      iconColor: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-400/30',
      shadowColor: 'shadow-[0_0_30px_rgba(59,130,246,0.2)]',
      energyColor: 'text-blue-300',
      energyBg: 'bg-blue-500/20',
      energyBorder: 'border-blue-500/30'
    },
    {
      id: 'pk',
      title: 'PK 赛',
      subtitle: '双人分屏对战',
      color: '#ef4444',
      icon: Zap,
      iconColor: 'text-red-400',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-400/30',
      shadowColor: 'shadow-[0_0_30px_rgba(239,68,68,0.2)]',
      energyColor: 'text-red-300',
      energyBg: 'bg-red-500/20',
      energyBorder: 'border-red-500/30',
      locked: !isPKUnlocked
    }
  ];

  const handleAdminEnter = () => {
    if (adminCode === 'xxxb520') {
      onAdmin();
    } else {
      alert('密码错误');
    }
  };

  const handleStart = (group: 'primary' | 'junior') => {
    if (selectedTrack) {
      onStart(group, selectedTrack);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full h-full flex flex-col px-4 md:px-0"
    >
      <nav className="flex items-center justify-between glass-panel bg-white/20 text-white px-6 py-4 rounded-2xl mb-4 md:mb-8 mt-4 shrink-0">
        <div className="flex items-center space-x-4">
          <div className="bg-amber-400/20 text-amber-300 px-4 py-2 rounded-full flex items-center font-bold text-sm tracking-wider border border-amber-400/30">
            <Zap className="w-4 h-4 mr-2 shrink-0" />
            <span className="truncate max-w-[120px] md:max-w-none">剩余能量：{authStatus?.remaining === 999 ? '无限' : authStatus?.remaining}</span>
          </div>
          <div className="text-white/90 text-sm font-medium hidden md:block">
            类型：{authStatus?.type === 'PAID_5' ? '次卡' : '年卡'}
          </div>
        </div>
        <button onClick={onLogout} className="text-white/80 hover:text-white transition-colors flex items-center text-sm font-medium bg-white/10 px-4 py-2 rounded-xl hover:bg-white/20 shrink-0">
          <LogOut className="w-4 h-4 md:mr-2" />
          <span className="hidden md:inline">退出登录</span>
        </button>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center py-2 md:py-4 min-h-0 relative">
        <AnimatePresence mode="wait">
          {!selectedTrack ? (
            <motion.div
              key="track-selection"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full h-full flex flex-col items-center overflow-y-auto custom-scrollbar pr-2"
            >
              <h2 className="text-2xl md:text-3xl font-black text-white mb-6 md:mb-8 text-center">选择赛道</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full max-w-7xl flex-1 min-h-0">
                {tracks.map((track) => (
                  <ElectricBorder 
                    key={track.id}
                    color={track.color} 
                    speed={1} 
                    chaos={0.12} 
                    borderRadius={32} 
                    className={`cursor-pointer h-full ${track.locked ? 'opacity-50 grayscale pointer-events-none' : ''}`}
                  >
                    <motion.div
                      whileHover={{ y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedTrack(track.id as any)}
                      className="w-full h-full p-4 md:p-6 group flex flex-col items-center text-center justify-center relative overflow-hidden"
                    >
                      {track.locked && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
                          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-2 border border-white/20">
                            <Settings className="w-6 h-6 text-white/60" />
                          </div>
                          <span className="text-white/80 font-bold text-sm">需 PK 赛授权码</span>
                        </div>
                      )}
                      <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl md:rounded-3xl ${track.bgColor} border ${track.borderColor} flex items-center justify-center mb-3 md:mb-5 group-hover:scale-110 transition-transform ${track.shadowColor} shrink-0`}>
                        <track.icon className={`w-7 h-7 md:w-8 md:h-8 ${track.iconColor}`} />
                      </div>
                      <h3 className="text-lg md:text-xl font-black text-white mb-1 tracking-wide">{track.title}</h3>
                      <p className={`${track.energyColor}/80 text-[10px] md:text-xs mb-3 md:mb-4`}>{track.subtitle}</p>
                      <div className={`mt-auto inline-flex items-center text-[10px] md:text-xs font-bold ${track.energyColor} ${track.energyBg} px-3 py-1.5 rounded-full border ${track.energyBorder} whitespace-nowrap`}>
                        {track.id === 'pk' ? 'PK 专属权限' : '扣除 1 次能量'}
                      </div>
                    </motion.div>
                  </ElectricBorder>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="group-selection"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full h-full flex flex-col items-center"
            >
              <div className="flex flex-col items-center w-full max-w-4xl mb-6 md:mb-8">
                <div className="flex items-center justify-between w-full mb-4">
                  <button
                    onClick={() => setSelectedTrack(null)}
                    className="text-white/70 hover:text-white flex items-center text-sm font-medium transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    返回赛道选择
                  </button>
                  <div className="w-24"></div>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white text-center">
                  {selectedTrack === 'track1' ? '基础知识训练' : 
                   selectedTrack === 'track2' ? '工具应用问答' : 
                   selectedTrack === 'track3' ? '综合大题挑战' : '双人 PK 对战'}
                </h2>
                <p className="text-white/60 text-sm md:text-base mt-2 text-center">
                  {selectedTrack === 'track3' ? '点击下方按钮立即开始挑战' : 
                   selectedTrack === 'pk' ? '请选择对战组别以进入赛场' : '请选择您的学段以开始练习'}
                </p>
              </div>

              <div className={`grid ${selectedTrack === 'track3' ? 'grid-cols-1 max-w-xl' : 'grid-cols-1 md:grid-cols-2 max-w-4xl'} gap-4 md:gap-8 w-full flex-1 min-h-0`}>
                {selectedTrack === 'track3' ? (
                  <ElectricBorder color="#3b82f6" speed={1} chaos={0.12} borderRadius={32} className="cursor-pointer h-full">
                    <motion.div
                      whileHover={{ y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleStart('junior')}
                      className="w-full h-full p-4 md:p-8 group flex flex-col items-center text-center justify-center"
                    >
                      <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-3xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center mb-3 md:mb-8 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(59,130,246,0.2)] shrink-0">
                        <Rocket className="w-8 h-8 md:w-12 md:h-12 text-blue-400" />
                      </div>
                      <h3 className="text-2xl md:text-3xl font-black text-white mb-1 md:mb-3 tracking-wide">开始挑战</h3>
                       <p className="text-blue-100/80 text-sm md:text-lg mb-3 md:mb-6">初中/高中</p>
                       <div className="mt-auto inline-flex items-center text-xs md:text-sm font-bold text-blue-300 bg-blue-500/20 px-4 md:px-5 py-2 md:py-2.5 rounded-full border border-blue-500/30">扣除 1 次能量</div>
                    </motion.div>
                  </ElectricBorder>
                ) : (
                  <>
                    <ElectricBorder color="#10b981" speed={1} chaos={0.12} borderRadius={32} className="cursor-pointer h-full">
                      <motion.div
                        whileHover={{ y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleStart('primary')}
                        className="w-full h-full p-4 md:p-8 group flex flex-col items-center text-center justify-center"
                      >
                        <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-3xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center mb-3 md:mb-8 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(16,185,129,0.2)] shrink-0">
                          <GraduationCap className="w-8 h-8 md:w-12 md:h-12 text-emerald-400" />
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black text-white mb-1 md:mb-3 tracking-wide">小学组<span className="text-lg md:text-xl font-bold opacity-80">(Primary)</span></h3>
                        <p className="text-emerald-100/80 text-sm md:text-lg mb-3 md:mb-6">适合 3-6 年级</p>
                        <div className="mt-auto inline-flex items-center text-xs md:text-sm font-bold text-emerald-300 bg-emerald-500/20 px-4 md:px-5 py-2 md:py-2.5 rounded-full border border-emerald-500/30">扣除 1 次能量</div>
                      </motion.div>
                    </ElectricBorder>

                    <ElectricBorder color="#3b82f6" speed={1} chaos={0.12} borderRadius={32} className="cursor-pointer h-full">
                      <motion.div
                        whileHover={{ y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleStart('junior')}
                        className="w-full h-full p-4 md:p-8 group flex flex-col items-center text-center justify-center"
                      >
                        <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-3xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center mb-3 md:mb-8 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(59,130,246,0.2)] shrink-0">
                          <Rocket className="w-8 h-8 md:w-12 md:h-12 text-blue-400" />
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black text-white mb-1 md:mb-3 tracking-wide">初中/高中<span className="text-lg md:text-xl font-bold opacity-80">(Junior/Senior)</span></h3>
                        <p className="text-blue-100/80 text-sm md:text-lg mb-3 md:mb-6">适合 7-12 年级，进阶题库</p>
                        <div className="mt-auto inline-flex items-center text-xs md:text-sm font-bold text-blue-300 bg-blue-500/20 px-4 md:px-5 py-2 md:py-2.5 rounded-full border border-blue-500/30">扣除 1 次能量</div>
                      </motion.div>
                    </ElectricBorder>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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