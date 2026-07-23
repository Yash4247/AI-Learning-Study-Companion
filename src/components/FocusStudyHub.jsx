import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, CheckCircle2, Clock, Flame, Brain, Sparkles, AlertCircle, CalendarPlus, Trophy, Award, Zap } from 'lucide-react';
import { aiService } from '../services/aiService';
import { storageService } from '../services/storageService';

export default function FocusStudyHub({ schedule = [], onUpdateLogs, onNotify }) {
  const [selectedTopic, setSelectedTopic] = useState('');
  const [mode, setMode] = useState('pomodoro'); // 'pomodoro' | 'stopwatch'
  const [targetMinutes, setTargetMinutes] = useState(25);
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [customMinutesInput, setCustomMinutesInput] = useState('25');

  // AI Flashcards & Retention State
  const [aiContent, setAiContent] = useState(null);
  const [activeFlashcardIndex, setActiveFlashcardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);
  const [cardStatusMsg, setCardStatusMsg] = useState(null);

  // Interval loop
  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        if (mode === 'pomodoro') {
          if (seconds > 0) {
            setSeconds(s => s - 1);
          } else if (minutes > 0) {
            setMinutes(m => m - 1);
            setSeconds(59);
          } else {
            // Countdown finished!
            setIsActive(false);
            onUpdateLogs(targetMinutes, selectedTopic || 'Focus Study Session', 'Pomodoro Timer');
            onNotify(`🎉 Great work! ${targetMinutes}-Minute Focus Session Completed!`, 'success');
            setMinutes(targetMinutes);
            setSeconds(0);
          }
        } else {
          // Stopwatch mode: count UP
          setStopwatchSeconds(s => s + 1);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds, stopwatchSeconds, mode, targetMinutes, selectedTopic]);

  useEffect(() => {
    if (selectedTopic) {
      handleLoadAiContent(selectedTopic);
    } else if (schedule && schedule.length > 0) {
      const firstPending = schedule.find(t => !t.completed);
      if (firstPending) {
        setSelectedTopic(firstPending.title);
      }
    }
  }, [schedule]);

  const handleLoadAiContent = async (topicTitle) => {
    setLoadingAi(true);
    setShowAnswer(false);
    setActiveFlashcardIndex(0);
    setCardStatusMsg(null);
    try {
      const content = await aiService.generateTopicRetention(topicTitle);
      setAiContent(content);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleSelectPreset = (mins) => {
    setIsActive(false);
    setTargetMinutes(mins);
    setMinutes(mins);
    setSeconds(0);
  };

  const handleApplyCustomMinutes = (e) => {
    e.preventDefault();
    const parsed = parseInt(customMinutesInput) || 25;
    handleSelectPreset(parsed);
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    if (mode === 'pomodoro') {
      setMinutes(targetMinutes);
      setSeconds(0);
    } else {
      setStopwatchSeconds(0);
    }
  };

  const handleLogStopwatchSession = () => {
    setIsActive(false);
    const elapsedMins = Math.max(1, Math.round(stopwatchSeconds / 60));
    onUpdateLogs(elapsedMins, selectedTopic || 'Stopwatch Study Session', 'Stopwatch Mode');
    onNotify(`🔥 Logged ${elapsedMins} Mins of Stopwatch Study Time!`, 'success');
    setStopwatchSeconds(0);
  };

  const handleSpacedRepetitionGrade = (grade) => {
    const cardId = `card-${selectedTopic}-${activeFlashcardIndex}`;
    const updatedCard = storageService.updateSpacedRepetitionCard(cardId, grade);
    
    const gradeLabels = { hard: '🔴 1 Day (Hard)', good: '🟡 3 Days (Good)', easy: '🟢 7 Days (Easy)' };
    setCardStatusMsg(`Spaced Review Set: ${gradeLabels[grade]} (Next Due: ${updatedCard.nextDueDateStr})`);
    
    setTimeout(() => {
      setShowAnswer(false);
      setCardStatusMsg(null);
      if (aiContent && activeFlashcardIndex < aiContent.flashcards.length - 1) {
        setActiveFlashcardIndex(prev => prev + 1);
      }
    }, 1200);
  };

  // Helper formatting for Stopwatch
  const formatStopwatch = (totalSec) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    const pad = (n) => String(n).padStart(2, '0');
    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  const formatTimer = (m, s) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(m)}:${pad(s)}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Banner */}
      <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '12px', color: 'var(--primary)' }}>
              <Clock size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Focus Study Hub & Pomodoro Engine</h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Select a topic from your daily planner, start your focus timer, and review AI flashcards with Spaced Repetition!
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className={`btn btn-sm ${mode === 'pomodoro' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setMode('pomodoro'); setIsActive(false); }}
            >
              ⏱️ Pomodoro Timer
            </button>
            <button
              className={`btn btn-sm ${mode === 'stopwatch' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setMode('stopwatch'); setIsActive(false); }}
            >
              ⏲️ Free Stopwatch
            </button>
          </div>
        </div>

        {/* Topic Selector Dropdown */}
        <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-subtle)' }}>
            Active Topic Focus:
          </span>

          <select
            className="form-select"
            style={{ maxWidth: '420px', flex: 1, fontSize: '0.88rem' }}
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
          >
            <option value="">-- Custom General Study Session --</option>
            {schedule.map((t) => (
              <option key={t.id} value={t.title}>
                {t.completed ? '✓' : '○'} {t.day}: {t.title.length > 50 ? t.title.substring(0, 50) + '...' : t.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid Layout: Timer Left + Flashcards Right */}
      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Left Card: Pomodoro / Stopwatch Display */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '36px 24px' }}>
          <span className="badge badge-purple" style={{ marginBottom: '16px', fontSize: '0.8rem' }}>
            {mode === 'pomodoro' ? `${targetMinutes} MIN FOCUS COUNTDOWN` : 'STOPWATCH STUDY MODE'}
          </span>

          <div style={{ fontSize: '4.2rem', fontWeight: 900, fontFamily: 'monospace', letterSpacing: '2px', color: 'var(--text-main)', margin: '10px 0' }}>
            {mode === 'pomodoro' ? formatTimer(minutes, seconds) : formatStopwatch(stopwatchSeconds)}
          </div>

          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
            {selectedTopic ? `Studying: ${selectedTopic}` : 'General Deep Focus Study'}
          </p>

          {/* Controls */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              className={`btn ${isActive ? 'btn-secondary' : 'btn-primary'}`}
              onClick={toggleTimer}
              style={{ minWidth: '130px', padding: '12px 24px', fontSize: '1rem', fontWeight: 700 }}
            >
              {isActive ? <><Pause size={18} /> Pause</> : <><Play size={18} /> Start Session</>}
            </button>

            <button className="btn btn-secondary" onClick={resetTimer} title="Reset Timer">
              <RotateCcw size={18} /> Reset
            </button>

            {mode === 'stopwatch' && stopwatchSeconds > 30 && (
              <button className="btn btn-accent" onClick={handleLogStopwatchSession}>
                <CheckCircle2 size={18} /> Log Time ({Math.round(stopwatchSeconds / 60)}m)
              </button>
            )}
          </div>

          {/* Preset Buttons for Pomodoro */}
          {mode === 'pomodoro' && (
            <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border-light)', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', fontWeight: 700, textTransform: 'uppercase' }}>
                Preset Focus Durations:
              </span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {[15, 25, 45, 60, 90].map((mins) => (
                  <button
                    key={mins}
                    className={`btn btn-sm ${targetMinutes === mins ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => handleSelectPreset(mins)}
                  >
                    {mins}m
                  </button>
                ))}
              </div>

              {/* Custom Duration Form */}
              <form onSubmit={handleApplyCustomMinutes} style={{ display: 'flex', gap: '8px', marginTop: '4px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Custom:</span>
                <input
                  type="number"
                  min="1"
                  max="180"
                  className="form-input"
                  style={{ width: '80px', padding: '6px 10px', fontSize: '0.85rem' }}
                  value={customMinutesInput}
                  onChange={(e) => setCustomMinutesInput(e.target.value)}
                />
                <button type="submit" className="btn btn-secondary btn-sm">Set</button>
              </form>
            </div>
          )}
        </div>

        {/* Right Card: AI Retention & Spaced Repetition Flashcards */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Brain size={20} color="var(--accent-cyan)" />
                <span>AI Spaced Repetition Flashcards</span>
              </h3>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-subtle)' }}>Anki SM-2 Algorithm Engine</span>
            </div>

            {selectedTopic && (
              <button className="btn btn-secondary btn-sm" onClick={() => handleLoadAiContent(selectedTopic)} disabled={loadingAi}>
                <Sparkles size={14} /> Refresh AI
              </button>
            )}
          </div>

          {loadingAi ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Sparkles size={24} style={{ marginBottom: '8px', color: 'var(--accent-cyan)' }} className="spin" />
              <div>Generating AI Flashcards & Spaced Repetition Questions...</div>
            </div>
          ) : !selectedTopic || !aiContent ? (
            <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Brain size={36} color="var(--text-subtle)" style={{ marginBottom: '12px' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>No Study Topic Selected</h4>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Generate a Learning Path or Syllabus to push topics here for instant AI flashcard reviews!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Spaced Repetition Status Banner */}
              {cardStatusMsg && (
                <div style={{ padding: '8px 12px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--accent-emerald)', textAlign: 'center', fontWeight: 700 }}>
                  {cardStatusMsg}
                </div>
              )}

              {/* Flashcard Component */}
              <div
                onClick={() => setShowAnswer(!showAnswer)}
                style={{
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid var(--border-glow)',
                  borderRadius: 'var(--radius-md)',
                  padding: '24px',
                  minHeight: '140px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease'
                }}
              >
                {!showAnswer ? (
                  <>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-purple)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                      Question (Click to reveal answer)
                    </span>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{aiContent.flashcards[activeFlashcardIndex]?.question}</h4>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                      AI Answer
                    </span>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 500 }}>{aiContent.flashcards[activeFlashcardIndex]?.answer}</p>
                  </>
                )}
              </div>

              {/* Spaced Repetition Rating Buttons (Only shown when answer is revealed) */}
              {showAnswer ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-subtle)', textAlign: 'center', fontWeight: 700, textTransform: 'uppercase' }}>
                    Rate Your Memory Recall (Anki SM-2 Interval):
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleSpacedRepetitionGrade('hard')}
                      style={{ borderColor: 'rgba(239, 68, 68, 0.5)', color: 'var(--accent-rose)', background: 'rgba(239, 68, 68, 0.1)' }}
                    >
                      🔴 Hard (1d)
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleSpacedRepetitionGrade('good')}
                      style={{ borderColor: 'rgba(245, 158, 11, 0.5)', color: 'var(--accent-amber)', background: 'rgba(245, 158, 11, 0.1)' }}
                    >
                      🟡 Good (3d)
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleSpacedRepetitionGrade('easy')}
                      style={{ borderColor: 'rgba(16, 185, 129, 0.5)', color: 'var(--accent-emerald)', background: 'rgba(16, 185, 129, 0.1)' }}
                    >
                      🟢 Easy (7d)
                    </button>
                  </div>
                </div>
              ) : (
                /* Card Navigation */
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={activeFlashcardIndex === 0}
                    onClick={() => { setActiveFlashcardIndex(activeFlashcardIndex - 1); setShowAnswer(false); }}
                  >
                    Previous
                  </button>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Card {activeFlashcardIndex + 1} of {aiContent.flashcards.length}
                  </span>
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={activeFlashcardIndex === aiContent.flashcards.length - 1}
                    onClick={() => { setActiveFlashcardIndex(activeFlashcardIndex + 1); setShowAnswer(false); }}
                  >
                    Next Card
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
