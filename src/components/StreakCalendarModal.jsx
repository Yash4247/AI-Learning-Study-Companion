import React, { useState } from 'react';
import { Flame, X, Calendar, Clock, Award, CheckCircle2, ListFilter, ArrowLeft, Filter, Zap, Trophy, ShieldCheck, Sparkles } from 'lucide-react';
import { storageService } from '../services/storageService';

export default function StreakCalendarModal({ isOpen, onClose, logs }) {
  const [showHistory, setShowHistory] = useState(false);
  const [selectedDateFilter, setSelectedDateFilter] = useState(null);
  const [activeTab, setActiveTab] = useState('heatmap'); // 'heatmap' | 'badges' | 'history'

  if (!isOpen) return null;

  const xpData = storageService.calculateXPAndLevel(logs);
  const heatmapDays = storageService.generateHeatmapData(logs);
  const historyList = logs.history || [];

  const handleCellClick = (dateStr) => {
    setSelectedDateFilter(dateStr);
    setActiveTab('history');
  };

  const handleClearDateFilter = () => {
    setSelectedDateFilter(null);
  };

  const filteredHistory = selectedDateFilter
    ? historyList.filter(item => {
        if (item.dateStr) return item.dateStr === selectedDateFilter;
        const itemDateObj = new Date(item.date);
        const filterObj = new Date(selectedDateFilter);
        return itemDateObj.toDateString() === filterObj.toDateString();
      })
    : historyList;

  // Split 364 days into 52 weeks (7 days each column)
  const weeks = [];
  for (let i = 0; i < 52; i++) {
    weeks.push(heatmapDays.slice(i * 7, (i + 1) * 7));
  }

  const getHeatmapColor = (level) => {
    switch (level) {
      case 4: return 'rgba(16, 185, 129, 0.95)'; // Deep emerald
      case 3: return 'rgba(16, 185, 129, 0.7)';  // Medium green
      case 2: return 'rgba(16, 185, 129, 0.45)'; // Light green
      case 1: return 'rgba(16, 185, 129, 0.25)'; // Subtle mint
      default: return 'rgba(255, 255, 255, 0.05)'; // Off
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content glass-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '780px', width: '92%', padding: '28px', background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '18px' }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px', background: 'rgba(245, 158, 11, 0.15)', borderRadius: '12px', color: 'var(--accent-amber)' }}>
              <Flame size={24} fill="var(--accent-amber)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                  365-Day Study Activity & XP Mastery
                </h3>
                <span className="badge badge-amber">🔥 {logs.streak || 0} Day Streak</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Track your study habits, earn XP points, level up, and unlock achievement badges!
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Level & XP Progress Banner */}
        <div
          className="glass-card"
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(16, 185, 129, 0.15))',
            borderColor: 'rgba(99, 102, 241, 0.4)',
            padding: '16px 20px',
            borderRadius: '14px',
            marginBottom: '20px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ padding: '6px 12px', background: 'var(--primary)', color: '#fff', borderRadius: '20px', fontWeight: 800, fontSize: '0.85rem' }}>
                LVL {xpData.level}
              </div>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>
                {xpData.levelTitle}
              </span>
            </div>

            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
              ⚡ {xpData.totalXP} Total XP
            </span>
          </div>

          {/* XP Progress Bar */}
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', height: '10px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
            <div
              style={{
                width: `${xpData.progressPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, var(--primary), var(--accent-emerald))',
                borderRadius: '10px',
                transition: 'width 0.4s ease'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>{xpData.currentLevelXP} / {xpData.nextLevelXP} XP to Level {xpData.level + 1}</span>
            <span>{xpData.progressPercent}% Progress</span>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <button
            className={`btn btn-sm ${activeTab === 'heatmap' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('heatmap')}
          >
            <Calendar size={14} /> 365-Day Activity Grid
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'badges' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('badges')}
          >
            <Award size={14} /> Badges ({xpData.badges.filter(b => b.unlocked).length}/{xpData.badges.length})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('history')}
          >
            <ListFilter size={14} /> Session History ({historyList.length})
          </button>
        </div>

        {/* TAB 1: 365-Day GitHub Style Heatmap */}
        {activeTab === 'heatmap' && (
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🟩 GitHub-Style 365-Day Activity Heatmap</span>
              </h4>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Click any cell to view sessions
              </span>
            </div>

            {/* Heatmap Grid Container */}
            <div style={{ overflowX: 'auto', paddingBottom: '8px' }}>
              <div style={{ display: 'flex', gap: '4px', minWidth: '680px' }}>
                {weeks.map((week, wIdx) => (
                  <div key={wIdx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {week.map((day) => (
                      <div
                        key={day.dateStr}
                        onClick={() => handleCellClick(day.dateStr)}
                        title={`${day.displayDate} (${day.dateStr}): ${day.minutes} mins studied`}
                        style={{
                          width: '11px',
                          height: '11px',
                          borderRadius: '3px',
                          background: getHeatmapColor(day.level),
                          border: day.minutes > 0 ? '1px solid rgba(16, 185, 129, 0.6)' : '1px solid rgba(255, 255, 255, 0.05)',
                          cursor: 'pointer',
                          transition: 'transform 0.15s ease'
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '6px', marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>Less</span>
              <div style={{ width: '10px', height: '10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '2px' }} />
              <div style={{ width: '10px', height: '10px', background: 'rgba(16, 185, 129, 0.25)', borderRadius: '2px' }} />
              <div style={{ width: '10px', height: '10px', background: 'rgba(16, 185, 129, 0.45)', borderRadius: '2px' }} />
              <div style={{ width: '10px', height: '10px', background: 'rgba(16, 185, 129, 0.7)', borderRadius: '2px' }} />
              <div style={{ width: '10px', height: '10px', background: 'rgba(16, 185, 129, 0.95)', borderRadius: '2px' }} />
              <span>More</span>
            </div>
          </div>
        )}

        {/* TAB 2: Achievements Badges */}
        {activeTab === 'badges' && (
          <div className="grid-3" style={{ maxHeight: '340px', overflowY: 'auto' }}>
            {xpData.badges.map((badge) => (
              <div
                key={badge.id}
                className="glass-card"
                style={{
                  padding: '16px',
                  textAlign: 'center',
                  background: badge.unlocked ? 'rgba(16, 185, 129, 0.12)' : 'rgba(15, 23, 42, 0.6)',
                  borderColor: badge.unlocked ? 'rgba(16, 185, 129, 0.5)' : 'var(--border-light)',
                  opacity: badge.unlocked ? 1 : 0.65
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>
                  {badge.icon}
                </div>
                <h4 style={{ fontSize: '0.94rem', fontWeight: 800, color: badge.unlocked ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                  {badge.title}
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {badge.desc}
                </p>
                <span className={`badge ${badge.unlocked ? 'badge-emerald' : 'badge-slate'}`} style={{ marginTop: '8px', fontSize: '0.7rem' }}>
                  {badge.unlocked ? '✓ Unlocked' : '🔒 Locked'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: History List */}
        {activeTab === 'history' && (
          <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={20} color="var(--accent-emerald)" />
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                  {selectedDateFilter ? `Sessions on ${selectedDateFilter}` : 'All Logged Study Sessions'}
                </h4>
              </div>

              {selectedDateFilter && (
                <button className="btn btn-secondary btn-sm" onClick={handleClearDateFilter}>
                  <Filter size={12} /> Clear Date Filter
                </button>
              )}
            </div>

            {filteredHistory.length === 0 ? (
              <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {selectedDateFilter
                  ? `No study sessions logged on ${selectedDateFilter}. Click another cell or complete a session today!`
                  : 'No study sessions logged yet. Complete tasks in the Daily Planner to start earning XP!'}
              </div>
            ) : (
              <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
                {filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid var(--border-light)',
                      borderRadius: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <CheckCircle2 size={18} color="var(--accent-emerald)" />
                      <div>
                        <h5 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)' }}>{item.title}</h5>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {item.date} {item.time ? `at ${item.time}` : ''}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>{item.source}</span>
                      <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>{item.durationMins} Mins</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
