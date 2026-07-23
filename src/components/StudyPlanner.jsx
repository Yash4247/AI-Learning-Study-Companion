import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle2, Circle, AlertTriangle, Filter, ChevronDown, ChevronUp, ListChecks, CheckSquare, Square, Trophy, Sparkles, Search, Layers, X, Download, Share2, Globe, Brain } from 'lucide-react';
import { generateSubtopicsForTitle } from '../services/aiService';
import { calendarService } from '../services/calendarService';
import { storageService } from '../services/storageService';
import SundayQuizModal from './SundayQuizModal';

export default function StudyPlanner({ schedule, onToggleTask, onToggleSubtopic, onOpenRescheduler, onNotify }) {
  const [selectedWeekFilter, setSelectedWeekFilter] = useState('All');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTasks, setExpandedTasks] = useState({});

  // Sunday Quiz Modal State
  const [quizModalState, setQuizModalState] = useState({ isOpen: false, weekNumber: 1, taskTitle: '', taskId: null, subtopicId: null, subtopicTitle: '' });

  const toggleExpand = (taskId) => {
    setExpandedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const openSundayQuiz = (task) => {
    const subtopics = task.subtopics || [];
    const quizSub = subtopics.find(s => s.title.toLowerCase().includes('quiz') || s.title.toLowerCase().includes('assessment')) || subtopics[0];

    setQuizModalState({
      isOpen: true,
      weekNumber: task.weekNumber || 1,
      taskTitle: task.title,
      taskId: task.id,
      subtopicId: quizSub ? quizSub.id : null,
      subtopicTitle: quizSub ? quizSub.title : 'Sunday Retention Quiz'
    });
  };

  const handleSundayQuizComplete = (score, total) => {
    if (quizModalState.taskId && quizModalState.subtopicId) {
      if (onToggleSubtopic) {
        onToggleSubtopic(quizModalState.taskId, quizModalState.subtopicId);
      }
      onNotify(`🏆 Sunday Quiz Passed (${score}/${total})! Sub-topic "${quizModalState.subtopicTitle}" checked off!`, 'success');
    } else if (quizModalState.taskId) {
      onToggleTask(quizModalState.taskId);
      onNotify(`🏆 Sunday Retention Quiz Passed (${score}/${total})! Logged bonus streak points!`, 'success');
    }
  };

  const handleDownloadIcs = () => {
    calendarService.downloadIcsFile(schedule, 'Apex Learn Daily Study Schedule');
    onNotify('Downloaded .ics Calendar file! Import into Google Calendar, Outlook, or Apple Calendar.', 'success');
  };

  const handleExportGoogleCalendar = (task) => {
    const url = calendarService.getGoogleCalendarUrl({
      title: task.title,
      description: `Study task from Apex Learn AI. Priority: ${task.priority}`,
      startDate: new Date(),
      durationMins: task.durationMins || 90
    });
    window.open(url, '_blank');
  };

  const completedCount = schedule.filter(t => t.completed).length;
  const totalCount = schedule.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Extract available weeks
  const availableWeeks = ['All', ...new Set(schedule.map(t => t.weekNumber || 1))].sort();

  // Multi-dimensional filtering logic
  const filteredSchedule = schedule.filter(task => {
    const taskWeek = task.weekNumber || 1;
    const taskDayStr = (task.day || '').toLowerCase();
    const isSunday = taskDayStr.includes('sunday') || task.title.toLowerCase().includes('capstone') || taskDayStr.includes('day 7') || taskDayStr.includes('day 14') || taskDayStr.includes('day 21') || taskDayStr.includes('day 28');
    const isSaturday = taskDayStr.includes('saturday') || task.title.toLowerCase().includes('consolidation');
    const isWeekday = !isSaturday && !isSunday;

    const matchesWeek = selectedWeekFilter === 'All' || taskWeek === parseInt(selectedWeekFilter);
    
    let matchesType = true;
    if (selectedTypeFilter === 'weekdays') matchesType = isWeekday;
    else if (selectedTypeFilter === 'saturdays') matchesType = isSaturday;
    else if (selectedTypeFilter === 'sundays') matchesType = isSunday;

    let matchesStatus = true;
    if (selectedStatusFilter === 'completed') matchesStatus = task.completed;
    else if (selectedStatusFilter === 'pending') matchesStatus = !task.completed;

    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesWeek && matchesType && matchesStatus && matchesSearch;
  });

  // Group tasks by Day
  const tasksByDay = filteredSchedule.reduce((acc, task) => {
    const dayKey = task.day || 'Day 1';
    if (!acc[dayKey]) acc[dayKey] = [];
    acc[dayKey].push(task);
    return acc;
  }, {});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Overview & Progress Card */}
      <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Adaptive Micro Daily Planner</h2>
              <span className="badge badge-emerald">{progressPercent}% Completed</span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Sequential day-wise study schedule with micro sub-topics breakdown & <strong>Sunday Retention Quizzes</strong>.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={handleDownloadIcs} title="Export full schedule to Google/Outlook Calendar (.ics)">
              <Download size={16} />
              <span>Export Calendar (.ics)</span>
            </button>
            <button className="btn btn-warning" onClick={onOpenRescheduler}>
              <AlertTriangle size={18} />
              <span>I Fell Behind! (AI Re-schedule)</span>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
            <span>Study Schedule Completion</span>
            <span>{completedCount} of {totalCount} Sessions Finished</span>
          </div>
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>
      </div>

      {/* Professional Multi-Dimensional Filter Dock */}
      <div
        className="glass-card"
        style={{
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.85))',
          border: '1px solid var(--border-light)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={18} color="var(--accent-cyan)" />
            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Professional Schedule Filter Dock
            </span>
          </div>

          {/* Search bar */}
          <div style={{ position: 'relative', minWidth: '220px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '32px', fontSize: '0.82rem', height: '34px' }}
              placeholder="Search study topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Week Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Week:</span>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {availableWeeks.map(w => (
                <button
                  key={w}
                  className={`btn btn-sm ${selectedWeekFilter === String(w) ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                  onClick={() => setSelectedWeekFilter(String(w))}
                >
                  {w === 'All' ? 'All Weeks' : `W${w}`}
                </button>
              ))}
            </div>
          </div>

          {/* Type Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Category:</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[
                { id: 'All', label: 'All Days' },
                { id: 'weekdays', label: 'Weekdays' },
                { id: 'saturdays', label: 'Saturdays' },
                { id: 'sundays', label: 'Sundays (Quizzes)' }
              ].map(t => (
                <button
                  key={t.id}
                  className={`btn btn-sm ${selectedTypeFilter === t.id ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                  onClick={() => setSelectedTypeFilter(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status:</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[
                { id: 'All', label: 'All' },
                { id: 'pending', label: 'Pending' },
                { id: 'completed', label: 'Completed' }
              ].map(s => (
                <button
                  key={s.id}
                  className={`btn btn-sm ${selectedStatusFilter === s.id ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                  onClick={() => setSelectedStatusFilter(s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Days Timeline List */}
      {Object.keys(tasksByDay).length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '48px 20px' }}>
          <Calendar size={48} color="var(--text-subtle)" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>No Study Sessions Match Active Filters</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Try resetting your week, category, or search filters to view your study schedule.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {Object.entries(tasksByDay).map(([dayTitle, dayTasks]) => {
            const isSunday = dayTitle.toLowerCase().includes('sunday') || dayTitle.toLowerCase().includes('day 7') || dayTitle.toLowerCase().includes('day 14') || dayTitle.toLowerCase().includes('day 21') || dayTitle.toLowerCase().includes('day 28');
            const isSaturday = dayTitle.toLowerCase().includes('saturday');

            return (
              <div key={dayTitle} className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Calendar size={18} color={isSunday ? 'var(--accent-amber)' : isSaturday ? 'var(--accent-cyan)' : 'var(--primary)'} />
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>{dayTitle}</h3>
                  </div>

                  {isSunday && (
                    <span className="badge badge-amber">🏆 Weekly Retention Check & Quiz Day</span>
                  )}
                  {isSaturday && (
                    <span className="badge badge-cyan">🛠️ Consolidation & Code Review Day</span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {dayTasks.map((task) => {
                    const isExpanded = Boolean(expandedTasks[task.id]);
                    const subtopics = task.subtopics && task.subtopics.length > 0 
                      ? task.subtopics 
                      : generateSubtopicsForTitle(task.title).map((stTitle, sIdx) => ({
                          id: `sub-${task.id}-${sIdx}`,
                          title: typeof stTitle === 'string' ? stTitle : stTitle.title,
                          completed: false
                        }));

                    const completedSubsCount = subtopics.filter(s => s.completed).length;
                    const isSundayQuizTask = task.title.toLowerCase().includes('quiz') || task.title.toLowerCase().includes('capstone') || isSunday;

                    return (
                      <div
                        key={task.id}
                        style={{
                          background: task.completed ? 'rgba(16, 185, 129, 0.08)' : 'rgba(15, 23, 42, 0.7)',
                          border: `1px solid ${task.completed ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-light)'}`,
                          borderRadius: '12px',
                          padding: '14px 18px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '260px' }}>
                            <div
                              onClick={() => onToggleTask(task.id)}
                              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            >
                              {task.completed ? (
                                <CheckCircle2 size={22} color="var(--accent-emerald)" />
                              ) : (
                                <Circle size={22} color="var(--text-subtle)" />
                              )}
                            </div>

                            <div>
                              <h4 style={{
                                fontSize: '0.96rem',
                                fontWeight: 700,
                                textDecoration: task.completed ? 'line-through' : 'none',
                                color: task.completed ? 'var(--text-muted)' : 'var(--text-main)'
                              }}>
                                {task.title}
                              </h4>
                              <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
                                Time Slot: {task.timeSlot} • Resource: {task.resource || 'Official Docs'}
                              </span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {/* Google Calendar export icon */}
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleExportGoogleCalendar(task)}
                              title="Export task to Google Calendar"
                              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            >
                              <Calendar size={12} /> GCal
                            </button>

                            {isSundayQuizTask && (
                              <button
                                className="btn btn-accent btn-sm"
                                onClick={() => openSundayQuiz(task)}
                                style={{ fontSize: '0.78rem', padding: '4px 10px', background: 'rgba(245, 158, 11, 0.2)', borderColor: 'var(--accent-amber)', color: 'var(--accent-amber)' }}
                              >
                                <Trophy size={14} /> Take Sunday Quiz
                              </button>
                            )}

                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => toggleExpand(task.id)}
                              style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                            >
                              <ListChecks size={14} />
                              <span>{completedSubsCount} / {subtopics.length} Sub-topics</span>
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          </div>
                        </div>

                        {/* Expandable Sub-topics Checklist Drawer */}
                        {isExpanded && (
                          <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '34px' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              📋 Sub-topics Action Checklist:
                            </span>

                            {subtopics.map((subtopic) => (
                              <div
                                key={subtopic.id}
                                onClick={() => onToggleSubtopic && onToggleSubtopic(task.id, subtopic.id)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '10px',
                                  cursor: 'pointer',
                                  fontSize: '0.86rem',
                                  color: subtopic.completed ? 'var(--text-muted)' : 'var(--text-main)',
                                  textDecoration: subtopic.completed ? 'line-through' : 'none'
                                }}
                              >
                                {subtopic.completed ? (
                                  <CheckSquare size={16} color="var(--accent-emerald)" />
                                ) : (
                                  <Square size={16} color="var(--text-subtle)" />
                                )}
                                <span>{subtopic.title}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sunday Retention Quiz Modal */}
      <SundayQuizModal
        isOpen={quizModalState.isOpen}
        onClose={() => setQuizModalState({ ...quizModalState, isOpen: false })}
        weekNumber={quizModalState.weekNumber}
        taskTitle={quizModalState.taskTitle}
        onQuizComplete={handleSundayQuizComplete}
      />
    </div>
  );
}
