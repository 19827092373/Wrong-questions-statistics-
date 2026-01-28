import React from 'react';
import { Info } from 'lucide-react';
import { Textarea } from '../ui/Textarea';
import { cn } from '@/lib/utils';

export default function DataImporter({ studentNames, setStudentNames, parsedCount }) {
  return (
    <div className="flex-grow flex flex-col p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/80 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          学生名单导入
        </h3>
        <div className={cn(
          "px-3 py-1 rounded-full text-[10px] font-black font-mono border shadow-soft transition-all",
          parsedCount > 0
            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-emerald-500/5"
            : "bg-slate-100 text-slate-400 border-transparent"
        )}>
          数量: {parsedCount}
        </div>
      </div>

      <div className="flex-grow relative group">
        <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-0 group-focus-within:opacity-[0.03] transition-opacity pointer-events-none" />
        <Textarea
          value={studentNames}
          onChange={(e) => setStudentNames(e.target.value)}
          placeholder="在此输入或粘贴学生名单...&#10;支持 Excel 复制、逗号分隔、换行分隔。"
          className="h-full min-h-[300px] p-5 font-mono text-sm leading-relaxed resize-none border-2 border-transparent transition-all rounded-2xl focus:ring-0 shadow-soft focus:shadow-premium bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-emerald-100"
        />
        
        {/* Floating Instruction */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 rounded-lg backdrop-blur-md border border-indigo-500/20 shadow-premium">
            <Info className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[9px] font-black text-indigo-500 uppercase">智能解析中</span>
          </div>
        </div>
      </div>
    </div>
  );
}
