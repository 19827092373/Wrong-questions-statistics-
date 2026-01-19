import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import './Toast.scss';

const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for fade out animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const Icon = type === 'success' ? CheckCircle : AlertCircle;

    return (
        <div className={`toast-container ${type} ${isVisible ? 'visible' : 'hidden'}`}>
            <Icon size={20} />
            <span>{message}</span>
            <button className="close" onClick={() => { setIsVisible(false); onClose(); }}>
                <X size={16} />
            </button>
        </div>
    );
};

export default Toast;
