import React from 'react';
import { cn } from '@/lib/utils';

export default function ReportExportView({
  exportRef,
  exportMode = 'question',
  questionStats,
  studentDetails = [],
  totalStudents,
  totalQuestions,
  getErrorRateStyle
}) {
  // Filter only questions with mistakes
  const questionsWithMistakes = questionStats
    .filter(q => q.count > 0)
    .sort((a, b) => a.qNum - b.qNum);

  // Filter students with mistakes
  const studentsWithMistakes = studentDetails
    .filter(s => s.wrongCount > 0)
    .sort((a, b) => b.wrongCount - a.wrongCount);

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
            <p className="text-slate-400 font-bold uppercase tracking-widest mt-3 text-lg">
              {exportMode === 'student' ? '按学生统计 • 错题分布' : '按题号统计 • 学情分析'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xl font-black text-indigo-600 uppercase tracking-[0.2em]">数据快照</p>
            <p className="text-sm text-slate-400 font-bold mt-2">{new Date().toLocaleString('zh-CN', { hour12: false })}</p>
          </div>
        </div>

        {/* Content - Question Mode */}
        {exportMode === 'question' && (
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
        )}

        {/* Content - Student Mode */}
        {exportMode === 'student' && (
          <div className="grid grid-cols-3 gap-8">
            {studentsWithMistakes.map((student, idx) => (
              <div
                key={idx}
                className="rounded-[2.5rem] border-2 border-slate-200 bg-white shadow-md overflow-hidden flex flex-col h-full"
              >
                {/* Card Header: Student Name and Score */}
                <div className="px-8 py-6 border-b-2 bg-gradient-to-br from-indigo-500 to-indigo-600 border-indigo-700">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black text-white tracking-tight">{student.name}</span>
                    <div className="bg-white/90 px-4 py-1.5 rounded-2xl text-sm font-black shadow-sm">
                      <span className="text-red-600">{student.wrongCount}</span>
                      <span className="text-slate-400 text-xs ml-1">/{totalQuestions}</span>
                    </div>
                  </div>
                </div>

                {/* Card Body: Question Tags */}
                <div className="p-8 flex-grow bg-slate-50/30">
                  <div className="flex flex-wrap gap-3">
                    {student.wrong.sort((a, b) => a - b).map((qNum, qIdx) => (
                      <span
                        key={qIdx}
                        className="w-14 h-14 flex items-center justify-center rounded-2xl bg-red-500 border-2 border-red-600 shadow-md text-2xl font-black text-white"
                      >
                        {qNum}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

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
