import React, { useState, useRef, useEffect } from 'react';
import { useClassroomStore } from '../../stores/useClassroomStore';
import { Users, UserPlus, Upload, Trash2, RotateCcw, Save } from 'lucide-react';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import './StudentSelector.scss';

const StudentSelector = () => {
    const {
        students,
        addStudents,
        clearStudents,
        addCalledStudent,
        calledStudents,
        clearCalledStudents
    } = useClassroomStore();

    const [isImporting, setIsImporting] = useState(false);
    const [importText, setImportText] = useState('');
    const [pickCount, setPickCount] = useState(1);
    const [highlightedIndices, setHighlightedIndices] = useState([]);
    const [isAnimating, setIsAnimating] = useState(false);
    const [rollingIndex, setRollingIndex] = useState(null); // 滚动动画中的当前高亮

    // Modal state
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        type: 'danger'
    });

    const showConfirm = (title, message, onConfirm, type = 'danger') => {
        setModalConfig({
            isOpen: true,
            title,
            message,
            onConfirm,
            type
        });
    };

    const handleImport = () => {
        if (!importText.trim()) return;
        const names = importText.split('\n').map(n => n.trim()).filter(Boolean);
        addStudents(names);
        setImportText('');
        setIsImporting(false);
    };

    // 轮盘式动画选择
    const animateSelection = (finalIndices) => {
        setIsAnimating(true);
        setHighlightedIndices([]);

        // 动画参数 - 更快速
        const startInterval = 50;    // 初始速度（更快）
        const endInterval = 200;     // 最终速度
        const steps = 12;            // 减少步数

        let currentStep = 0;

        const runStep = () => {
            if (currentStep >= steps) {
                // 动画结束，显示最终选中
                setRollingIndex(null);
                setHighlightedIndices(finalIndices);
                setIsAnimating(false);

                // 滚动到第一个被选中的学生
                const el = document.getElementById(`student-${finalIndices[0]}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });

                // 5秒后取消高亮
                setTimeout(() => setHighlightedIndices([]), 5000);
                return;
            }

            // 随机选一个学生高亮
            const randomIdx = Math.floor(Math.random() * students.length);
            setRollingIndex(randomIdx);

            // 计算下一次间隔（逐渐减速）
            const progress = currentStep / steps;
            const easeOut = 1 - Math.pow(1 - progress, 2); // 缓动函数
            const interval = startInterval + (endInterval - startInterval) * easeOut;

            currentStep++;
            setTimeout(runStep, interval);
        };

        runStep();
    };

    const handleRandomPick = () => {
        if (students.length === 0) {
            alert('请先导入学生名单');
            return;
        }

        if (isAnimating) return; // 防止动画进行中重复点击

        // 从设置中获取抽取权重
        const { settings } = useClassroomStore.getState();
        const pickRatios = settings?.pickRatios || [10, 15, 25, 25, 25];

        // 将学生分为5组 (每组20%)
        const totalStudents = students.length;
        const groupSize = Math.ceil(totalStudents / 5);
        const groups = [];
        for (let i = 0; i < 5; i++) {
            const start = i * groupSize;
            const end = Math.min(start + groupSize, totalStudents);
            groups.push({ start, end, size: end - start });
        }

        // 计算抽取数量
        const count = Math.min(pickCount, totalStudents);

        // 按权重分配抽取名额
        const ratioSum = pickRatios.reduce((a, b) => a + b, 0);
        let allocations = pickRatios.map((ratio, i) => {
            const allocated = Math.round((ratio / ratioSum) * count);
            return Math.min(allocated, groups[i].size); // 不能超过该组人数
        });

        // 调整分配以确保总数正确
        let totalAllocated = allocations.reduce((a, b) => a + b, 0);
        while (totalAllocated < count) {
            // 找还有余量的组增加
            for (let i = 0; i < 5 && totalAllocated < count; i++) {
                if (allocations[i] < groups[i].size) {
                    allocations[i]++;
                    totalAllocated++;
                }
            }
        }
        while (totalAllocated > count) {
            // 从有分配的组减少
            for (let i = 4; i >= 0 && totalAllocated > count; i--) {
                if (allocations[i] > 0) {
                    allocations[i]--;
                    totalAllocated--;
                }
            }
        }

        // 随机索引辅助函数
        const getRandomIndices = (start, end, count) => {
            const indices = Array.from({ length: end - start }, (_, i) => i + start);
            // Shuffle
            for (let i = indices.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [indices[i], indices[j]] = [indices[j], indices[i]];
            }
            return indices.slice(0, count);
        };

        // 从各组抽取
        const pickedIndices = [];
        groups.forEach((group, i) => {
            if (allocations[i] > 0 && group.size > 0) {
                const picked = getRandomIndices(group.start, group.end, allocations[i]);
                pickedIndices.push(...picked);
            }
        });

        // 执行点名记录
        pickedIndices.forEach(idx => {
            addCalledStudent(students[idx]);
        });

        // 启动动画
        animateSelection(pickedIndices);
    };

    return (
        <div className="student-selector-panel">
            <div className="panel-header">
                <div className="title">
                    <Users size={20} />
                    <span>随机点名</span>
                </div>
                <button
                    className="icon-btn"
                    onClick={() => setIsImporting(!isImporting)}
                    title="导入名单"
                >
                    <UserPlus size={18} />
                </button>
            </div>

            {/* 导入面板 */}
            {isImporting && (
                <div className="import-area animate-fade-in">
                    <textarea
                        placeholder="输入学生姓名，每行一个"
                        value={importText}
                        onChange={(e) => setImportText(e.target.value)}
                        rows={5}
                    />
                    <div className="action-row">
                        <button className="neu-btn primary small" onClick={handleImport}>
                            确认添加
                        </button>
                    </div>
                </div>
            )}

            {/* 控制区域 */}
            <div className="control-area">
                <div className="counter-control">
                    <label>抽取人数</label>
                    <div className="stepper">
                        <button onClick={() => setPickCount(Math.max(1, pickCount - 1))}>-</button>
                        <span>{pickCount}</span>
                        <button onClick={() => setPickCount(Math.min(50, pickCount + 1))}>+</button>
                    </div>
                </div>

                <button className="neu-btn accent full-width" onClick={handleRandomPick}>
                    开始点名
                </button>
            </div>

            {/* 已点名记录 */}
            <div className="called-history">
                <div className="history-header">
                    <span>已点名 ({calledStudents.length})</span>
                    {calledStudents.length > 0 && (
                        <button
                            className="text-btn danger"
                            onClick={() => showConfirm(
                                '清空点名记录',
                                '确定要清空所有已点名学生的记录吗？此操作无法撤销。',
                                clearCalledStudents
                            )}
                        >
                            清空
                        </button>
                    )}
                </div>
                <div className="history-list">
                    {calledStudents.length === 0 ? (
                        <div className="empty-text">尚无记录</div>
                    ) : (
                        calledStudents.map((record, i) => (
                            <div key={i} className="history-tag animate-slide-right">
                                {record.name}
                                <span className="time">{new Date(record.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="divider"></div>

            {/* 完整学生列表 */}
            <div className="student-grid-header">
                <span>全班名单 ({students.length})</span>
                <button
                    className="icon-btn danger"
                    onClick={(e) => {
                        e.stopPropagation();
                        showConfirm(
                            '清空班级名单',
                            '确定要删除所有学生名单吗？这将同时清空相关的点名记录。',
                            clearStudents
                        );
                    }}
                    title="清空名单"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            <div className="student-grid-wrapper">
                <div className="student-grid">
                    {students.map((student, idx) => (
                        <div
                            key={idx}
                            id={`student-${idx}`}
                            className={`student-card ${highlightedIndices.includes(idx) ? 'highlight' : ''} ${rollingIndex === idx ? 'rolling' : ''}`}
                        >
                            {student}
                        </div>
                    ))}
                    {students.length === 0 && (
                        <div className="empty-state">
                            请点击右上角导入学生名单
                        </div>
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
            />
        </div>
    );
};

export default StudentSelector;
