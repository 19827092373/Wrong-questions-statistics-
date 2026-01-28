import React from 'react';
import { Shuffle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SamplingEngine({ samplingMode, setSamplingMode, ratios, handleRatioChange, segments, totalRatio }) {
  return (
    <div className="space-y-6 pt-2">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-500/80 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
          权重引擎配置
        </h3>
        <div className="flex p-1 bg-slate-100 rounded-xl border border-transparent shadow-inner transition-all">
          <button
            onClick={() => setSamplingMode('fixed')}
            className={cn(
              "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
              samplingMode === 'fixed' 
                ? "bg-white text-indigo-500 shadow-premium" 
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            完全随机
          </button>
          <button
            onClick={() => setSamplingMode('ratio')}
            className={cn(
              "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
              samplingMode === 'ratio' 
                ? "bg-white text-indigo-500 shadow-premium" 
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            分段比率
          </button>
        </div>
      </div>

      {samplingMode === 'ratio' && (
        <div className="grid grid-cols-5 gap-3 animate-scale-in">
          {segments.map((seg, idx) => (
            <div key={idx} className="space-y-2 group">
              <div className="text-[8px] font-black text-center text-slate-400 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                {seg.label}
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={ratios[idx]}
                  onChange={(e) => handleRatioChange(idx, e.target.value)}
                  className="w-full h-11 text-center font-black font-mono text-sm rounded-xl border-2 transition-all shadow-soft focus:shadow-indigo-glow bg-white border-slate-100 focus:border-indigo-400 text-slate-900"
                />
                <div className="absolute -bottom-4 left-0 right-0 text-center text-[9px] font-black text-indigo-500/60">
                  {seg.targetCount}人
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {samplingMode === 'ratio' && (
        <div className={cn(
          "mt-8 p-3 rounded-xl border text-[10px] font-bold text-center transition-all shadow-premium",
          totalRatio === 100
            ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500"
            : "bg-red-500/5 border-red-500/20 text-red-500 animate-pulse"
        )}>
          {totalRatio === 100 
            ? "✓ 权重分配合理 (100%)" 
            : `权重总和必须为 100% (当前 ${totalRatio}%)`}
        </div>
      )}
    </div>
  );
}
