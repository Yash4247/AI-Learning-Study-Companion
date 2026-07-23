import React from 'react';
import { Compass, BookOpen, Calendar, Timer, Key, Flame, RotateCcw, Zap, Bot, Users, TrendingUp } from 'lucide-react';
import { storageService } from '../services/storageService';

export default function Header({
  activeTab,
  onTabChange,
  setActiveTab,
  onOpenApiKeyModal,
  onOpenStreakModal,
  onOpenStudyGroups,
  onOpenAnalytics,
  onResetAll,
  apiKey,
  hasApiKey,
  logs = {},
  streak
}) {
  const handleTabClick = (tabId) => {
    if (typeof onTabChange === 'function') {
      onTabChange(tabId);
    }
    if (typeof setActiveTab === 'function') {
      setActiveTab(tabId);
    }
  };

  const currentStreak = streak !== undefined ? streak : (logs?.streak || 0);
  const isApiActive = Boolean(apiKey || hasApiKey);
  const xpData = storageService.calculateXPAndLevel(logs);

  const navItems = [
    { id: 'roadmap', label: 'AI Learning Path', icon: Compass },
    { id: 'syllabus', label: 'Syllabus Parser', icon: BookOpen },
    { id: 'schedule', label: 'Daily Planner', icon: Calendar },
    { id: 'focus', label: 'Focus Study Hub', icon: Timer },
    { id: 'mentor', label: 'AI Mentor', icon: Bot }
  ];

  return (
    <header className="navbar">
      <div className="logo-group">
        <div className="logo-icon">🧠</div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="logo-text">Apex Learn</span>
            <span className="logo-tag">AI Study OS v2</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontWeight: 500 }}>
            Macro Roadmaps, Micro Adaptive Schedules & AI Mentor
          </span>
        </div>
      </div>

      <nav className="nav-tabs" style={{ marginRight: '16px' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-tab ${isActive ? 'active' : ''}`}
              onClick={() => handleTabClick(item.id)}
            >
              <Icon size={17} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
        {/* Predictive Analytics Button */}
        <button
          className="btn-icon"
          onClick={onOpenAnalytics}
          title="Predictive Target Date Analytics"
          style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' }}
        >
          <TrendingUp size={16} />
        </button>

        {/* Study Groups Button */}
        <button
          className="btn-icon"
          onClick={onOpenStudyGroups}
          title="Team Study Groups & Peer Co-Working"
          style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}
        >
          <Users size={16} />
        </button>

        {/* XP Level Badge */}
        <div
          className="badge badge-purple"
          onClick={onOpenStreakModal}
          title="Click to view 365-Day Activity Grid & XP Badges"
          style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', cursor: 'pointer', userSelect: 'none' }}
        >
          <Zap size={13} color="var(--accent-cyan)" fill="var(--accent-cyan)" />
          <span>LVL {xpData.level} ({xpData.totalXP} XP)</span>
        </div>

        {/* Streak Badge */}
        <div 
          className="badge badge-amber" 
          onClick={onOpenStreakModal}
          title="Click to view Streak & Habit Calendar"
          style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', cursor: 'pointer', userSelect: 'none' }}
        >
          <Flame size={14} fill="var(--accent-amber)" />
          <span>{currentStreak}d</span>
        </div>

        {/* API Badge */}
        <button 
          className={`api-badge ${isApiActive ? '' : 'offline'}`}
          onClick={onOpenApiKeyModal}
          title="Configure Gemini API Key"
          style={{ cursor: 'pointer', border: 'none', fontFamily: 'inherit' }}
        >
          <Key size={13} />
          <span>{isApiActive ? 'Gemini AI' : 'Offline'}</span>
        </button>

        {/* Reset All Button */}
        <button
          className="btn-icon"
          onClick={onResetAll}
          title="Reset All Data to Zero (Start Fresh)"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </header>
  );
}
