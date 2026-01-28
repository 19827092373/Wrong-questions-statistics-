import React from 'react';
import { FileDigit, Users } from 'lucide-react';
import { Input } from '../ui/Input';
import { cn } from '@/lib/utils';

export default function BasicSettings({ totalQuestions, setTotalQuestions, sampleSize, setSampleSize, quickSampleSizes }) {
  return (
    <div className="space-y-6">
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500/80 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.5)]" />
        基础诊断参数
      </h3>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-slate-500 ml-1">题目总数</label>
          <div className="relative group">
            <FileDigit className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <Input
              type="number"
              value={totalQuestions}
              onChange={(e) => setTotalQuestions(e.target.value)}
              className="h-12 pl-11 font-mono text-base border-2 border-transparent bg-slate-100 focus:bg-white transition-all rounded-xl shadow-soft focus:shadow-indigo-glow"
            />
          </div>
        </div>
        
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-slate-500 ml-1">抽样人数</label>
          <div className="relative group">
            <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <Input
              type="number"
              value={sampleSize}
              onChange={(e) => setSampleSize(e.target.value)}
              className="h-12 pl-11 font-mono text-base border-2 border-transparent bg-slate-100 focus:bg-white transition-all rounded-xl shadow-soft focus:shadow-indigo-glow"
            />
          </div>
        </div>
      </div>

      {/* Quick Pickers */}
      <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl shadow-inner">
        {quickSampleSizes.map(size => (
          <button
            key={size}
            onClick={() => setSampleSize(size)}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-300",
              sampleSize === size
                ? "bg-white text-indigo-600 shadow-premium scale-[1.02] border border-indigo-500/10"
                : "text-slate-500 hover:text-indigo-500"
            )}
          >
            {size} 人
          </button>
        ))}
      </div>
    </div>
  );
}
