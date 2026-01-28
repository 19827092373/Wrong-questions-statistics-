import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

export function Toast({ message, type = 'error', onClose }) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
        }, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const icons = {
        error: AlertCircle,
        success: CheckCircle
    };

    const Icon = icons[type];

    return (
        <div
            className={cn(
                'fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl border transition-all duration-300',
                isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
                type === 'error'
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            )}
        >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{message}</p>
            <button
                onClick={() => {
                    setIsVisible(false);
                    setTimeout(onClose, 300);
                }}
                className="hover:opacity-70 transition-opacity"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

export function useToast() {
    const [toasts, setToasts] = useState([]);

    const showToast = (message, type = 'error') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const ToastContainer = () => (
        <>
            {toasts.map(toast => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </>
    );

    return { showToast, ToastContainer };
}
