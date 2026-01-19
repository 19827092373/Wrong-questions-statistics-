import React, { useRef, useState } from 'react';
import { useClassroomStore } from '../../stores/useClassroomStore';
import useSound from '../../hooks/useSound';
import { Grid, Eye, AlertCircle } from 'lucide-react';
import './ProblemMatrix.scss';

const ProblemMatrix = () => {
    const {
        problems,
        problemCount,
        incrementProblem,
        setProblemCount,
        setRelatedProblems,
        relatedProblems
    } = useClassroomStore();

    const { playClick } = useSound();
    const [activeRelated, setActiveRelated] = useState(null); // 长按时激活的题号
    const pressTimerRef = useRef(null);

    // 获取最大错误次数，用于颜色范围计算
    const problemValues = Object.values(problems);
    const maxCount = problemValues.length > 0 ? Math.max(...problemValues, 1) : 1;

    // 根据错误次数计算连续渐变色（HSL颜色空间）
    // 从黄色(60°)平滑过渡到红色(0°)
    const getHeatColor = (count) => {
        if (!count || count === 0) {
            // 无错误：使用默认背景色（新拟态效果）
            return null;
        }

        // 计算颜色强度（0-1之间）
        // 使用平方根函数让低错误次数变化更明显，高错误次数也能区分
        // 同时设置一个合理的最大值（比如10次）作为颜色饱和点
        const colorMax = Math.max(maxCount, 10); // 至少10次作为颜色饱和点
        const normalizedCount = Math.min(count, colorMax);
        const intensity = Math.sqrt(normalizedCount / colorMax); // 使用平方根让变化更平滑
        
        // HSL颜色渐变
        // 色相(H): 从黄色(60°)到红色(0°)，平滑过渡
        const hue = 60 - (intensity * 60);
        // 饱和度(S): 从70%到95%，让颜色更鲜艳
        const saturation = 70 + (intensity * 25);
        // 亮度(L): 从85%到45%，让高错误次数更醒目
        const lightness = 85 - (intensity * 40);

        return `hsl(${Math.round(hue)}, ${Math.round(saturation)}%, ${Math.round(lightness)}%)`;
    };

    // 获取文字颜色（根据背景色自动调整）
    const getTextColor = (count) => {
        if (!count || count === 0) return null;
        // 计算颜色强度
        const colorMax = Math.max(maxCount, 10);
        const normalizedCount = Math.min(count, colorMax);
        const intensity = Math.sqrt(normalizedCount / colorMax);
        // 当错误次数较多（强度>0.55）时，使用白色文字以提高对比度
        return intensity > 0.55 ? '#FFFFFF' : '#333333';
    };

    const calculateGrid = () => {
        const cols = Math.ceil(Math.sqrt(problemCount * 1.5));
        return {
            gridTemplateColumns: `repeat(${cols}, 1fr)`
        };
    };

    const gridStyle = calculateGrid();

    const handleMouseDown = (num) => {
        pressTimerRef.current = setTimeout(() => {
            if (relatedProblems[num]) {
                setActiveRelated(num);
            } else {
                setActiveRelated(num);
            }
        }, 800);
    };

    const handleMouseUp = () => {
        if (pressTimerRef.current) {
            clearTimeout(pressTimerRef.current);
            pressTimerRef.current = null;
        }
        setActiveRelated(null);
    };

    const handleClick = (num) => {
        playClick();
        incrementProblem(num);
    };

    const problemNumbers = Array.from({ length: problemCount }, (_, i) => i + 1);

    return (
        <div className="problem-matrix-panel">
            <div className="panel-header">
                <div className="title">
                    <Grid size={20} />
                    <span>题号矩阵</span>
                </div>
                <div className="controls">
                    <label>题目数量:</label>
                    <input
                        type="number"
                        value={problemCount}
                        onChange={(e) => {
                            let val = Number(e.target.value);
                            if (val > 50) val = 50;
                            if (val < 1) val = 1;
                            setProblemCount(val);
                        }}
                        min="1"
                        max="50"
                    />
                </div>
            </div>

            <div className="matrix-content">
                <div className="problem-grid" style={gridStyle}>
                    {problemNumbers.map((num) => {
                        const count = problems[num] || 0;
                        const heatColor = getHeatColor(count);
                        const textColor = getTextColor(count);

                        return (
                            <button
                                key={num}
                                className={`problem-cell ${activeRelated === num ? 'active-related' : ''}`}
                                style={{
                                    backgroundColor: heatColor || undefined,
                                    color: textColor || undefined,
                                }}
                                onMouseDown={() => handleMouseDown(num)}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                                onClick={() => handleClick(num)}
                                title={`第${num}题: 错误${count}次`}
                            >
                                <span className="num">{num}</span>
                                {count > 0 && <span className="badge">{count}</span>}
                            </button>
                        );
                    })}
                </div>
            </div>

            {activeRelated && (
                <div className="related-toast animate-fade-in">
                    <Eye size={16} />
                    <span>
                        关联题目 (题{activeRelated}):
                        {relatedProblems[activeRelated] && relatedProblems[activeRelated].length > 0
                            ? ` ${relatedProblems[activeRelated].join(', ')}`
                            : ' 无'}
                    </span>
                </div>
            )}
        </div>
    );
};

export default ProblemMatrix;
