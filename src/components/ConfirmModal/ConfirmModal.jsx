import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import './ConfirmModal.scss';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = '确认', cancelText = '取消', type = 'danger' }) => {
    if (!isOpen) return null;

    return (
        <div className="confirm-modal-overlay animate-fade-in">
            <div className="confirm-modal-content">
                <div className="modal-header">
                    <div className={`icon-wrapper ${type}`}>
                        <AlertCircle size={24} />
                    </div>
                    <h3>{title}</h3>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="modal-body">
                    <p>{message}</p>
                </div>

                <div className="modal-footer">
                    <button className="neu-btn" onClick={onClose}>
                        {cancelText}
                    </button>
                    <button className={`neu-btn ${type}`} onClick={() => {
                        onConfirm();
                        onClose();
                    }}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
