import React, { useState } from 'react';
import { useClassroomStore } from '../../stores/useClassroomStore';
import { ListOrdered, TrendingUp, AlertTriangle, RotateCcw } from 'lucide-react';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import './WrongList.scss';

const WrongList = () => {
    const { problems, resetProblems, problemCount } = useClassroomStore();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    // 计算统计数据
    const wrongEntries = Object.entries(problems)
        // 过滤掉超出当前题号范围的数据，并只显示有错误的数据
        .filter(([key, count]) => {
            const num = parseInt(key);
            return num <= problemCount && count > 0;
        })
        .sort((a, b) => b[1] - a[1]); // 按错误次数降序

    const totalWrongs = wrongEntries.reduce((acc, [_, count]) => acc + count, 0);
    const hotProblems = wrongEntries.filter(([_, count]) => count >= 4).length;

    return (
        <div className="wrong-list-panel">
            <div className="panel-header">
                <div className="title">
                    <ListOrdered size={20} />
                    <span>错题榜</span>
                </div>
                <button
                    className="reset-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsConfirmOpen(true);
                    }}
                    title="重置统计"
                >
                    <RotateCcw size={18} />
                </button>
            </div>

            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={resetProblems}
                title="重置错题统计"
                message="确定要清空所有错题记录吗？此操作无法撤销，所有题目的计数将归零。"
                type="danger"
                confirmText="确定重置"
            />

            <div className="stats-cards">
                <div className="stat-card blue">
                    <div className="label">总错误</div>
                    <div className="value">{totalWrongs}</div>
                    <TrendingUp size={16} className="icon" />
                </div>
                <div className="stat-card red">
                    <div className="label">高频错题</div>
                    <div className="value">{hotProblems}</div>
                    <AlertTriangle size={16} className="icon" />
                </div>
            </div>

            <div className="list-content">
                {wrongEntries.length === 0 ? (
                    <div className="empty-state">
                        <div className="illustration">🎉</div>
                        <p>太棒了！目前没有错题。</p>
                    </div>
                ) : (
                    <div className="wrong-items">
                        {wrongEntries.map(([num, count], index) => (
                            <div
                                key={num}
                                className={`wrong-item animate-slide-right ${index < 3 ? 'top-3' : ''}`}
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <div className="rank">{index + 1}</div>
                                <div className="problem-num">第 {num} 题</div>
                                <div className="error-bar-container">
                                    <div
                                        className="error-bar"
                                        style={{ width: `${Math.min(100, (count / (wrongEntries[0][1] || 1)) * 100)}%` }}
                                    ></div>
                                </div>
                                <div className="count-badge">{count}次</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WrongList;
