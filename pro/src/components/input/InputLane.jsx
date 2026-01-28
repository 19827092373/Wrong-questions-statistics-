import React, { useState } from 'react';
import { Check, User, Hash, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '@/lib/utils';

export default function InputLane({ laneId, students, totalQuestions, onLaneComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedWrong, setSelectedWrong] = useState(new Set());
  const [lastToggled, setLastToggled] = useState(null);

  const currentStudent = students[currentIndex];
  const isFinished = currentIndex >= students.length;

  const toggleQuestion = (num) => {
    const next = new Set(selectedWrong);
    if (next.has(num)) next.delete(num);
    else next.add(num);
    setSelectedWrong(next);
    setLastToggled(num);
    setTimeout(() => setLastToggled(null), 200);
  };

  const handleNext = () => {
    onLaneComplete({
      name: currentStudent,
      wrong: Array.from(selectedWrong).sort((a, b) => a - b)
    });
    setSelectedWrong(new Set());
    setCurrentIndex(prev => prev + 1);
  };

  if (isFinished) {
    return (
      <div className="h-full flex flex-col items-center justify-center glass-panel rounded-[2rem] p-8 text-center shadow-premium border-slate-100 bg-white/50 animate-scale-in">
        <div className="w-24 h-24 rounded-full bg-emerald-500/15 flex items-center justify-center mb-6 border-4 border-emerald-500/30 shadow-premium animate-pulse-subtle">
          <Check className="w-12 h-12 text-emerald-500" />
        </div>
        <h3 className="text-xl font-black mb-2 text-emerald-600">
          通道 {laneId} 完成
        </h3>
        <p className="text-xs font-black uppercase tracking-widest text-slate-500">等待其他通道...</p>
      </div>
    );
  }

  const getGridConfig = () => {
    if (totalQuestions <= 12) return { cols: 'grid-cols-3', fontSize: 'text-2xl' };
    if (totalQuestions <= 20) return { cols: 'grid-cols-4', fontSize: 'text-xl' };
    if (totalQuestions <= 30) return { cols: 'grid-cols-5', fontSize: 'text-lg' };
    return { cols: 'grid-cols-6', fontSize: 'text-base' };
  };

  const grid = getGridConfig();
  const laneColors = {
    1: 'indigo',
    2: 'violet',
    3: 'orange'
  };
  const color = laneColors[laneId];

  return (
    <div className="flex flex-col h-full glass-panel rounded-[2rem] overflow-hidden transition-all duration-500 shadow-premium border-slate-100 bg-white/50 backdrop-blur-xl hover:scale-[1.01]">
      {/* Header */}
      <div className="px-6 py-5 border-b bg-gradient-to-br from-slate-50 to-white border-slate-200 transition-all duration-500">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className={cn(
              'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 shadow-premium bg-indigo-50 border-indigo-200',
              color === 'violet' && 'bg-violet-50 border-violet-200',
              color === 'orange' && 'bg-orange-50 border-orange-200'
            )}>
              <User className={cn('w-6 h-6', `text-${color}-500`)} />
            </div>
            <div className="min-w-0">
              <div className="text-lg font-black truncate tracking-tight text-slate-900">
                {currentStudent}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  通道 {laneId}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-400 opacity-30" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {currentIndex + 1} / {students.length}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end">
             <div className={cn('flex items-center gap-1.5 font-black font-mono text-xl', selectedWrong.size > 0 ? 'text-red-500' : 'text-slate-400')}>
                {selectedWrong.size}
             </div>
             <div className="text-[8px] font-black uppercase tracking-widest text-slate-500 opacity-50">错题数</div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-grow p-4 flex items-center justify-center overflow-y-auto custom-scrollbar">
        <div className={cn('grid w-full gap-2', grid.cols)}>
          {Array.from({ length: totalQuestions }, (_, i) => i + 1).map(num => (
            <button
              key={num}
              onClick={() => toggleQuestion(num)}
              className={cn(
                'aspect-square flex items-center justify-center rounded-lg font-black transition-all duration-300 border-2 shadow-soft',
                selectedWrong.has(num)
                  ? 'bg-red-500 border-red-400 text-white shadow-premium scale-105 rotate-1 z-10'
                  : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-400 hover:text-slate-900'
              )}
              style={{ fontSize: grid.fontSize }}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Action */}
      <div className="p-6 pt-0">
        <Button
          onClick={handleNext}
          className={cn(
            'w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 shadow-premium',
            selectedWrong.size === 0
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'
          )}
        >
          <span className="flex items-center gap-2">
            {selectedWrong.size === 0 ? '全对 / 下一位' : `确认 ${selectedWrong.size} 道错题`}
            <ArrowRight className="w-4 h-4" />
          </span>
        </Button>
      </div>
    </div>
  );
}
