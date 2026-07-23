import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LearningPathGenerator from './components/LearningPathGenerator';
import SyllabusParser from './components/SyllabusParser';
import StudyPlanner from './components/StudyPlanner';
import FocusStudyHub from './components/FocusStudyHub';
import AIMentorChat from './components/AIMentorChat';
import StreakCalendarModal from './components/StreakCalendarModal';
import ApiKeyModal from './components/ApiKeyModal';
import AdaptiveReschedulerModal from './components/AdaptiveReschedulerModal';
import TopicQuizModal from './components/TopicQuizModal';
import StudyGroupsModal from './components/StudyGroupsModal';
import PredictiveAnalyticsModal from './components/PredictiveAnalyticsModal';
import { storageService } from './services/storageService';
import { aiService } from './services/aiService';

export default function App() {
  const [activeTab, setActiveTab] = useState('roadmap');
  const [resetKey, setResetKey] = useState(0);
  const [logs, setLogs] = useState(storageService.getStudyLogs());
  const [schedule, setSchedule] = useState(storageService.getStudySchedule());
  const [apiKey, setApiKey] = useState(storageService.getApiKey());
  
  // Modals
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isReschedulerModalOpen, setIsReschedulerModalOpen] = useState(false);
  const [isStudyGroupsModalOpen, setIsStudyGroupsModalOpen] = useState(false);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);

  // Topic Completion Quiz State
  const [topicQuizState, setTopicQuizState] = useState({ isOpen: false, topicTitle: '' });
  
  // Toast
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // Initial sync
    setLogs(storageService.getStudyLogs());
    setSchedule(storageService.getStudySchedule());
  }, []);

  const notify = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handlePushTopicsToSchedule = (topics, dailyHours = 2, totalWeeks = 4) => {
    const generated = aiService.generateScheduleFromTopics(topics, dailyHours, totalWeeks);
    setSchedule(generated);
    storageService.setStudySchedule(generated);
    setActiveTab('schedule');
    notify(`Pushed ${topics.length} study topics into a ${totalWeeks}-week consecutive daily schedule!`, 'success');
  };

  const handleToggleTask = (taskId) => {
    const targetTask = schedule.find(t => t.id === taskId);
    if (!targetTask) return;

    const willBeCompleted = !targetTask.completed;

    const updated = schedule.map(t => {
      if (t.id === taskId) {
        const nextCompleted = !t.completed;
        return {
          ...t,
          completed: nextCompleted,
          status: nextCompleted ? 'completed' : 'pending'
        };
      }
      return t;
    });

    setSchedule(updated);
    storageService.setStudySchedule(updated);

    if (willBeCompleted) {
      handleUpdateLogs(targetTask.durationMins || 60, targetTask.title);
      // Trigger V2 Topic Completion Quiz modal
      setTopicQuizState({ isOpen: true, topicTitle: targetTask.title });
    } else {
      handleRemoveLogs(targetTask.title, targetTask.durationMins || 60);
    }
  };

  const handleToggleSubtopic = (taskId, subtopicId) => {
    const updated = schedule.map(t => {
      if (t.id === taskId && t.subtopics) {
        const updatedSubs = t.subtopics.map(st => {
          if (st.id === subtopicId) {
            return { ...st, completed: !st.completed };
          }
          return st;
        });
        const allSubsDone = updatedSubs.every(s => s.completed);
        return {
          ...t,
          subtopics: updatedSubs,
          completed: allSubsDone,
          status: allSubsDone ? 'completed' : 'pending'
        };
      }
      return t;
    });

    setSchedule(updated);
    storageService.setStudySchedule(updated);
  };

  const handleRescheduleSubmit = async (missedTaskIds, maxDailyHours) => {
    try {
      const result = await aiService.adaptivelyReschedule(schedule, missedTaskIds, maxDailyHours);
      setSchedule(result.updatedSchedule);
      storageService.setStudySchedule(result.updatedSchedule);
      setIsReschedulerModalOpen(false);
      notify(result.summary, 'success');
    } catch (err) {
      notify('Failed to rebalance schedule', 'error');
    }
  };

  const handleUpdateLogs = (minutes, title, source = 'Pomodoro Focus Hub') => {
    const updated = storageService.updateStudyLogs(minutes, title, source);
    setLogs(updated);
  };

  const handleRemoveLogs = (title, minutes) => {
    const updated = storageService.removeStudyLog(title, minutes);
    setLogs(updated);
  };

  const handleTopicQuizCompleted = (score, total, bonusXP) => {
    const updated = storageService.updateStudyLogs(15, `Quiz Passed: ${topicQuizState.topicTitle}`, 'Topic Completion Quiz');
    setLogs(updated);
    notify(`🏆 Topic Quiz Passed (${score}/${total})! Earned +${bonusXP} Bonus XP!`, 'success');
  };

  const handleResetAll = () => {
    if (window.confirm("Are you sure you want to reset all study logs, schedules, and streaks to 0 to start fresh?")) {
      const zeroLogs = storageService.resetAllData();
      setLogs(zeroLogs);
      setSchedule([]);
      setResetKey(prev => prev + 1);
      setActiveTab('roadmap');
      notify('🔄 All study data reset to zero! Ready to start fresh.', 'warning');
    }
  };

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navbar */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        setActiveTab={setActiveTab}
        logs={logs}
        onOpenStreakModal={() => setIsStreakModalOpen(true)}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onOpenStudyGroups={() => setIsStudyGroupsModalOpen(true)}
        onOpenAnalytics={() => setIsAnalyticsModalOpen(true)}
        hasApiKey={Boolean(apiKey)}
        apiKey={apiKey}
        onResetAll={handleResetAll}
      />

      {/* Toast Notification */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Content Router */}
      <main className="main-content" style={{ flex: 1 }}>
        {activeTab === 'roadmap' && (
          <LearningPathGenerator
            key={resetKey}
            resetKey={resetKey}
            onPushToSchedule={handlePushTopicsToSchedule}
            onNotify={notify}
          />
        )}

        {activeTab === 'syllabus' && (
          <SyllabusParser
            key={resetKey}
            onPushToSchedule={handlePushTopicsToSchedule}
            onNotify={notify}
          />
        )}

        {activeTab === 'schedule' && (
          <StudyPlanner
            key={resetKey}
            schedule={schedule}
            onToggleTask={handleToggleTask}
            onToggleSubtopic={handleToggleSubtopic}
            onOpenRescheduler={() => setIsReschedulerModalOpen(true)}
            onNotify={notify}
          />
        )}

        {activeTab === 'focus' && (
          <FocusStudyHub
            key={resetKey}
            schedule={schedule}
            onUpdateLogs={handleUpdateLogs}
            onNotify={notify}
          />
        )}

        {activeTab === 'mentor' && (
          <AIMentorChat
            key={resetKey}
            onNotify={notify}
          />
        )}
      </main>

      {/* App Footer referencing roadmap.sh */}
      <footer
        style={{
          marginTop: '40px',
          paddingTop: '20px',
          paddingBottom: '20px',
          borderTop: '1px solid var(--border-light)',
          textAlign: 'center',
          fontSize: '0.82rem',
          color: 'var(--text-subtle)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
          <span>🧠 <strong>Apex Learn AI v2</strong></span>
          <span>•</span>
          <span>Learning Path Curriculum & Roadmaps Referenced from <a href="https://roadmap.sh" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-cyan)', fontWeight: 700, textDecoration: 'none' }}>roadmap.sh</a></span>
        </div>
        <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--text-muted)' }}>
          Macro AI Roadmaps • Handwritten Notes OCR • Adaptive Micro Schedule • AI Mentor Chat • Spaced Repetition • Team Study Groups
        </p>
      </footer>

      {/* Modals */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSaveKey={(key) => setApiKey(key)}
      />

      <StreakCalendarModal
        isOpen={isStreakModalOpen}
        onClose={() => setIsStreakModalOpen(false)}
        logs={logs}
      />

      <AdaptiveReschedulerModal
        isOpen={isReschedulerModalOpen}
        onClose={() => setIsReschedulerModalOpen(false)}
        schedule={schedule}
        onReschedule={handleRescheduleSubmit}
      />

      <TopicQuizModal
        isOpen={topicQuizState.isOpen}
        onClose={() => setTopicQuizState({ ...topicQuizState, isOpen: false })}
        topicTitle={topicQuizState.topicTitle}
        onQuizCompleted={handleTopicQuizCompleted}
      />

      <StudyGroupsModal
        isOpen={isStudyGroupsModalOpen}
        onClose={() => setIsStudyGroupsModalOpen(false)}
        onNotify={notify}
      />

      <PredictiveAnalyticsModal
        isOpen={isAnalyticsModalOpen}
        onClose={() => setIsAnalyticsModalOpen(false)}
        schedule={schedule}
        logs={logs}
      />
    </div>
  );
}
