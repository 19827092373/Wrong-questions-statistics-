import React from 'react';
import { Users, AlertTriangle, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function QuestionDetail({ selectedQuestion, totalStudents, studentScores, getErrorRateStyle }) {
  const style = getErrorRateStyle(selectedQuestion.rate, selectedQuestion.count, totalStudents);

  return (
    <div className="glass-panel rounded-[2.5rem] overflow-hidden animate-scale-in border border-slate-200/60 shadow-xl bg-white/50 backdrop-blur-xl">
      {/* Detail Header */}
      <div className="p-8 sm:p-10 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-white/50">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-8">
            <div className={cn(
              'w-20 h-20 sm:w-24 sm:h-24 rounded-[2rem] flex items-center justify-center border-4 transition-all duration-500 hover:rotate-6 hover:scale-110 shadow-lg',
              style.bgGradient,
              style.border,
              style.text
            )}>
              <span className="text-4xl sm:text-5xl font-black tracking-tighter">{selectedQuestion.qNum}</span>
            </div>
            <div className="text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-3">
                <span className="px-3 py-1 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase tracking-[0.2em] shadow-sm">
                  诊断详情
                </span>
                {selectedQuestion.rate > 70 && (
                  <span className="px-3 py-1 rounded-full text-[10px] font-black bg-red-500 text-white flex items-center gap-1.5 animate-pulse-glow shadow-md border border-red-400">
                    <AlertTriangle className="w-3 h-3" />
                    严重错误
                  </span>
                )}
              </div>
              <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
                第 {selectedQuestion.qNum} 题深度诊断结果
              </h3>
            </div>
          </div>

          <div className="text-center sm:text-right">
            <div className={cn('text-5xl sm:text-7xl font-black font-mono leading-none tracking-tighter drop-shadow-sm', style.text)}>
              {selectedQuestion.rate}%
            </div>
            <div className="text-xs mt-3 font-bold uppercase tracking-[0.2em] text-slate-400">
              {selectedQuestion.count} 人错误 / 共 {totalStudents} 人
            </div>
          </div>
        </div>
      </div>

      {/* Student List */}
      <div className="p-8 sm:p-10 bg-slate-50/30">
        <div className="flex items-center justify-between mb-8">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 text-slate-400">
            <Users className="w-4 h-4 text-indigo-500" />
            错题名单 ({selectedQuestion.students.length})
          </h4>
        </div>

        {selectedQuestion.students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-[3rem] border-2 border-dashed border-emerald-100 bg-emerald-50/20 shadow-inner">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-4xl mb-4 animate-bounce">✨</div>
            <p className="text-emerald-600 font-black uppercase tracking-widest text-sm">零错误 - 完美表现</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {selectedQuestion.students.map((name, idx) => {
              const score = studentScores[name];
              const isElite = score >= 80;

              return (
                <div
                  key={name}
                  className={cn(
                    'group relative flex items-center justify-between px-5 py-4 rounded-2xl text-sm font-black transition-all duration-300 border hover:-translate-y-1 hover:shadow-xl',
                    isElite
                      ? 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 text-amber-700 shadow-md shadow-amber-100'
                      : 'bg-white border-slate-200 text-slate-800 shadow-sm hover:border-indigo-200'
                  )}
                  style={{
                    animationDelay: `${idx * 20}ms`
                  }}
                >
                  <span className="truncate pr-2 relative z-10">{name}</span>
                  {isElite && (
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0 animate-pulse-subtle z-10" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
