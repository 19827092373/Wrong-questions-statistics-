import React, { useState } from 'react';
import SetupPhase from './components/SetupPhase';
import PickingPhase from './components/PickingPhase';
import InputPhase from './components/InputPhase';
import ReportPhase from './components/ReportPhase';
import { useLocalStorage } from './hooks/useLocalStorage';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { BarChart3, Settings, Users, Keyboard, CheckCircle } from 'lucide-react';
import { cn } from './lib/utils';

// Stage Configuration
const STAGES = {
  setup: { label: '参数设置', icon: Settings, color: 'indigo' },
  picking: { label: '随机抽样', icon: Users, color: 'violet' },
  input: { label: '极速录入', icon: Keyboard, color: 'orange' },
  report: { label: '诊断报告', icon: BarChart3, color: 'emerald' }
};

const STAGE_ORDER = ['setup', 'picking', 'input', 'report'];

function AppContent() {
  // Use Theme Context
  const { theme, toggleTheme } = useTheme();

  // Application State
  const [stage, setStage] = useState('setup');
  const [config, setConfig] = useLocalStorage('student-stats-config', {
    totalQuestions: 20,
    studentNames: '',
    parsedNames: [],
    sampleSize: 15,
    samplingMode: 'fixed', // 'fixed' | 'ratio'
    ratios: [30, 30, 30, 30, 30] // Default 30% for 5 segments
  });

  // Session State - Now with persistence
  const [selectedStudents, setSelectedStudents] = useLocalStorage('selected-students', []);
  const [results, setResults] = useLocalStorage('session-results', []);

  // Handlers
  const handleSetupComplete = (newConfig) => {
    setConfig(newConfig);
    setStage('picking');
  };

  const handlePickComplete = (pickedStudents) => {
    setSelectedStudents(pickedStudents);
    setStage('input');
  };

  const handleInputComplete = (sessionResults) => {
    setResults(sessionResults);
    setStage('report');
  };

  const handleReset = () => {
    if (confirm('确定要开始新的一轮统计吗？当前数据将会丢失。')) {
      setStage('setup');
      setResults([]);
      setSelectedStudents([]);
    }
  };

  const currentStageIndex = STAGE_ORDER.indexOf(stage);
  const StageIcon = STAGES[stage]?.icon || Settings;

  return (
    <div className="min-h-screen text-foreground flex flex-col selection:bg-indigo-500/30">
      {/* Header */}
      <header className="border-b backdrop-blur-xl sticky top-0 z-50 flex-none transition-colors duration-300 border-slate-200/60 bg-white/80">
        <div className="flex h-16 items-center justify-between px-6 max-w-[1800px] mx-auto w-full">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 blur-xl rounded-full transition-colors duration-300 bg-indigo-400/30" />
              <div className="relative bg-gradient-to-br from-indigo-500 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-none text-slate-800">
                学情诊断系统
                <span className="ml-1.5 text-indigo-500 font-medium">Pro</span>
              </h1>
              <p className="text-[10px] uppercase tracking-widest mt-0.5 text-slate-400">
                教学诊断系统
              </p>
            </div>
          </div>

          {/* Center - Stage Indicator */}
          <div className="flex items-center gap-2">
            {STAGE_ORDER.map((s, idx) => {
              const StageIconComponent = STAGES[s].icon;
              const isActive = s === stage;
              const isCompleted = idx < currentStageIndex;

              return (
                <div key={s} className="flex items-center">
                  <div
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 border',
                      isActive && 'bg-indigo-500/15 border-indigo-500/30',
                      isCompleted && 'bg-emerald-500/10 border-emerald-500/20',
                      !isActive && !isCompleted && 'opacity-50'
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <StageIconComponent className={cn(
                        'w-4 h-4',
                        isActive ? 'text-indigo-500' : 'text-slate-400'
                      )} />
                    )}
                    <span className={cn(
                      'text-sm font-medium hidden sm:inline',
                      isActive ? 'text-indigo-600' : isCompleted ? 'text-emerald-500' : 'text-slate-400'
                    )}>
                      {STAGES[s].label}
                    </span>
                  </div>
                  {idx < STAGE_ORDER.length - 1 && (
                    <div className={cn(
                      'w-8 h-px mx-1 transition-colors duration-300',
                      idx < currentStageIndex ? 'bg-emerald-500/50' : 'bg-slate-200'
                    )} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Right - App Info */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-100/50 shadow-sm transition-all duration-300">
            <CheckCircle className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-semibold text-indigo-700">系统已就绪</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow min-h-0 overflow-hidden relative">
        {/* Ambient Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] blur-[120px] rounded-full transition-colors duration-300 bg-indigo-400/10" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[400px] blur-[100px] rounded-full transition-colors duration-300 bg-orange-400/8" />
        </div>

        {/* Content Container */}
        <div className="relative h-full max-w-[1800px] mx-auto p-4 md:p-6 overflow-y-auto custom-scrollbar">
          {stage === 'setup' && (
            <SetupPhase
              onNext={handleSetupComplete}
              initialConfig={config}
            />
          )}

          {stage === 'picking' && (
            <PickingPhase
              allStudents={config.parsedNames}
              sampleSize={config.sampleSize}
              samplingMode={config.samplingMode}
              ratios={config.ratios}
              onNext={handlePickComplete}
            />
          )}

          {stage === 'input' && (
            <InputPhase
              students={selectedStudents}
              totalQuestions={config.totalQuestions}
              onFinish={handleInputComplete}
            />
          )}

          {stage === 'report' && (
            <ReportPhase
              results={results}
              totalQuestions={config.totalQuestions}
              onReset={handleReset}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
