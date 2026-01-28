import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { ArrowRight, Sparkles, Settings2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import BasicSettings from './setup/BasicSettings';
import SamplingEngine from './setup/SamplingEngine';
import DataImporter from './setup/DataImporter';

export default function SetupPhase({ onNext, initialConfig }) {
  const { showToast, ToastContainer } = useToast();

  const [totalQuestions, setTotalQuestions] = useState(initialConfig?.totalQuestions || 20);
  const [studentNames, setStudentNames] = useState(initialConfig?.studentNames || '');
  const [sampleSize, setSampleSize] = useState(initialConfig?.sampleSize || 15);
  const [samplingMode, setSamplingMode] = useState(initialConfig?.samplingMode || 'fixed');
  const [ratios, setRatios] = useState(initialConfig?.ratios || [20, 20, 20, 20, 20]);
  
  // Privacy: Hide sampling config by default
  const [showSamplingConfig, setShowSamplingConfig] = useState(false);

  useEffect(() => {
    if (initialConfig) {
      setTotalQuestions(initialConfig.totalQuestions);

      setStudentNames(initialConfig.studentNames);
      setSampleSize(initialConfig.sampleSize || 15);
      setSamplingMode(initialConfig.samplingMode || 'fixed');
      setRatios(initialConfig.ratios || [20, 20, 20, 20, 20]);
    }
  }, [initialConfig]);

  const names = useMemo(() => studentNames
    .split(/[\n,，]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0), [studentNames]);
  
  const parsedCount = names.length;

  const totalRatio = useMemo(() => ratios.reduce((sum, r) => sum + r, 0), [ratios]);

  // Calculate segmented sampling details
  const segments = useMemo(() => {
    if (parsedCount === 0) return Array.from({ length: 5 }, (_, i) => ({ 
      label: ['前 20%', '20%-40%', '40%-60%', '60%-80%', '80%-后'][i],
      range: '待定',
      targetCount: 0,
      ratio: ratios[i]
    }));
    
    const size = Math.floor(parsedCount / 5);
    const remainder = parsedCount % 5;
    
    let currentPos = 0;
    const labels = ['前 20%', '20% - 40%', '40% - 60%', '60% - 80%', '80% - 后'];
    
    return Array.from({ length: 5 }, (_, i) => {
      const count = size + (i < remainder ? 1 : 0);
      const start = currentPos;
      const end = currentPos + count;
      currentPos = end;
      
      const ratio = ratios[i];
      const targetCount = Math.round((sampleSize * ratio) / 100);
      
      return {
        id: i,
        label: labels[i],
        range: `${start + 1}-${end}`,
        count,
        targetCount,
        ratio
      };
    });
  }, [parsedCount, sampleSize, ratios]);

  const handleRatioChange = (idx, val) => {
    const newRatios = [...ratios];
    newRatios[idx] = Math.max(0, Math.min(100, parseInt(val) || 0));
    setRatios(newRatios);
  };

  const handleNext = () => {
    if (names.length === 0) {
      showToast('请至少输入一名学生姓名', 'error');
      return;
    }

    const uniqueNames = new Set(names);
    if (uniqueNames.size !== names.length) {
      showToast('学生名单中有重复姓名,请检查', 'error');
      return;
    }

    const questionNum = parseInt(totalQuestions);
    if (isNaN(questionNum) || questionNum <= 0 || questionNum > 100) {
      showToast('题目数量必须在 1-100 之间', 'error');
      return;
    }

    const sampleNum = parseInt(sampleSize);
    if (isNaN(sampleNum) || sampleNum <= 0) {
      showToast('抽样人数必须至少为 1', 'error');
      return;
    }

    if (samplingMode === 'ratio' && totalRatio !== 100) {
      showToast('分段比例之和必须等于 100%', 'error');
      return;
    }

    onNext({
      totalQuestions: questionNum,
      studentNames,
      parsedNames: names,
      sampleSize: Math.min(sampleNum, names.length),
      samplingMode,
      ratios
    });
  };

  const quickSampleSizes = [10, 15, 20, 25];

  return (
    <>
      <ToastContainer />
      <div className="flex items-center justify-center min-h-full py-2 sm:py-6 animate-fade-in">
        <div className="w-full max-w-5xl px-4">
          {/* Main Container */}
          <div className="rounded-[2.5rem] overflow-hidden transition-all duration-500 shadow-premium animate-scale-in flex flex-col border bg-white border-slate-200/80 backdrop-blur-3xl">
            
            {/* Elegant Header */}
            <div className="px-8 py-6 border-b flex items-center justify-between border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-5">
                <div className="relative group">
                  <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-indigo-500 to-indigo-600 p-3.5 rounded-2xl shadow-premium">
                    <Sparkles className="w-6 h-6 text-white animate-pulse-subtle" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight flex items-center gap-2 text-slate-900">
                    参数配置
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 font-black tracking-widest uppercase shadow-soft">配置</span>
                  </h2>
                  <p className="text-xs font-bold text-slate-500">
                    开启一轮高效的学情诊断流程
                  </p>
                </div>
              </div>
            </div>

            {/* Split Content Area */}
            <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-100 max-h-[65vh]">
              
              {/* Left Panel: Settings (Scrollable) */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
                <BasicSettings 
                  totalQuestions={totalQuestions} 
                  setTotalQuestions={setTotalQuestions}
                  sampleSize={sampleSize}
                  setSampleSize={setSampleSize}
                  quickSampleSizes={quickSampleSizes}
                />

                {/* Privacy-Protected Sampling Engine */}
                <div className="border-t border-slate-100 pt-6">
                  <button 
                    onClick={() => setShowSamplingConfig(!showSamplingConfig)}
                    className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors group w-full"
                  >
                    <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-slate-200 transition-colors">
                      <Settings2 className="w-4 h-4" />
                    </div>
                    <span>高级抽样参数</span>
                    {showSamplingConfig ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
                  </button>

                  <div className={cn(
                    "grid transition-all duration-300 ease-in-out overflow-hidden",
                    showSamplingConfig ? "grid-rows-[1fr] opacity-100 mt-6" : "grid-rows-[0fr] opacity-0"
                  )}>
                    <div className="min-h-0">
                      <SamplingEngine 
                        samplingMode={samplingMode}
                        setSamplingMode={setSamplingMode}
                        ratios={ratios}
                        handleRatioChange={handleRatioChange}
                        segments={segments}
                        totalRatio={totalRatio}
                      />
                    </div>
                  </div>
                </div>
              </div>


              {/* Right Panel: Data Input */}
              <DataImporter 
                studentNames={studentNames}
                setStudentNames={setStudentNames}
                parsedCount={parsedCount}
              />

            </div>

            {/* Premium Footer Action */}
            <div className="p-8 border-t flex flex-col sm:flex-row items-center justify-between gap-6 shadow-premium bg-slate-50 border-slate-200">
              <div className="flex items-center gap-8 text-center sm:text-left">
                <div className="space-y-1">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">抽样总数</div>
                  <div className="text-3xl font-black font-mono leading-none text-indigo-600">
                    {Math.min(sampleSize, parsedCount) || 0}
                  </div>
                </div>
                <div className="w-px h-12 bg-slate-200" />
                <div className="space-y-1">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">题目数</div>
                  <div className="text-3xl font-black font-mono leading-none text-slate-900">
                    {totalQuestions}
                  </div>
                </div>
              </div>

              <Button
                onClick={handleNext}
                disabled={parsedCount === 0 || (samplingMode === 'ratio' && totalRatio !== 100)}
                className={cn(
                  "h-16 px-12 rounded-[1.5rem] font-black text-lg transition-all duration-500 group relative overflow-hidden shadow-indigo-glow",
                  parsedCount > 0 && (samplingMode === 'fixed' || totalRatio === 100)
                    ? "bg-indigo-600 text-white shadow-2xl hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98]"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                )}
              >
                <div className="relative z-10 flex items-center gap-3">
                  下一步：抽样预览
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </Button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
