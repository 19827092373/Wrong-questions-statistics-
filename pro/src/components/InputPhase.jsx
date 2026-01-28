import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import InputLane from './input/InputLane';
import InputProgress from './input/InputProgress';

// Main Input Phase Component
export default function InputPhase({ students, totalQuestions, onFinish }) {
  // Distribute students into 3 lanes
  const lanes = [[], [], []];
  students.forEach((student, index) => {
    lanes[index % 3].push(student);
  });

  const [results, setResults] = useState([]);

  const handleLaneResult = (result) => {
    setResults(prev => [...prev, result]);
  };

  useEffect(() => {
    if (results.length === students.length && students.length > 0) {
      const timer = setTimeout(() => onFinish(results), 500);
      return () => clearTimeout(timer);
    }
  }, [results, students, onFinish]);

  const progress = students.length > 0 ? Math.round((results.length / students.length) * 100) : 0;

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex-none flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 px-1">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <div className="w-2 h-8 bg-indigo-500 rounded-full shadow-indigo-glow" />
             <h2 className="text-3xl font-black tracking-tighter uppercase text-slate-900">
              录入控制台
            </h2>
          </div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">
            三通道同步录入系统
          </p>
        </div>

        <InputProgress 
          resultsCount={results.length}
          totalStudents={students.length}
          progress={progress}
        />
      </div>

      {/* Three Lanes */}
      <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6 min-h-0">
        {lanes.map((laneStudents, i) => (
          <InputLane
            key={i}
            laneId={i + 1}
            students={laneStudents}
            totalQuestions={totalQuestions}
            onLaneComplete={handleLaneResult}
          />
        ))}
      </div>
    </div>
  );
}
