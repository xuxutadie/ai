﻿import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Key, Sparkles, ShieldAlert, Loader2 } from 'lucide-react';
import { AuthStatus } from '../types';
import ElectricBorder from './ElectricBorder';
import { LicenseData } from '../services/licenseValidation';

export default function Auth({ onAuthSuccess }: { onAuthSuccess: (status: AuthStatus) => void }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [licenseData, setLicenseData] = useState<LicenseData | null>(null);

  useEffect(() => {
    fetch('/license_codes.json')
      .then(res => res.json())
      .then(data => {
        setLicenseData(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const handleVerify = () => {
    if (loading || !licenseData) {
      return;
    }

    const normalizedCode = code.toUpperCase().trim();

    if (normalizedCode === 'ADMIN888') {
      onAuthSuccess({ code: normalizedCode, type: 'ADMIN', remaining: 999 });
      return;
    }

    const foundCode = licenseData.codes.find(c => c.code === normalizedCode);

    if (!foundCode) {
      setError(true);
      setErrorMessage('无效的授权码');
      setTimeout(() => setError(false), 500);
      return;
    }

    if (foundCode.isUsed) {
      setError(true);
      setErrorMessage('该授权码已被使用');
      setTimeout(() => setError(false), 500);
      return;
    }

    onAuthSuccess({ code: normalizedCode, type: 'UNLIMITED', remaining: 999 });
  };

  if (loading) {
    return (
      <div className="m-auto flex flex-col items-center justify-center h-full">
        <Loader2 className="w-12 h-12 text-blue-400 animate-spin mb-4" />
        <p className="text-white/60 text-sm font-medium">加载授权信息中...</p>
      </div>
    );
  }

  return (
    <div className="m-auto flex flex-col items-center w-full max-w-[500px] z-10 px-4">
      {/* Header Text */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center mb-8 text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-sm font-bold shadow-sm border border-white/20 mb-6">
          <span className="w-2 h-2 rounded-full bg-blue-400 opacity-90"></span>
          2026 EDITION
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white drop-shadow-lg tracking-tight mb-3">
          青少年人工智能核心素养练习系统
        </h1>
        <p className="text-blue-100 font-medium text-lg drop-shadow-md uppercase">
          YOUTH AI CORE LITERACY PRACTICE SYSTEM
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <ElectricBorder 
          color="#3b82f6" 
          speed={1.5} 
          chaos={0.15} 
          borderRadius={32} 
        >
          <div className="w-full p-8 md:p-10 flex flex-col items-center">
            <div className="w-[4.5rem] h-[4.5rem] rounded-[1.25rem] bg-white/10 border border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex items-center justify-center mb-5">
              <ShieldCheck className="w-8 h-8 text-blue-400 stroke-[2.5]" />
            </div>
            
            <div className="mb-4 text-center"><p className="text-amber-300 text-xs font-medium tracking-wide bg-gradient-to-r from-transparent via-amber-500/10 to-transparent py-2 px-4 rounded-lg border border-amber-500/20">本工具搭建、部署、算力都存在成本，故需自愿付费进行使用</p></div><h2 className="text-[1.7rem] font-black text-white mb-1.5 tracking-tight">系统访问授权</h2>
            <p className="text-slate-300 text-sm mb-8 font-medium">
              请输入您的节点代码以解锁训练任务
            </p>

            <motion.div 
              animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="w-full relative mb-8"
            >
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Key className="w-5 h-5 text-white/50" />
              </div>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="请输入系统授权码"
                className={`w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-blue-400/50 focus:bg-white/10 focus:ring-4 focus:ring-blue-500/20 transition-all placeholder:text-white/30 ${
                  error ? 'border-red-400/50 focus:border-red-400/50 focus:ring-red-500/20' : ''
                }`}
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              />
              {error && (
                <div className="absolute -bottom-7 left-0 flex items-center text-red-400 text-sm font-medium">
                  <ShieldAlert className="w-4 h-4 mr-1" />
                  {errorMessage}
                </div>
              )}
            </motion.div>

            <button
              onClick={handleVerify}
              disabled={loading}
              className="glow-button w-full"
            >
              <span className="glow-button-inner">
                立即激活
                <Sparkles className="w-[1.15rem] h-[1.15rem] ml-2 text-blue-400 group-hover:rotate-12 transition-transform" />
              </span>
            </button>
          </div>
        </ElectricBorder>
      </motion.div>
    </div>
  );
}
