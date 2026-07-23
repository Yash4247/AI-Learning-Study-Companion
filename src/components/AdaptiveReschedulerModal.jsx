import React, { useState } from 'react';
import { AlertTriangle, X, Sparkles, RefreshCw, CheckCircle2, ArrowRight, Clock } from 'lucide-react';
import { aiService } from '../services/aiService';

export default function AdaptiveReschedulerModal({ isOpen, onClose, schedule, onApplyReschedule, onNotify }) {
  const uncompletedTasks = schedule.filter(t => !t.completed);
  const [selectedMissedIds, setSelectedMissedIds] = useState(uncompletedTasks.map(t => t.id));
  const [maxDailyHours, setMaxDailyHours] = useState(2);
  const [analyzing, setAnalyzing] = useState(false);
  const [rebalancePreview, setRebalancePreview] = useState(null);

  if (!isOpen) return null;

  const handleToggleSelectTask = (id) => {
    if (selectedMissedIds.includes(id)) {
      setSelectedMissedIds(selectedMissedIds.filter(i => i !== id));
    } else {
      setSelectedMissedIds([...selectedMissedIds, id]);
    }
  };

  const handleCalculateRebalance = async () => {
    if (selectedMissedIds.length === 0) {
      onNotify('Select at least one uncompleted task to re-schedule.', 'warning');
      return;
    }

    setAnalyzing(true);
    try {
      const result = await aiService.adaptivelyReschedule(schedule, selectedMissedIds, maxDailyHours);
      setRebalancePreview(result);
    } catch (err) {
      onNotify('Failed to re-balance schedule.', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleApply = () => {
    if (rebalancePreview) {
      onApplyReschedule(rebalancePreview.updatedSchedule);
      onNotify('AI Re-balanced schedule applied successfully!', 'success');
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '720px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" style={{ color: 'var(--accent-amber)' }}>
            <AlertTriangle size={22} />
            <span>AI Dynamic Adaptive Re-Scheduler</span>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Fell behind on your study plan? Don't worry! Select missed topics below and specify your daily hour limit. The AI will re-balance your study load without burning you out.
        </p>

        {/* Step 1: Select Tasks */}
        {!rebalancePreview ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">
                <Clock size={14} /> Maximum Daily Study Capacity (Hours/Day)
              </label>
              <select
                className="form-select"
                value={maxDailyHours}
                onChange={(e) => setMaxDailyHours(parseFloat(e.target.value))}
              >
                <option value="1.5">1.5 Hours / Day (Light)</option>
                <option value="2">2.0 Hours / Day (Recommended)</option>
                <option value="3">3.0 Hours / Day (Intensive)</option>
                <option value="4">4.0 Hours / Day (Bootcamp)</option>
              </select>
            </div>

            <label className="form-label">Select Missed / Behind Tasks ({selectedMissedIds.length} Selected)</label>
            <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
              {uncompletedTasks.map((t) => {
                const isSelected = selectedMissedIds.includes(t.id);
                return (
                  <div
                    key={t.id}
                    onClick={() => handleToggleSelectTask(t.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: isSelected ? 'rgba(245, 158, 11, 0.1)' : 'rgba(15, 23, 42, 0.7)',
                      border: `1px solid ${isSelected ? 'rgba(245, 158, 11, 0.4)' : 'var(--border-light)'}`,
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{t.title}</span>
                    <span className="badge badge-purple">{t.durationMins}m</span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button className="btn btn-warning" onClick={handleCalculateRebalance} disabled={analyzing}>
                <Sparkles size={18} />
                <span>{analyzing ? 'AI Re-balancing Workload...' : 'Recalculate Adaptive Schedule'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Step 2: Before & After Diff Preview */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-card" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
              <h4 style={{ color: 'var(--accent-emerald)', fontWeight: 700, marginBottom: '6px' }}>✨ AI Redistribution Plan Ready</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{rebalancePreview.summary}</p>
            </div>

            <div style={{ maxHeight: '260px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {rebalancePreview.updatedSchedule.map((t, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(15, 23, 42, 0.8)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <div>
                    <span className="badge badge-amber" style={{ marginRight: '8px', fontSize: '0.7rem' }}>{t.day}</span>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{t.title}</span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.durationMins}m</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setRebalancePreview(null)}>
                Recalculate Again
              </button>

              <button className="btn btn-accent" onClick={handleApply}>
                <CheckCircle2 size={18} />
                <span>Apply Re-balanced Plan</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
