import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Play, Loader2, Users, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PickingPhase({ allStudents, sampleSize, samplingMode, ratios, onNext }) {
  const [picked, setPicked] = useState([]);
  const [isPicking, setIsPicking] = useState(true);
  const [displayList, setDisplayList] = useState([]);

  useEffect(() => {
    // Reset states at the start
    setDisplayList([]);
    setIsPicking(true);

    let selected = [];
    
    if (samplingMode === 'ratio' && ratios) {
      const parsedCount = allStudents.length;
      const partSize = Math.floor(parsedCount / 5);
      const remainder = parsedCount % 5;
      
      let currentPos = 0;
      let totalTarget = 0;
      const segmentPlans = [];

      // Step 1: Initial Allocation (Clamped by segment size)
      for (let i = 0; i < 5; i++) {
        const count = partSize + (i < remainder ? 1 : 0);
        const segmentStudents = allStudents.slice(currentPos, currentPos + count);
        currentPos += count;
        
        // Calculate raw target based on ratio
        let rawTarget = Math.round((sampleSize * ratios[i]) / 100);
        
        // Clamp target to actual segment size (Fix for "Not enough students in segment")
        let actualTarget = Math.min(rawTarget, count);

        totalTarget += actualTarget;
        segmentPlans.push({ 
          students: segmentStudents, 
          target: actualTarget,
          capacity: count 
        });
      }

      // Step 2: Global Adjustment (Fill the gap)
      let diff = sampleSize - totalTarget;
      
      // Safety break to prevent infinite loops if sampleSize > total students
      const maxPossible = allStudents.length;
      if (sampleSize > maxPossible) {
        diff = maxPossible - totalTarget; // Adjust goal to max possible
      }

      let attempts = 0;
      while (diff !== 0 && attempts < 100) {
        attempts++;
        
        // Try to distribute diff across segments
        // We prioritize segments with higher ratios for adding, or just round robin
        for (let i = 0; i < 5 && diff !== 0; i++) {
          if (diff > 0) {
            // Need more students: Find a segment that has room
            if (segmentPlans[i].target < segmentPlans[i].capacity) {
              segmentPlans[i].target++;
              diff--;
            }
          } else if (diff < 0) {
            // Need fewer students: Find a segment that has allocation
            if (segmentPlans[i].target > 0) {
              segmentPlans[i].target--;
              diff++;
            }
          }
        }
      }


      // Step 3: Sampling
      segmentPlans.forEach(plan => {
        if (plan.target > 0) {
          const shuffledSegment = [...plan.students];
          for (let j = shuffledSegment.length - 1; j > 0; j--) {
            const k = Math.floor(Math.random() * (j + 1));
            [shuffledSegment[j], shuffledSegment[k]] = [shuffledSegment[k], shuffledSegment[j]];
          }
          selected = [...selected, ...shuffledSegment.slice(0, Math.min(plan.target, plan.students.length))];
        }
      });

      for (let i = selected.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [selected[i], selected[j]] = [selected[j], selected[i]];
      }
    } else {
      const shuffled = [...allStudents];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      selected = shuffled.slice(0, sampleSize);
    }

    const revealedStudents = [];
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < selected.length) {
        revealedStudents.push(selected[currentIndex]);
        setDisplayList([...revealedStudents]);
        currentIndex++;

        if (currentIndex >= selected.length) {
          setPicked(selected);
          setIsPicking(false);
          clearInterval(interval);
        }
      }
    }, 60); // Faster reveal

    return () => clearInterval(interval);
  }, [allStudents, sampleSize, samplingMode, ratios]);

  const progress = Math.round((displayList.length / sampleSize) * 100);

  return (
    <div className="flex flex-col items-center justify-center h-full animate-fade-in px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6 shadow-premium">
          {isPicking ? (
            <>
              <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
              <span className="font-black text-[10px] uppercase tracking-[0.2em] text-indigo-500">正在抽样</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-emerald-500 fill-emerald-500" />
              <span className="font-black text-[10px] uppercase tracking-[0.2em] text-emerald-500">抽样完成</span>
            </>
          )}
        </div>

        <h2 className="text-4xl sm:text-6xl font-black tracking-tighter mb-4 uppercase text-slate-900">
          {isPicking ? '锁定目标' : '准备就绪'}
        </h2>

        <p className="text-sm font-black uppercase tracking-widest text-slate-400">
          已从 <span className="text-slate-700">{allStudents.length}</span> 名候选人中选出 <span className="text-indigo-500">{sampleSize}</span> 名
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-2xl mb-12">
        <div className="flex justify-between items-end mb-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">抽样进度</span>
          <span className="font-black font-mono text-indigo-500">{displayList.length} / {sampleSize}</span>
        </div>
        <div className="h-3 bg-slate-200 rounded-full overflow-hidden p-0.5 shadow-inner">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500 shadow-premium shadow-indigo-500/40',
              isPicking ? 'bg-indigo-600' : 'bg-emerald-500'
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="w-full max-w-5xl glass-panel rounded-[2.5rem] p-8 mb-12 max-h-[45vh] overflow-y-auto custom-scrollbar shadow-premium border-slate-100 bg-white/50 backdrop-blur-xl">
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
          {Array.from({ length: sampleSize }).map((_, i) => {
            const student = displayList[i];
            const isRevealed = !!student;

            return (
              <div
                key={i}
                className={cn(
                  'relative flex items-center justify-center p-6 rounded-2xl font-black transition-all duration-500 overflow-hidden border shadow-soft',
                  isRevealed
                    ? 'bg-slate-800 border-white/10 text-white animate-scale-in'
                    : 'bg-slate-100 border-transparent text-transparent animate-pulse-subtle',
                  isRevealed && 'hover:scale-105 hover:shadow-premium hover:border-indigo-500/30'
                )}
                style={{
                  animationDelay: isRevealed ? `${i * 20}ms` : '0ms',
                }}
              >
                {!isRevealed && <div className="absolute inset-0 animate-shimmer" />}
                <span className="relative z-10 truncate text-sm uppercase tracking-wider">
                  {student || '---'}
                </span>
                <div className={cn(
                  'absolute top-2 right-2 w-5 h-5 rounded-lg flex items-center justify-center text-[8px] font-black border transition-all duration-500',
                  isRevealed ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400' : 'bg-slate-200 border-transparent text-slate-500'
                )}>
                  {i + 1}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action */}
      <Button
        onClick={() => onNext(picked)}
        disabled={isPicking}
        className={cn(
          'h-20 px-16 rounded-[2rem] font-black text-xl uppercase tracking-[0.2em] transition-all duration-500 shadow-premium',
          isPicking
            ? 'bg-slate-200 text-slate-400'
            : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-105 active:scale-95 shadow-indigo-500/40'
        )}
      >
        {isPicking ? '正在抽样...' : '进入录入'}
      </Button>
    </div>
  );
}
