import React from 'react';
import { cn } from '@/lib/utils';

export default function InputProgress({ resultsCount, totalStudents, progress }) {
  return (
    <div className="flex items-center gap-6 rounded-2xl px-6 py-4 border transition-all duration-500 shadow-premium bg-white/80 border-slate-200/80 shadow-slate-200/50">
      <div className="text-right">
        <div className="font-black font-mono tracking-tighter text-slate-900" style={{ fontSize: '2.5rem', lineHeight: 1 }}>
          {resultsCount}
          <span className="text-sm text-slate-500 opacity-50 ml-1">/ {totalStudents}</span>
        </div>
        <div className="text-[10px] font-black uppercase tracking-[0.2em] mt-1 text-indigo-500/80">已完成</div>
      </div>
      
      <div className="w-px h-12 transition-colors duration-300 bg-slate-200" />

      <div className="w-48">
        <div className="flex justify-between items-end mb-2">
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">实时进度</span>
           <span className="font-black font-mono text-indigo-500">{progress}%</span>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden transition-colors duration-300 shadow-inner p-0.5 bg-slate-100">
          <div
            className="h-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-400 rounded-full transition-all duration-700 shadow-premium shadow-indigo-500/50"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
