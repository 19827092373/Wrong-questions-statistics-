import React, { useState, useEffect } from 'react';
import { useClassroomStore } from '../../stores/useClassroomStore';
import { Minus, Plus, Maximize, RotateCcw } from 'lucide-react';
import './ZoomControl.scss';

const ZoomControl = () => {
    const { settings, updateSettings } = useClassroomStore();
    const [zoom, setZoom] = useState(settings.zoomLevel || 1);

    useEffect(() => {
        setZoom(settings.zoomLevel || 1);
    }, [settings.zoomLevel]);

    const handleZoomChange = (val) => {
        const newZoom = parseFloat(val);
        setZoom(newZoom);
        updateSettings({ zoomLevel: newZoom });
    };

    const handleAutoFit = () => {
        // Assume ideal height is around 900px for full view
        // Calculate ratio based on window height
        const availableHeight = window.innerHeight;
        const targetHeight = 900;
        const ratio = Math.min(1.5, Math.max(0.5, availableHeight / targetHeight));

        // Round to 2 decimal places
        const finalRatio = Math.round(ratio * 100) / 100;

        handleZoomChange(finalRatio);
    };

    const handleReset = () => {
        handleZoomChange(1);
    };

    const percentage = Math.round(zoom * 100);

    return (
        <div className="zoom-control">
            <button className="zoom-btn icon-btn" onClick={() => handleZoomChange(Math.max(0.5, zoom - 0.1))} title="缩小">
                <Minus size={14} />
            </button>

            <div className="slider-container">
                <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => handleZoomChange(e.target.value)}
                    className="zoom-slider"
                />
                <span className="zoom-value">{percentage}%</span>
            </div>

            <button className="zoom-btn icon-btn" onClick={() => handleZoomChange(Math.min(1.5, zoom + 0.1))} title="放大">
                <Plus size={14} />
            </button>

            <div className="divider"></div>

            <button className="zoom-btn text-btn" onClick={handleAutoFit} title="自动适配屏幕高度">
                <Maximize size={14} />
                <span>自适应</span>
            </button>

            <button className="zoom-btn icon-btn" onClick={handleReset} title="重置缩放">
                <RotateCcw size={14} />
            </button>
        </div>
    );
};

export default ZoomControl;
