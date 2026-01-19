import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useClassroomStore = create(
  persist(
    (set, get) => ({
      // 学生数据
      students: [],
      calledStudents: [],

      // 题目数据
      problems: {}, // { "1": 5, "2": 1 }
      relatedProblems: {}, // { "1": [2, 3] }
      problemCount: 20,

      // 设置数据
      settings: {
        pickRatios: [10, 15, 25, 25, 25], // 5组抽取权重 (A-E)
        animationSpeed: 'medium', // 'fast' | 'medium' | 'slow'
        hotThreshold: 4, // 高频错题阈值
        soundEnabled: true,
        zoomLevel: 1 // 页面缩放比例
      },

      // ---------- Actions: 学生相关 ----------

      // 添加学生 (批量)
      addStudents: (names) => set((state) => {
        const newNames = names.filter(n => n.trim() && !state.students.includes(n.trim()));
        return {
          students: [...state.students, ...newNames]
        };
      }),

      // 清空学生列表
      clearStudents: () => set({ students: [], calledStudents: [] }),

      // 添加已点名学生记录
      addCalledStudent: (studentName) => set((state) => ({
        calledStudents: [
          { name: studentName, time: new Date().toISOString() },
          ...state.calledStudents
        ]
      })),

      // 清空点名记录
      clearCalledStudents: () => set({ calledStudents: [] }),

      // ---------- Actions: 题目相关 ----------

      // 设置题目总数
      setProblemCount: (count) => set({ problemCount: count }),

      // 增加题目错误计数
      incrementProblem: (problemNum) => set((state) => {
        const numStr = problemNum.toString();
        const currentCount = state.problems[numStr] || 0;
        const newProblems = {
          ...state.problems,
          [numStr]: currentCount + 1
        };

        // 查找相关题目逻辑 (前后2题范围内)
        const pNum = Number(problemNum);
        const related = [];
        for (let i = Math.max(1, pNum - 2); i <= pNum + 2; i++) {
          // 只要有错误记录(>0)且不是自己，就算相关
          if (i !== pNum && newProblems[i] && newProblems[i] > 0) {
            related.push(i);
          }
        }

        const newRelatedProblems = { ...state.relatedProblems };
        if (related.length > 0) {
          newRelatedProblems[numStr] = related;
        }

        return {
          problems: newProblems,
          relatedProblems: newRelatedProblems
        };
      }),

      // 重置所有题目数据
      resetProblems: () => set({ problems: {}, relatedProblems: {} }),

      // 设置关联题目 (比如长按时发现的关联)
      setRelatedProblems: (problemNum, relatedList) => set((state) => ({
        relatedProblems: {
          ...state.relatedProblems,
          [problemNum]: relatedList
        }
      })),

      // ---------- Actions: 设置相关 ----------

      // 更新设置
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),

      // 重置设置为默认值
      resetSettings: () => set({
        settings: {
          pickRatios: [10, 15, 25, 25, 25],
          animationSpeed: 'medium',
          hotThreshold: 4,
          soundEnabled: true,
          zoomLevel: 1
        }
      }),
    }),
    {
      name: 'classroomWrongProblemsData', // localStorage key
      partialize: (state) => ({
        students: state.students,
        calledStudents: state.calledStudents,
        problems: state.problems,
        relatedProblems: state.relatedProblems,
        problemCount: state.problemCount,
        settings: state.settings
      }),
    }
  )
);
