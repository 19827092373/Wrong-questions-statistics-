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
  const [exportMode, setExportMode] = useState('question'); // 'question' | 'student'
  const [showPreview, setShowPreview] = useState(false);
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
      text: 'text-emerald-600 font-black',
      shadow: 'shadow-none',
      badge: 'bg-emerald-100 text-emerald-700 opacity-60'
    };

    // Low Error (1-20%) - Noticeable Yellow
    if (rate <= 20) {
      return {
        bgGradient: 'bg-amber-300', // Solid Amber
        border: 'border-amber-500 border-b-4', // Darker bottom for 3D effect
        text: 'text-black font-black',
        shadow: 'shadow-sm',
        badge: 'bg-amber-100 text-amber-900 border-2 border-amber-300 shadow-sm'
      };
    }

    // Medium Error (21-50%) - Vivid Orange
    if (rate <= 50) {
      return {
        bgGradient: 'bg-orange-400', // Solid Orange
        border: 'border-orange-600 border-b-4',
        text: 'text-black font-black',
        shadow: 'shadow-md',
        badge: 'bg-orange-100 text-orange-900 border-2 border-orange-300 shadow-sm'
      };
    }

    // High Error (51-70%) - Bright Red
    if (rate <= 70) {
      return {
        bgGradient: 'bg-red-500', // Solid Red
        border: 'border-red-700 border-b-4',
        text: 'text-black font-black',
        shadow: 'shadow-md',
        badge: 'bg-red-100 text-red-900 border-2 border-red-300 shadow-sm'
      };
    }

    // Critical Error (>70%) - Deep Rose/Red
    return {
      bgGradient: 'bg-rose-600', // Deep Rose
      border: 'border-rose-800 border-b-4',
      text: 'text-black font-black',
      shadow: 'shadow-lg',
      badge: 'bg-rose-100 text-rose-900 border-2 border-rose-300 font-black shadow-md'
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

  // Show Preview
  const handleShowPreview = () => {
    setShowPreview(true);
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
      link.download = `学情诊断分析报告_${exportMode === 'student' ? '按学生' : '按题号'}_${new Date().toISOString().slice(0, 10)}.png`;
      link.click();
      setShowPreview(false);
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
        exportMode={exportMode}
        questionStats={questionStats}
        studentDetails={studentDetails}
        totalStudents={totalStudents}
        totalQuestions={totalQuestions}
        getErrorRateStyle={getErrorRateStyle}
      />

      <ReportHeader
        totalStudents={totalStudents}
        totalQuestions={totalQuestions}
        sortMode={sortMode}
        setSortMode={setSortMode}
        handleExportCSV={handleExportCSV}
        handleExportImage={handleShowPreview}
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

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowPreview(false)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-6xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-black text-slate-900">导出预览</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all"
                >
                  ✕
                </button>
              </div>

              {/* Export Mode Selector */}
              <div className="flex gap-2">
                <button
                  onClick={() => setExportMode('question')}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                    exportMode === 'question'
                      ? "bg-indigo-600 text-white shadow-lg"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  按题号导出
                </button>
                <button
                  onClick={() => setExportMode('student')}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                    exportMode === 'student'
                      ? "bg-indigo-600 text-white shadow-lg"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  按学生导出
                </button>
              </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-auto p-6 bg-slate-50">
              <div className="transform scale-50 origin-top-left" style={{ width: '200%', height: '200%' }}>
                <div className="w-[1200px] bg-white p-12 space-y-10 shadow-xl rounded-2xl">
                  {/* Copy of Export View for Preview */}
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

                  <div className="grid grid-cols-3 gap-8">
                    {exportMode === 'question' ? (
                      questionStats.filter(q => q.count > 0).sort((a, b) => a.qNum - b.qNum).slice(0, 6).map((q) => {
                        const style = getErrorRateStyle(q.rate, q.count, totalStudents);
                        return (
                          <div key={q.qNum} className="rounded-[2.5rem] border-2 border-slate-200 bg-white shadow-md overflow-hidden">
                            <div className={cn("px-8 py-6 flex items-center justify-between border-b-2", style.bgGradient, style.border, style.text)}>
                              <span className="text-4xl font-black tracking-tighter">第 {q.qNum} 题</span>
                              <div className="bg-white/60 px-4 py-1.5 rounded-2xl text-sm font-black">{q.count} 人错误</div>
                            </div>
                            <div className="p-8 bg-slate-50/30">
                              <div className="flex flex-wrap gap-3">
                                {q.students.slice(0, 6).map((student, idx) => (
                                  <span key={idx} className="px-5 py-2.5 rounded-2xl bg-white border-2 border-slate-200 text-lg font-black text-slate-800">
                                    {student}
                                  </span>
                                ))}
                                {q.students.length > 6 && <span className="px-5 py-2.5 text-slate-400">...</span>}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      studentDetails.filter(s => s.wrongCount > 0).slice(0, 6).map((student, idx) => (
                        <div key={idx} className="rounded-[2.5rem] border-2 border-slate-200 bg-white shadow-md overflow-hidden">
                          <div className="px-8 py-6 border-b-2 bg-gradient-to-br from-indigo-500 to-indigo-600 border-indigo-700">
                            <div className="flex items-center justify-between">
                              <span className="text-3xl font-black text-white tracking-tight">{student.name}</span>
                              <div className="bg-white/90 px-4 py-1.5 rounded-2xl text-sm font-black">
                                <span className="text-red-600">{student.wrongCount}</span>
                                <span className="text-slate-400 text-xs ml-1">/{totalQuestions}</span>
                              </div>
                            </div>
                          </div>
                          <div className="p-8 bg-slate-50/30">
                            <div className="flex flex-wrap gap-3">
                              {student.wrong.sort((a, b) => a - b).slice(0, 8).map((qNum, qIdx) => (
                                <span key={qIdx} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-red-500 border-2 border-red-600 text-2xl font-black text-white">
                                  {qNum}
                                </span>
                              ))}
                              {student.wrong.length > 8 && <span className="text-slate-400">...</span>}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-200 bg-white flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowPreview(false)}
                className="rounded-xl px-6 font-bold"
              >
                取消
              </Button>
              <Button
                onClick={handleExportImage}
                disabled={isExporting}
                className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-6 font-bold shadow-indigo-glow"
              >
                {isExporting ? '导出中...' : '确认导出'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

