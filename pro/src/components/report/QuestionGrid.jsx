import React from 'react';
import { AlertTriangle, CheckCircle2, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function QuestionGrid({ questionStats, selectedQuestion, setSelectedQuestion, getErrorRateStyle }) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-3 sm:gap-4">
      {questionStats.map((q, idx) => {
        const style = getErrorRateStyle(q.rate, q.count, questionStats.length);
        const isSelected = selectedQuestion?.qNum === q.qNum;
        const isHighError = q.rate > 70;
        const isPerfect = q.count === 0;

        return (
          <button
            key={q.qNum}
            onClick={() => setSelectedQuestion(q)}
            className={cn(
              'group relative aspect-square rounded-xl border',
              'flex flex-col items-center justify-center p-2',
              'cursor-pointer overflow-hidden',
              'transition-all duration-200 ease-out',
              'hover:scale-105 hover:-translate-y-1',
              'active:scale-95 active:translate-y-0 active:border-b-0 active:mt-1', // Physical press effect
              style.bgGradient,
              style.border,
              style.shadow,
              isSelected && 'ring-4 ring-indigo-500/50 scale-105 -translate-y-1 z-20 !shadow-xl border-indigo-500',
              'animate-fade-in'
            )}
            style={{
              animationDelay: `${idx * 15}ms`,
            }}
          >
            {/* Inner Glow for 3D Plastic look */}
            <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20 pointer-events-none" />

            {/* Top Row: Error Count Label */}
            <div className="absolute top-2 right-2 left-2 flex justify-between items-start z-10">
               {/* High Error Icon - White for contrast */}
               {isHighError ? (
                  <AlertTriangle className="w-5 h-5 text-white animate-pulse drop-shadow-md" />
               ) : isPerfect ? (
                  <CheckCircle2 className="w-4 h-4 text-slate-300" />
               ) : <span />}

               {/* Error Count Badge */}
               {!isPerfect && (
                 <div className={cn(
                   "flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-black uppercase tracking-tight shadow-sm transition-transform group-hover:scale-110",
                   style.badge
                 )}>
                   <span>{q.count}</span>
                   <User className="w-3 h-3" />
                 </div>
               )}
            </div>

            {/* Center: Question Number */}
            <div className={cn(
              'font-black tracking-tighter leading-none relative z-10 mt-1',
              'transition-all duration-300 group-hover:scale-110',
              style.text
            )} style={{
              fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)'
            }}>
              {q.qNum}
            </div>

            {/* Bottom: Error Rate Label (Only for non-perfect) */}
            {q.count > 0 && (
              <div className={cn(
                "absolute bottom-2 text-[10px] font-black uppercase tracking-wide opacity-90 drop-shadow-sm z-10",
                style.text
              )}>
                {q.rate}% 错误
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

