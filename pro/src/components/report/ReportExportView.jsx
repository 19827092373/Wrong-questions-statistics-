import React from 'react';
import { cn } from '@/lib/utils';

export default function ReportExportView({ 
  exportRef, 
  questionStats, 
  totalStudents, 
  getErrorRateStyle 
}) {
  // Filter only questions with mistakes
  const questionsWithMistakes = questionStats
    .filter(q => q.count > 0)
    .sort((a, b) => a.qNum - b.qNum);

  return (
    <div className="fixed top-[-10000px] left-[-10000px] pointer-events-none z-[-1]">
      <div 
        ref={exportRef} 
        className="w-[1200px] bg-white p-12 space-y-10"
        style={{ fontFamily: "'Space Grotesk', 'DM Sans', sans-serif" }}
      >
        {/* Header inside the export image */}
        <div className="flex justify-between items-end border-b-4 border-slate-100 pb-8">
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight">学情诊断分析报告</h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest mt-3 text-lg">学情数据统计 • 深度诊断结果</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-black text-indigo-600 uppercase tracking-[0.2em]">数据快照</p>
            <p className="text-sm text-slate-400 font-bold mt-2">{new Date().toLocaleString('zh-CN', { hour12: false })}</p>
          </div>
        </div>

        {/* 3-Column Grid for Export */}
        <div className="grid grid-cols-3 gap-8">
          {questionsWithMistakes.map((q) => {
            const style = getErrorRateStyle(q.rate, q.count, totalStudents);
            
            return (
              <div 
                key={q.qNum}
                className="rounded-[2.5rem] border-2 border-slate-200 bg-white shadow-md overflow-hidden flex flex-col h-full"
              >
                {/* Card Header: Question Num and Count */}
                <div className={cn(
                  "px-8 py-6 flex items-center justify-between border-b-2",
                  style.bgGradient,
                  style.border,
                  style.text
                )}>
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-black tracking-tighter">第 {q.qNum} 题</span>
                  </div>
                  <div className="bg-white/60 px-4 py-1.5 rounded-2xl text-sm font-black shadow-sm border border-white/20">
                    {q.count} 人错误
                  </div>
                </div>

                {/* Card Body: Student Tags */}
                <div className="p-8 flex-grow bg-slate-50/30">
                  <div className="flex flex-wrap gap-3">
                    {q.students.map((student, idx) => (
                      <span 
                        key={idx}
                        className="px-5 py-2.5 rounded-2xl bg-white border-2 border-slate-200 shadow-sm text-lg font-black text-slate-800"
                      >
                        {student}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer inside image */}
        <div className="pt-10 border-t-4 border-slate-100 flex justify-between items-center text-slate-400">
          <p className="text-sm font-black uppercase tracking-widest">学情诊断系统 PRO • 智能分析助手</p>
          <div className="flex gap-6">
            <div className="flex items-center gap-2 text-xs font-black">
              <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm" /> 0-20% 优秀
            </div>
            <div className="flex items-center gap-2 text-xs font-black">
              <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-sm" /> 21-50% 预警
            </div>
            <div className="flex items-center gap-2 text-xs font-black">
              <div className="w-3 h-3 rounded-full bg-orange-400 shadow-sm" /> 51-70% 注意
            </div>
            <div className="flex items-center gap-2 text-xs font-black">
              <div className="w-3 h-3 rounded-full bg-red-400 shadow-sm" /> 71-100% 严重
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
