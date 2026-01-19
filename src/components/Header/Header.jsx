import React, { useState } from 'react';
import './Header.scss';
import { Activity, Settings } from 'lucide-react';
import SettingsModal from '../SettingsModal/SettingsModal';

const Header = () => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    return (
        <>
            <header className="app-header">
                <div className="header-content">
                    <div className="logo-section">
                        <div className="logo-icon">
                            <Activity size={24} color="#4B6CB7" />
                        </div>
                        <div className="title-group">
                            <h1>课堂错题统计</h1>
                            <span className="version-tag">PRO</span>
                        </div>
                    </div>

                    <div className="status-section">
                        <button
                            className="settings-btn"
                            onClick={() => setIsSettingsOpen(true)}
                            title="设置"
                        >
                            <Settings size={20} />
                        </button>
                        <div className="status-item">
                            <span className="status-dot"></span>
                            <span>实时连接</span>
                        </div>
                        <div className="credit-tag">
                            Dev: 感恩烧饼
                        </div>
                    </div>
                </div>
            </header>

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />
        </>
    );
};

export default Header;
