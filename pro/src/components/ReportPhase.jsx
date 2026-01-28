import React, { useState, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { BarChart2, LayoutGrid, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import html2canvas from 'html2canvas';
import ReportHeader from './report/ReportHeader';
import QuestionGrid from './report/QuestionGrid';
import QuestionDetail from './report/QuestionDetail';
import ReportExportView from './report/ReportExportView';

export default function ReportPhase({ results = [], totalQuestions = 20, onReset }) {
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [sortMode, setSortMode] = useState('sequence'); // 'sequence' | 'errorRate'
  const [viewMode, setViewMode] = useState('question'); // 'question' | 'student'
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef(null);
  const exportViewRef = useRef(null);

  // Process Data
  const { questionStats, studentScores, totalStudents, studentDetails } = useMemo(() => {
    if (!results || results.length === 0) {
      return { questionStats: [], studentScores: {}, totalStudents: 0, studentDetails: [] };
    }

    // Question Stats
    const stats = Array.from({ length: Number(totalQuestions) }, (_, i) => {
      const qNum = i + 1;
      const wrongStudents = results.filter(r => r.wrong && r.wrong.includes(qNum));
      return {
        qNum,
        count: wrongStudents.length,
        students: wrongStudents.map(s => s.name),
        rate: Math.round((wrongStudents.length / results.length) * 100) || 0
      };
    });

    // Sort based on mode
    const sortedStats = [...stats];
    if (sortMode === 'errorRate') {
      sortedStats.sort((a, b) => b.count - a.count || a.qNum - b.qNum);
    } else {
      sortedStats.sort((a, b) => a.qNum - b.qNum);
    }

    // Student Scores and Details
    const scores = {};
    const details = results.map(r => {
      const wrongCount = r.wrong ? r.wrong.length : 0;
      const score = Math.round(((totalQuestions - wrongCount) / totalQuestions) * 100);
      scores[r.name] = score;
      return {
        name: r.name,
        wrong: r.wrong || [],
        score,
        wrongCount
      };
    }).sort((a, b) => b.wrongCount - a.wrongCount); // Sort by most wrong answers first

    return { 
      questionStats: sortedStats, 
      studentScores: scores, 
      totalStudents: results.length,
      studentDetails: details
    };
  }, [results, totalQuestions, sortMode]);

  // Get error rate color style - High Contrast "Solid Block" Style
  const getErrorRateStyle = (rate, count, total) => {
    // Perfect Score (0 errors) - Subtle & Clean
    if (rate === 0) return {
      bgGradient: 'bg-slate-50',
      border: 'border-slate-200 border-b-2', // Subtle depth
      text: 'text-slate-400',
      shadow: 'shadow-none',
      badge: 'bg-emerald-100 text-emerald-700 opacity-60'
    };

    // Low Error (1-20%) - Noticeable Yellow
    if (rate <= 20) {
      return {
        bgGradient: 'bg-amber-300', // Solid Amber
        border: 'border-amber-500 border-b-4', // Darker bottom for 3D effect
        text: 'text-amber-950 font-black',
        shadow: 'shadow-sm',
        badge: 'bg-white/90 text-amber-900 shadow-sm'
      };
    }

    // Medium Error (21-50%) - Vivid Orange
    if (rate <= 50) {
      return {
        bgGradient: 'bg-orange-400', // Solid Orange
        border: 'border-orange-600 border-b-4',
        text: 'text-white font-black drop-shadow-md', // White text with shadow
        shadow: 'shadow-md',
        badge: 'bg-white text-orange-700 shadow-sm'
      };
    }

    // High Error (51-70%) - Bright Red
    if (rate <= 70) {
      return {
        bgGradient: 'bg-red-500', // Solid Red
        border: 'border-red-700 border-b-4',
        text: 'text-white font-black drop-shadow-md',
        shadow: 'shadow-md',
        badge: 'bg-white text-red-700 shadow-sm'
      };
    }

    // Critical Error (>70%) - Deep Rose/Red
    return {
      bgGradient: 'bg-rose-600', // Deep Rose
      border: 'border-rose-800 border-b-4',
      text: 'text-white font-black drop-shadow-md',
      shadow: 'shadow-lg',
      badge: 'bg-white text-rose-800 font-black shadow-md'
    };
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!questionStats.length) return;

    const sortedBySequence = [...questionStats].sort((a, b) => a.qNum - b.qNum);
    const headers = ['题号', '错误人数', '错误率', '错误学生'];
    const rows = sortedBySequence.map(q => [
      `第${q.qNum}题`,
      q.count,
      `${q.rate}%`,
      `"${q.students.join(', ')}"`
    ]);

    const bom = '\uFEFF';
    const csvContent = bom + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `学情诊断报告_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Image
  const handleExportImage = async () => {
    if (!exportViewRef.current) return;

    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // More delay for complex layout

      const canvas = await html2canvas(exportViewRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `学情诊断分析报告_${new Date().toISOString().slice(0, 10)}.png`;
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
      alert('导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  // Empty state
  if (!results || results.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center animate-fade-in gap-4 text-slate-400">
        <div className="w-24 h-24 rounded-[2rem] flex items-center justify-center border border-slate-200 bg-slate-50 transition-all duration-500 shadow-premium">
          <BarChart2 className="w-12 h-12 text-indigo-400" />
        </div>
        <p className="text-lg font-black uppercase tracking-widest">暂无数据</p>
        <Button variant="outline" onClick={onReset} className="mt-4 rounded-xl px-8 font-black uppercase tracking-widest border-2">返回设置</Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col animate-fade-in gap-8 pb-10">
      {/* Hidden Export View */}
      <ReportExportView 
        exportRef={exportViewRef}
        questionStats={questionStats}
        totalStudents={totalStudents}
        getErrorRateStyle={getErrorRateStyle}
      />

      <ReportHeader 
        totalStudents={totalStudents}
        totalQuestions={totalQuestions}
        sortMode={sortMode}
        setSortMode={setSortMode}
        handleExportCSV={handleExportCSV}
        handleExportImage={handleExportImage}
        isExporting={isExporting}
        onReset={onReset}
      />

      {/* View Switcher */}
      <div className="flex justify-center -mt-4">
        <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200">
          <button
            onClick={() => setViewMode('question')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
              viewMode === 'question' 
                ? "bg-white text-indigo-600 shadow-sm" 
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <LayoutGrid className="w-4 h-4" />
            按题目分析
          </button>
          <button
            onClick={() => setViewMode('student')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
              viewMode === 'student' 
                ? "bg-white text-indigo-600 shadow-sm" 
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Users className="w-4 h-4" />
            按学生分析
          </button>
        </div>
      </div>

      <div ref={reportRef} className="flex-grow space-y-10">
        {viewMode === 'question' ? (
          <>
            <QuestionGrid 
              questionStats={questionStats}
              selectedQuestion={selectedQuestion}
              setSelectedQuestion={setSelectedQuestion}
              getErrorRateStyle={getErrorRateStyle}
            />

            {selectedQuestion && (
              <QuestionDetail 
                selectedQuestion={selectedQuestion}
                totalStudents={totalStudents}
                studentScores={studentScores}
                getErrorRateStyle={getErrorRateStyle}
              />
            )}
          </>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4">
            {studentDetails.map((student, idx) => (
              <div 
                key={idx}
                className={cn(
                  "p-6 rounded-2xl border transition-all duration-300 bg-white hover:shadow-lg hover:-translate-y-1 group",
                  student.wrongCount === 0 ? "border-emerald-200 shadow-colored-emerald" : "border-slate-200 shadow-soft"
                )}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="font-bold text-lg text-slate-800">{student.name}</div>
                  <div className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-black",
                    student.wrongCount === 0 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                  )}>
                    {student.wrongCount === 0 ? "全对" : `错 ${student.wrongCount} 题`}
                  </div>
                </div>
                
                {student.wrongCount > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {student.wrong.sort((a,b) => a-b).map(q => (
                      <span key={q} className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-600 font-bold text-sm border border-red-100">
                        {q}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium opacity-80">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    表现完美
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Legend - Only show in question view */}
        {viewMode === 'question' && (
          <div className="flex justify-center items-center gap-6 pt-4 text-[11px] font-black uppercase tracking-[0.2em] transition-colors duration-300 text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-200 border-2 border-emerald-400 shadow-sm" />
              <span>优秀 (0-20%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-yellow-200 border-2 border-yellow-400 shadow-sm" />
              <span>预警 (21-50%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-orange-200 border-2 border-orange-400 shadow-sm" />
              <span>注意 (51-70%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-red-200 border-2 border-red-400 shadow-sm" />
              <span>严重 (71-100%)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

