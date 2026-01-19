import React, { useState, useRef, useEffect } from 'react';
import { useClassroomStore } from '../../stores/useClassroomStore';
import { Download, X, BarChart, ListOrdered } from 'lucide-react';
import Toast from '../Toast/Toast';
import './ExportModal.scss';

const ExportModal = ({ isOpen, onClose }) => {
    const { problems } = useClassroomStore();
    const [sortMode, setSortMode] = useState('frequency'); // frequency | number
    const [showToast, setShowToast] = useState(false);
    const canvasRef = useRef(null);

    // Generate data based on sort mode
    const getData = () => {
        let entries = Object.entries(problems).filter(([_, count]) => count > 0);

        if (sortMode === 'frequency') {
            // Sort by count desc
            entries.sort((a, b) => b[1] - a[1]);
        } else {
            // Sort by problem number asc
            entries.sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
        }
        return entries;
    };

    const drawCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // High-DPI support: use 2x scale for crisp export
        const scale = 2;

        // Config
        const data = getData();
        const baseWidth = 900;
        const padding = 40;

        // Calculate heights
        const headerHeight = 100;
        const statsHeight = 80;
        const hotSectionHeight = data.filter(([_, c]) => c >= 4).length > 0 ? 120 : 60;
        const chartHeight = Math.max(200, data.length * 35 + 60);
        const footerHeight = 50;
        const baseHeight = headerHeight + statsHeight + hotSectionHeight + chartHeight + footerHeight;

        // Set actual canvas size (scaled for high-DPI)
        canvas.width = baseWidth * scale;
        canvas.height = baseHeight * scale;
        ctx.scale(scale, scale);

        // ===== BACKGROUND =====
        // Subtle gradient background
        const bgGradient = ctx.createLinearGradient(0, 0, 0, baseHeight);
        bgGradient.addColorStop(0, '#F8FAFC');
        bgGradient.addColorStop(1, '#E2E8F0');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, baseWidth, baseHeight);

        // ===== HEADER BANNER =====
        const headerGradient = ctx.createLinearGradient(0, 0, baseWidth, 0);
        headerGradient.addColorStop(0, '#4B6CB7');
        headerGradient.addColorStop(1, '#182848');
        ctx.fillStyle = headerGradient;
        ctx.fillRect(0, 0, baseWidth, headerHeight);

        // Header text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 28px "Microsoft YaHei"';
        ctx.textAlign = 'center';
        ctx.fillText('📊 课堂错题统计报告', baseWidth / 2, 45);

        ctx.font = '14px "Microsoft YaHei"';
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fillText(`生成时间: ${new Date().toLocaleString()}`, baseWidth / 2, 75);

        // ===== STATS CARDS =====
        const statsY = headerHeight + 20;
        const cardWidth = (baseWidth - padding * 2 - 30) / 3;
        const totalErrors = data.reduce((acc, [_, c]) => acc + c, 0);
        const problemsWithErrors = data.length;
        const hotCount = data.filter(([_, c]) => c >= 4).length;

        const statsData = [
            { label: '总错误次数', value: totalErrors, color: '#4B6CB7', icon: '📈' },
            { label: '错题数量', value: problemsWithErrors, color: '#10B981', icon: '📝' },
            { label: '高频错题', value: hotCount, color: '#EF4444', icon: '🔥' }
        ];

        statsData.forEach((stat, i) => {
            const x = padding + i * (cardWidth + 15);

            // Card shadow
            ctx.fillStyle = 'rgba(0,0,0,0.08)';
            ctx.fillRect(x + 3, statsY + 3, cardWidth, 50);

            // Card background
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(x, statsY, cardWidth, 50);

            // Left color bar
            ctx.fillStyle = stat.color;
            ctx.fillRect(x, statsY, 4, 50);

            // Icon and text
            ctx.font = '20px "Microsoft YaHei"';
            ctx.textAlign = 'left';
            ctx.fillText(stat.icon, x + 15, statsY + 32);

            ctx.fillStyle = '#666';
            ctx.font = '12px "Microsoft YaHei"';
            ctx.fillText(stat.label, x + 45, statsY + 22);

            ctx.fillStyle = stat.color;
            ctx.font = 'bold 20px "Microsoft YaHei"';
            ctx.fillText(stat.value.toString(), x + 45, statsY + 42);
        });

        // ===== HOT PROBLEMS SECTION =====
        const hotY = statsY + 70;
        const hotProblems = data.filter(([_, count]) => count >= 4);

        ctx.textAlign = 'left';
        ctx.fillStyle = '#EF4444';
        ctx.font = 'bold 16px "Microsoft YaHei"';
        ctx.fillText('🔥 高频错题 (4次及以上)', padding, hotY + 20);

        if (hotProblems.length > 0) {
            hotProblems.slice(0, 10).forEach(([num, count], i) => {
                const x = padding + i * 70;
                const y = hotY + 35;

                // Red gradient card
                const cardGrad = ctx.createLinearGradient(x, y, x, y + 55);
                cardGrad.addColorStop(0, '#FEE2E2');
                cardGrad.addColorStop(1, '#FECACA');
                ctx.fillStyle = cardGrad;
                ctx.fillRect(x, y, 60, 55);

                ctx.strokeStyle = '#EF4444';
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, 60, 55);

                ctx.fillStyle = '#DC2626';
                ctx.font = 'bold 22px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(num.toString(), x + 30, y + 28);

                ctx.font = 'bold 12px Arial';
                ctx.fillStyle = '#991B1B';
                ctx.fillText(`${count}次`, x + 30, y + 46);
            });
        } else {
            ctx.fillStyle = '#9CA3AF';
            ctx.font = 'italic 14px "Microsoft YaHei"';
            ctx.textAlign = 'left';
            ctx.fillText('✅ 太棒了！没有高频错题', padding + 200, hotY + 20);
        }

        // ===== MAIN CHART =====
        const chartY = hotY + hotSectionHeight - 10;
        ctx.textAlign = 'left';
        ctx.fillStyle = '#374151';
        ctx.font = 'bold 16px "Microsoft YaHei"';
        ctx.fillText(`📋 错题详情 (${sortMode === 'frequency' ? '按频次' : '按题号'})`, padding, chartY + 20);

        // Heat legend
        const legendX = baseWidth - padding - 200;
        ctx.font = '12px "Microsoft YaHei"';
        ctx.fillStyle = '#6B7280';
        ctx.fillText('热度:', legendX, chartY + 18);

        const heatColors = ['#FEF3C7', '#FDE68A', '#FDBA74', '#F87171'];
        const heatLabels = ['1次', '2次', '3次', '4+'];
        heatColors.forEach((color, i) => {
            ctx.fillStyle = color;
            ctx.fillRect(legendX + 40 + i * 40, chartY + 8, 25, 14);
            ctx.strokeStyle = '#D1D5DB';
            ctx.lineWidth = 1;
            ctx.strokeRect(legendX + 40 + i * 40, chartY + 8, 25, 14);
            ctx.fillStyle = '#374151';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(heatLabels[i], legendX + 52 + i * 40, chartY + 18);
        });

        // Bar chart
        const barStartY = chartY + 40;
        const maxCount = Math.max(...data.map(d => d[1]), 1);
        const barMaxWidth = baseWidth - padding * 2 - 120;

        data.forEach(([num, count], index) => {
            const y = barStartY + index * 32;

            // Problem number
            ctx.textAlign = 'right';
            ctx.fillStyle = '#374151';
            ctx.font = 'bold 13px Arial';
            ctx.fillText(`第${num}题`, padding + 55, y + 12);

            // Bar background
            ctx.fillStyle = '#E5E7EB';
            ctx.fillRect(padding + 65, y, barMaxWidth, 18);

            // Active bar with gradient based on count
            const barWidth = (count / maxCount) * barMaxWidth;
            let barColor;
            if (count >= 4) barColor = '#EF4444';
            else if (count >= 3) barColor = '#F97316';
            else if (count >= 2) barColor = '#FBBF24';
            else barColor = '#10B981';

            const barGrad = ctx.createLinearGradient(padding + 65, 0, padding + 65 + barWidth, 0);
            barGrad.addColorStop(0, barColor);
            barGrad.addColorStop(1, barColor + 'AA');
            ctx.fillStyle = barGrad;
            ctx.fillRect(padding + 65, y, barWidth, 18);

            // Count label
            ctx.textAlign = 'left';
            ctx.fillStyle = count >= 3 ? '#DC2626' : '#374151';
            ctx.font = 'bold 12px Arial';
            ctx.fillText(`${count}次`, padding + 75 + barMaxWidth, y + 13);
        });

        // ===== FOOTER =====
        const footerY = baseHeight - footerHeight;
        ctx.fillStyle = '#F1F5F9';
        ctx.fillRect(0, footerY, baseWidth, footerHeight);

        ctx.fillStyle = '#94A3B8';
        ctx.font = '12px "Microsoft YaHei"';
        ctx.textAlign = 'center';
        ctx.fillText('课堂错题统计系统 PRO · 由感恩烧饼开发', baseWidth / 2, footerY + 30);
    };

    useEffect(() => {
        if (isOpen) {
            // Wait for font loading or next tick
            setTimeout(drawCanvas, 100);
        }
    }, [isOpen, sortMode, problems]);

    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Use toBlob instead of toDataURL for large images support in Chrome
        canvas.toBlob((blob) => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            // Use ISO string to ensure valid filename (no slashes)
            const dateStr = new Date().toISOString().split('T')[0];
            link.download = `错题统计_${dateStr}.png`;
            link.href = url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up
            setTimeout(() => URL.revokeObjectURL(url), 100);

            // Show success toast
            setShowToast(true);
        }, 'image/png');
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="modal-overlay">
                <div className="modal-content animate-fade-in">
                    <div className="modal-header">
                        <h3>导出统计报告</h3>
                        <button className="close-btn" onClick={onClose}><X size={20} /></button>
                    </div>

                    <div className="modal-body">
                        <div className="sort-control">
                            <span>排序方式:</span>
                            <div className="toggle-group">
                                <button
                                    className={`toggle-btn ${sortMode === 'frequency' ? 'active' : ''}`}
                                    onClick={() => setSortMode('frequency')}
                                >
                                    <BarChart size={16} /> 按错误频次
                                </button>
                                <button
                                    className={`toggle-btn ${sortMode === 'number' ? 'active' : ''}`}
                                    onClick={() => setSortMode('number')}
                                >
                                    <ListOrdered size={16} /> 按题号顺序
                                </button>
                            </div>
                        </div>

                        <div className="preview-area">
                            <canvas ref={canvasRef} className="preview-canvas"></canvas>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button className="neu-btn primary" onClick={handleDownload}>
                            <Download size={18} /> 下载图片
                        </button>
                    </div>
                </div>
            </div>

            {showToast && (
                <Toast
                    message="图片已保存到下载文件夹"
                    type="success"
                    onClose={() => setShowToast(false)}
                />
            )}
        </>
    );
};

export default ExportModal;
