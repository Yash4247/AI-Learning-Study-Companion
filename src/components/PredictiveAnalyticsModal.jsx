import React from 'react';
import { TrendingUp, X, Target, Calendar, AlertTriangle, CheckCircle2, Award, Zap } from 'lucide-react';
import { aiService } from '../services/aiService';
import { storageService } from '../services/storageService';

export default function PredictiveAnalyticsModal({ isOpen, onClose, schedule = [], logs = {} }) {
  if (!isOpen) return null;

  const profile = storageService.getUserProfile();
  const history = logs.history || [];
  const durationWeeks = parseInt(profile.durationWeeks) || 4;

  const analytics = aiService.predictTargetDateAnalytics(schedule, history, durationWeeks);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content glass-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '660px', width: '92%', padding: '28px', background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '18px' }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px', background: 'rgba(99, 102, 241, 0.15)', borderRadius: '12px', color: 'var(--primary)' }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Predictive Analytics & Completion Forecast</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                AI velocity model estimating your completion date vs target goal for <strong>{profile.goal || 'Software Engineering'}</strong>.
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Probability Gauge Banner */}
        <div
          className="glass-card"
          style={{
            padding: '20px',
            borderRadius: '14px',
            marginBottom: '20px',
            background: `linear-gradient(135deg, ${analytics.probabilityScore >= 70 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}, rgba(15, 23, 42, 0.8))`,
            border: `1px solid ${analytics.statusColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap'
          }}
        >
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Completion Probability Score
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '2px' }}>
              <span style={{ fontSize: '2.4rem', fontWeight: 900, color: analytics.statusColor }}>
                {analytics.probabilityScore}%
              </span>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: analytics.statusColor }}>
                {analytics.riskLevel}
              </span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', fontWeight: 600 }}>Projected Finish Date</span>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
              📅 {analytics.projectedDateStr}
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target: {analytics.targetDateStr}</span>
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid-2" style={{ marginBottom: '20px' }}>
          <div className="glass-card" style={{ padding: '16px' }}>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Current Study Velocity
            </span>
            <h4 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '4px' }}>
              ⚡ {analytics.currentPacePerDay} Tasks / Day
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', marginTop: '4px' }}>
              {analytics.completedTasks} of {analytics.totalTasks} total roadmap sessions completed over {analytics.daysElapsed} days.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '16px' }}>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Required Target Pace
            </span>
            <h4 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-amber)', marginTop: '4px' }}>
              🎯 {analytics.requiredPacePerDay} Tasks / Day
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', marginTop: '4px' }}>
              Pace required to finish all {analytics.remainingTasks} remaining tasks by {analytics.targetDateStr}.
            </p>
          </div>
        </div>

        {/* AI Velocity Alert Box */}
        <div
          style={{
            padding: '14px 18px',
            borderRadius: '10px',
            background: analytics.isAhead ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
            border: `1px solid ${analytics.isAhead ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
            fontSize: '0.84rem',
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          {analytics.isAhead ? <CheckCircle2 size={20} color="var(--accent-emerald)" /> : <AlertTriangle size={20} color="var(--accent-amber)" />}
          <div>
            <strong>AI Forecast Advice:</strong>{' '}
            {analytics.isAhead
              ? `You are currently on track or ahead of schedule! Maintaining your current pace will guarantee completion before ${analytics.targetDateStr}.`
              : `To reach your target finish date of ${analytics.targetDateStr}, consider increasing your daily study pace to ${analytics.requiredPacePerDay} tasks/day or use the AI Re-Scheduler.`}
          </div>
        </div>

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
