import React, { useState } from 'react';
import Header from './components/Header/Header';
import StudentSelector from './components/StudentSelector/StudentSelector';
import ProblemMatrix from './components/ProblemMatrix/ProblemMatrix';
import WrongList from './components/WrongList/WrongList';
import ExportModal from './components/ExportModal/ExportModal';
import { Camera } from 'lucide-react';
import './App.scss';



function App() {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  return (
    <div className="app-container">
      <Header />

      <main className="main-content">
        <div className="layout-grid">
          {/* 左侧：学生点名 */}
          <section className="section-left">
            <StudentSelector />
          </section>

          {/* 中间：题号矩阵 */}
          <section className="section-center">
            <div className="matrix-wrapper">
              <ProblemMatrix />

              <button
                className="fab-export"
                onClick={() => setIsExportModalOpen(true)}
                title="导出统计图"
              >
                <Camera size={24} />
              </button>
            </div>
          </section>

          {/* 右侧：错题榜 */}
          <section className="section-right">
            <WrongList />
          </section>
        </div>
      </main>

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}

export default App;
