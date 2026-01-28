import React from 'react';
import { Users, SortAsc, BarChart2, FileText, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '@/lib/utils';

export default function ReportHeader({ 
  totalStudents, 
  totalQuestions, 
  sortMode, 
  setSortMode, 
  handleExportCSV, 
  handleExportImage, 
  isExporting, 
  onReset 
}) {
  return (
    <div className="flex-none flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1">
      <div>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
          学情诊断报告
        </h2>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-soft bg-indigo-50 text-indigo-600 border-indigo-200">
            <Users className="w-3 h-3" />
            {totalStudents} 名学生
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-soft bg-slate-100 text-slate-600 border-slate-200">
            {totalQuestions} 道题目
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {/* Sort Toggle */}
        <div className="flex rounded-xl p-1 border shadow-soft transition-all duration-300 bg-slate-100/80 border-slate-200">
          <button
            onClick={() => setSortMode('sequence')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-200 flex items-center gap-1.5',
              sortMode === 'sequence'
                ? 'bg-white text-indigo-600 shadow-premium'
                : 'text-slate-500 hover:text-slate-800'
            )}
          >
            <SortAsc className="w-3.5 h-3.5" />
            题号
          </button>
          <button
            onClick={() => setSortMode('errorRate')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-200 flex items-center gap-1.5',
              sortMode === 'errorRate'
                ? 'bg-white text-indigo-600 shadow-premium'
                : 'text-slate-500 hover:text-slate-800'
            )}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            错误率
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="rounded-xl text-[10px] font-black uppercase tracking-wider h-9 shadow-soft border-slate-200 hover:bg-slate-50 text-slate-600"
          >
            <FileText className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
            CSV
          </Button>
          <Button
            size="sm"
            onClick={handleExportImage}
            disabled={isExporting}
            className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-glow h-9 rounded-xl text-[10px] font-black uppercase tracking-widest px-4 transition-all hover:scale-105 active:scale-95"
          >
            <ImageIcon className="w-3.5 h-3.5 mr-1.5" />
            {isExporting ? '导出中...' : '图片'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="rounded-xl text-[10px] font-black uppercase tracking-wider h-9 shadow-soft border-slate-200 hover:bg-slate-50 text-slate-600"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-orange-500" />
            重置
          </Button>
        </div>
      </div>
    </div>
  );
}
