import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Copy, Trash2, ArrowLeft, Key } from 'lucide-react';

interface CodeRecord {
  id: string;
  code: string;
  type: string;
  createdAt: Date;
}

export default function AdminPanel({ onExit }: { onExit: () => void }) {
  const [codes, setCodes] = useState<CodeRecord[]>([]);

  const generateCode = (type: '5次' | '1年') => {
    const prefix = type === '5次' ? 'AI5-' : 'AI1Y-';
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newCode: CodeRecord = {
      id: Date.now().toString(),
      code: `${prefix}${randomStr}`,
      type,
      createdAt: new Date()
    };
    setCodes(prev => [newCode, ...prev]);
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  const handleDelete = (id: string) => {
    setCodes(prev => prev.filter(c => c.id !== id));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full h-full flex flex-col max-w-5xl mx-auto px-4 md:px-0"
    >
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl flex items-center justify-between mb-8 bg-white/10 border-white/20 text-white shadow-lg mt-4">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mr-4 shadow-sm border border-white/10">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-widest drop-shadow-md">后台管理</h1>
            <p className="text-white/60 text-sm font-medium">授权码生成与分发中心</p>
          </div>
        </div>
        <button 
          onClick={onExit}
          className="text-white/70 hover:text-white flex items-center transition-colors px-4 py-2 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> 返回系统
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1 min-h-0">
        {/* Controls */}
        <div className="col-span-1 flex flex-col space-y-6">
          <div className="glass-card p-6 relative overflow-hidden group border-blue-500/30">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-blue-400/30 transition-colors"></div>
            <h3 className="text-xl font-bold text-white mb-2 relative z-10 drop-shadow-md">基础授权</h3>
            <p className="text-white/60 text-sm mb-6 relative z-10 font-medium">9.9元 / 5次练习</p>
            <button 
              onClick={() => generateCode('5次')}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl active:scale-95 transition-all flex items-center justify-center relative z-10 shadow-[0_4px_15px_rgba(37,99,235,0.3)] border border-blue-500/50"
            >
              <Key className="w-4 h-4 mr-2" /> 生成 AI5- 授权码
            </button>
          </div>

          <div className="glass-card p-6 relative overflow-hidden group border-amber-500/30">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-amber-400/30 transition-colors"></div>
            <h3 className="text-xl font-bold text-white mb-2 relative z-10 drop-shadow-md">高级授权</h3>
            <p className="text-white/60 text-sm mb-6 relative z-10 font-medium">59.9元 / 1年无限次</p>
            <button 
              onClick={() => generateCode('1年')}
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl active:scale-95 transition-all flex items-center justify-center relative z-10 shadow-[0_4px_15px_rgba(245,158,11,0.3)] border border-amber-500/50"
            >
              <Key className="w-4 h-4 mr-2" /> 生成 AI1Y- 授权码
            </button>
          </div>
        </div>

        {/* List */}
        <div className="col-span-2 glass-card p-6 flex flex-col h-full overflow-hidden">
          <h3 className="text-xl font-bold text-white mb-6 drop-shadow-md">已生成的授权码</h3>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {codes.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-white/40">
                <ShieldCheck className="w-12 h-12 mb-4 opacity-50" />
                <p className="font-medium">暂无生成的授权码</p>
              </div>
            ) : (
              codes.map(record => (
                <motion.div 
                  key={record.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-colors group shadow-sm"
                >
                  <div>
                    <div className="flex items-center space-x-3 mb-1">
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-md border ${
                        record.type === '5次' 
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' 
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>
                        {record.type}
                      </span>
                      <span className="text-white font-mono font-bold tracking-wider">{record.code}</span>
                    </div>
                    <div className="text-xs text-white/40 font-medium">
                      生成时间: {record.createdAt.toLocaleTimeString()}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleCopy(record.code)}
                      className="p-2 text-white/50 hover:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                      title="复制"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(record.id)}
                      className="p-2 text-white/50 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
