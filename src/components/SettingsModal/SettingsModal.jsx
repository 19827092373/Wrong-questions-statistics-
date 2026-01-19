import React, { useState, useEffect } from 'react';
import { useClassroomStore } from '../../stores/useClassroomStore';
import { X, Settings, Volume2, VolumeX, Zap, RotateCcw, Download, Upload } from 'lucide-react';
import './SettingsModal.scss';

const SettingsModal = ({ isOpen, onClose }) => {
    const { settings, updateSettings, resetSettings, students, problems, calledStudents } = useClassroomStore();
    const [localRatios, setLocalRatios] = useState(settings.pickRatios);
    const [localSpeed, setLocalSpeed] = useState(settings.animationSpeed);
    const [localThreshold, setLocalThreshold] = useState(settings.hotThreshold);
    const [localSound, setLocalSound] = useState(settings.soundEnabled);

    // Sync local state when modal opens
    useEffect(() => {
        if (isOpen) {
            setLocalRatios(settings.pickRatios);
            setLocalSpeed(settings.animationSpeed);
            setLocalThreshold(settings.hotThreshold);
            setLocalSound(settings.soundEnabled);
        }
    }, [isOpen, settings]);

    const groupLabels = [
        { name: 'A组', range: '前20%', desc: '学优生' },
        { name: 'B组', range: '20-40%', desc: '中上' },
        { name: 'C组', range: '40-60%', desc: '中等' },
        { name: 'D组', range: '60-80%', desc: '中下' },
        { name: 'E组', range: '后20%', desc: '待提升' }
    ];

    const ratioSum = localRatios.reduce((a, b) => a + b, 0);
    const isValid = ratioSum === 100;

    const handleRatioChange = (index, value) => {
        const newRatios = [...localRatios];
        newRatios[index] = Math.max(0, Math.min(100, Number(value)));
        setLocalRatios(newRatios);
    };

    const autoNormalize = () => {
        const sum = localRatios.reduce((a, b) => a + b, 0);
        if (sum === 0) {
            setLocalRatios([20, 20, 20, 20, 20]);
            return;
        }
        const normalized = localRatios.map(r => Math.round((r / sum) * 100));
        // Fix rounding errors
        const diff = 100 - normalized.reduce((a, b) => a + b, 0);
        normalized[normalized.length - 1] += diff;
        setLocalRatios(normalized);
    };

    const handleSave = () => {
        updateSettings({
            pickRatios: localRatios,
            animationSpeed: localSpeed,
            hotThreshold: localThreshold,
            soundEnabled: localSound
        });
        onClose();
    };

    const handleReset = () => {
        setLocalRatios([10, 15, 25, 25, 25]);
        setLocalSpeed('medium');
        setLocalThreshold(4);
        setLocalSound(true);
    };

    // Data export/import
    const handleExportData = () => {
        const data = {
            students,
            problems,
            calledStudents,
            settings,
            exportTime: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `错题数据备份_${new Date().toLocaleDateString()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Delay revocation to ensure download starts
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 100);
    };

    const handleImportData = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (data.students && data.problems && data.settings) {
                    // Store the entire state
                    useClassroomStore.setState({
                        students: data.students,
                        problems: data.problems,
                        calledStudents: data.calledStudents || [],
                        settings: data.settings
                    });
                    alert('数据导入成功！');
                    onClose();
                } else {
                    alert('无效的备份文件格式');
                }
            } catch (err) {
                alert('文件解析失败：' + err.message);
            }
        };
        reader.readAsText(file);
    };

    if (!isOpen) return null;

    return (
        <div className="settings-modal-overlay">
            <div className="settings-modal animate-fade-in">
                <div className="modal-header">
                    <div className="title">
                        <Settings size={20} />
                        <h3>设置</h3>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    {/* Pick Ratios Section */}
                    <section className="settings-section">
                        <h4>📊 抽取权重配置</h4>
                        <p className="section-desc">调整各分段学生被抽中的概率</p>

                        <div className="ratio-grid">
                            {groupLabels.map((group, idx) => (
                                <div key={idx} className="ratio-row">
                                    <div className="group-info">
                                        <label htmlFor={`ratio-slider-${idx}`} className="group-name">{group.name}</label>
                                        <span className="group-range">{group.range}</span>
                                    </div>
                                    <input
                                        id={`ratio-slider-${idx}`}
                                        name={`ratio-group-${idx}`}
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={localRatios[idx]}
                                        onChange={(e) => handleRatioChange(idx, e.target.value)}
                                        aria-label={`${group.name} ratio slider`}
                                    />
                                    <input
                                        id={`ratio-number-${idx}`}
                                        name={`ratio-val-${idx}`}
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={localRatios[idx]}
                                        onChange={(e) => handleRatioChange(idx, e.target.value)}
                                        aria-label={`${group.name} ratio value`}
                                    />
                                    <span className="unit">%</span>
                                </div>
                            ))}
                        </div>

                        <div className={`ratio-sum ${isValid ? 'valid' : 'invalid'}`}>
                            <span>总计: {ratioSum}%</span>
                            {isValid ? (
                                <span className="check">✅</span>
                            ) : (
                                <button className="auto-btn" onClick={autoNormalize}>
                                    自动调整
                                </button>
                            )}
                        </div>
                    </section>

                    {/* Animation Speed */}
                    <section className="settings-section">
                        <h4>⚡ 动画速度</h4>
                        <div className="speed-toggle">
                            {['fast', 'medium', 'slow'].map((speed) => (
                                <button
                                    key={speed}
                                    className={`speed-btn ${localSpeed === speed ? 'active' : ''}`}
                                    onClick={() => setLocalSpeed(speed)}
                                >
                                    {speed === 'fast' ? '快' : speed === 'medium' ? '中' : '慢'}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Hot Threshold */}
                    <section className="settings-section">
                        <h4>🔥 高频错题阈值</h4>
                        <div className="threshold-control">
                            <input
                                id="hot-threshold-slider"
                                name="hotThreshold"
                                type="range"
                                min="2"
                                max="10"
                                value={localThreshold}
                                onChange={(e) => setLocalThreshold(Number(e.target.value))}
                                aria-label="High frequency threshold"
                            />
                            <label htmlFor="hot-threshold-slider" className="threshold-value">{localThreshold} 次</label>
                        </div>
                    </section>

                    {/* Sound Toggle */}
                    <section className="settings-section">
                        <h4>🔊 点击音效</h4>
                        <button
                            className={`sound-toggle ${localSound ? 'on' : 'off'}`}
                            onClick={() => setLocalSound(!localSound)}
                        >
                            {localSound ? <Volume2 size={18} /> : <VolumeX size={18} />}
                            {localSound ? '开启' : '关闭'}
                        </button>
                    </section>

                    {/* Data Backup */}
                    <section className="settings-section">
                        <h4>💾 数据管理</h4>
                        <div className="data-actions">
                            <button className="data-btn" onClick={handleExportData}>
                                <Download size={16} /> 导出备份
                            </button>
                            <label htmlFor="backup-upload" className="data-btn import-btn">
                                <Upload size={16} /> 导入备份
                                <input
                                    id="backup-upload"
                                    name="backupFile"
                                    type="file"
                                    accept=".json"
                                    onChange={handleImportData}
                                    hidden
                                />
                            </label>
                        </div>
                    </section>
                </div>

                <div className="modal-footer">
                    <button className="reset-btn" onClick={handleReset}>
                        <RotateCcw size={16} /> 恢复默认
                    </button>
                    <button
                        className="save-btn"
                        onClick={handleSave}
                        disabled={!isValid}
                    >
                        保存设置
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
