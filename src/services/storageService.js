const KEYS = {
  API_KEY: 'apex_learn_api_key',
  USER_PROFILE: 'apex_learn_profile',
  LEARNING_PATH: 'apex_learn_path',
  SYLLABI: 'apex_learn_syllabi',
  STUDY_SCHEDULE: 'apex_learn_schedule',
  STUDY_LOGS: 'apex_learn_logs',
  SPACED_REPETITION: 'apex_learn_spaced_rep'
};

export const storageService = {
  // API Key Management
  getApiKey: () => localStorage.getItem(KEYS.API_KEY) || '',
  setApiKey: (key) => localStorage.setItem(KEYS.API_KEY, key),

  // User Profile
  getUserProfile: () => {
    const saved = localStorage.getItem(KEYS.USER_PROFILE);
    return saved ? JSON.parse(saved) : { goal: '', skills: '', hoursPerWeek: 10, durationWeeks: 4 };
  },
  setUserProfile: (profile) => localStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile)),

  // Learning Path
  getLearningPath: () => {
    const saved = localStorage.getItem(KEYS.LEARNING_PATH);
    return saved ? JSON.parse(saved) : null;
  },
  setLearningPath: (path) => localStorage.setItem(KEYS.LEARNING_PATH, JSON.stringify(path)),

  // Syllabus Ingestion
  getSyllabi: () => {
    const saved = localStorage.getItem(KEYS.SYLLABI);
    return saved ? JSON.parse(saved) : [];
  },
  saveSyllabus: (syllabus) => {
    const current = storageService.getSyllabi();
    const updated = [syllabus, ...current.filter(s => s.id !== syllabus.id)];
    localStorage.setItem(KEYS.SYLLABI, JSON.stringify(updated));
  },

  // Daily Study Schedule
  getStudySchedule: () => {
    const saved = localStorage.getItem(KEYS.STUDY_SCHEDULE);
    return saved ? JSON.parse(saved) : [];
  },
  setStudySchedule: (schedule) => localStorage.setItem(KEYS.STUDY_SCHEDULE, JSON.stringify(schedule)),

  // Spaced Repetition Storage (Anki SM-2 Algorithm)
  getSpacedRepetitionData: () => {
    const saved = localStorage.getItem(KEYS.SPACED_REPETITION);
    return saved ? JSON.parse(saved) : {};
  },
  updateSpacedRepetitionCard: (cardId, grade) => {
    // grade: 'hard' (1 day), 'good' (3 days), 'easy' (7 days)
    const currentData = storageService.getSpacedRepetitionData();
    const card = currentData[cardId] || { repetitions: 0, interval: 1, easeFactor: 2.5 };
    
    let nextInterval = 1;
    if (grade === 'easy') {
      nextInterval = card.interval === 1 ? 7 : Math.round(card.interval * 2.5);
    } else if (grade === 'good') {
      nextInterval = card.interval === 1 ? 3 : Math.round(card.interval * 1.8);
    } else {
      nextInterval = 1; // Reset to 1 day on Hard
    }

    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + nextInterval);

    const updatedCard = {
      cardId,
      repetitions: card.repetitions + 1,
      interval: nextInterval,
      lastGrade: grade,
      nextDueDateStr: nextDueDate.toISOString().split('T')[0]
    };

    const updatedAll = { ...currentData, [cardId]: updatedCard };
    localStorage.setItem(KEYS.SPACED_REPETITION, JSON.stringify(updatedAll));
    return updatedCard;
  },

  // Study Logs & Streak Calculation
  getStudyLogs: () => {
    const saved = localStorage.getItem(KEYS.STUDY_LOGS);
    const todayStr = new Date().toISOString().split('T')[0];
    
    if (!saved) {
      const initial = {
        streak: 0,
        totalMinutes: 0,
        completedSessions: 0,
        lastStudyDate: null,
        studyDates: [],
        history: []
      };
      localStorage.setItem(KEYS.STUDY_LOGS, JSON.stringify(initial));
      return initial;
    }
    
    const parsed = JSON.parse(saved);
    if (!parsed.studyDates) {
      parsed.studyDates = [];
    }
    if (!parsed.history) {
      parsed.history = [];
    }
    
    // Reset streak if more than 1 day missed
    if (parsed.lastStudyDate) {
      const lastDate = new Date(parsed.lastStudyDate);
      const today = new Date(todayStr);
      const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays > 1) {
        parsed.streak = 0;
        localStorage.setItem(KEYS.STUDY_LOGS, JSON.stringify(parsed));
      }
    }
    return parsed;
  },

  // Calculate XP, Level, Badges
  calculateXPAndLevel: (logs) => {
    const totalMinutes = logs.totalMinutes || 0;
    const completedSessions = logs.completedSessions || 0;
    const streak = logs.streak || 0;
    const history = logs.history || [];

    const totalXP = (totalMinutes * 5) + (completedSessions * 100) + (streak * 50);
    const level = Math.floor(totalXP / 500) + 1;
    const currentLevelXP = totalXP % 500;
    const progressPercent = Math.min(100, Math.round((currentLevelXP / 500) * 100));

    const levelTitles = [
      "Novice Scholar", "Curious Apprentice", "Focused Explorer", "Knowledge Builder",
      "Code Architect", "Mastery Engineer", "System Specialist", "Senior Tech Scholar",
      "Grandmaster Developer", "Apex AI Genius"
    ];
    const levelTitle = levelTitles[Math.min(level - 1, levelTitles.length - 1)];

    const hasQuiz = history.some(h => (h.title || '').toLowerCase().includes('quiz'));

    const badges = [
      { id: 'b1', title: 'First Step', desc: 'Complete 1 study session', icon: '⚡', unlocked: completedSessions >= 1 },
      { id: 'b2', title: 'Streak Flame', desc: 'Reach a 3-day study streak', icon: '🔥', unlocked: streak >= 3 },
      { id: 'b3', title: 'Quiz Ace', desc: 'Pass a Retention Quiz', icon: '🏆', unlocked: hasQuiz },
      { id: 'b4', title: 'Century Club', desc: 'Log 100+ study minutes', icon: '💎', unlocked: totalMinutes >= 100 },
      { id: 'b5', title: 'Bootcamp Scholar', desc: 'Complete 5+ study sessions', icon: '🚀', unlocked: completedSessions >= 5 },
      { id: 'b6', title: 'Mastery Legend', desc: 'Reach Level 3 or 1000+ XP', icon: '👑', unlocked: totalXP >= 1000 }
    ];

    return {
      totalXP,
      level,
      levelTitle,
      currentLevelXP,
      nextLevelXP: 500,
      progressPercent,
      badges
    };
  },

  // Generate 365-Day Activity Heatmap Grid
  generateHeatmapData: (logs) => {
    const history = logs.history || [];
    const dateMap = {};

    history.forEach(item => {
      if (item.dateStr) {
        dateMap[item.dateStr] = (dateMap[item.dateStr] || 0) + (item.durationMins || 60);
      }
    });

    const days = [];
    const today = new Date();

    // 52 weeks * 7 days = 364 days back
    for (let i = 363; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const minutes = dateMap[dateStr] || 0;

      let level = 0;
      if (minutes >= 90) level = 4;
      else if (minutes >= 60) level = 3;
      else if (minutes >= 30) level = 2;
      else if (minutes > 0) level = 1;

      days.push({
        dateStr,
        displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        minutes,
        level
      });
    }

    return days;
  },

  resetAllData: () => {
    localStorage.removeItem(KEYS.LEARNING_PATH);
    localStorage.removeItem(KEYS.SYLLABI);
    localStorage.removeItem(KEYS.STUDY_SCHEDULE);
    localStorage.removeItem(KEYS.USER_PROFILE);
    localStorage.removeItem(KEYS.SPACED_REPETITION);
    
    const zeroLogs = {
      streak: 0,
      totalMinutes: 0,
      completedSessions: 0,
      lastStudyDate: null,
      studyDates: [],
      history: []
    };
    localStorage.setItem(KEYS.STUDY_LOGS, JSON.stringify(zeroLogs));
    return zeroLogs;
  },

  updateStudyLogs: (newMinutes = 0, title = 'Completed Focus Session', source = 'Pomodoro Focus Hub') => {
    const current = storageService.getStudyLogs();
    const todayStr = new Date().toISOString().split('T')[0];
    const currentHistory = current.history || [];
    
    // Prevent duplicate logging of identical task on the exact same date
    const alreadyLogged = currentHistory.find(item => item.title === title && item.dateStr === todayStr);
    if (alreadyLogged) {
      return current;
    }

    let newStreak = current.streak || 0;
    
    if (!current.lastStudyDate) {
      newStreak = 1;
    } else if (current.lastStudyDate !== todayStr) {
      const lastDate = new Date(current.lastStudyDate);
      const today = new Date(todayStr);
      const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newStreak = (current.streak || 0) + 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
    } else if (newStreak === 0) {
      newStreak = 1;
    }

    const currentDates = current.studyDates || [];
    const updatedDates = currentDates.includes(todayStr) ? currentDates : [...currentDates, todayStr];

    const newHistoryItem = {
      id: 'h-' + Date.now(),
      title,
      durationMins: newMinutes,
      date: new Date().toLocaleDateString(),
      dateStr: todayStr,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source
    };

    const updated = {
      ...current,
      streak: newStreak,
      totalMinutes: (current.totalMinutes || 0) + newMinutes,
      completedSessions: (current.completedSessions || 0) + 1,
      lastStudyDate: todayStr,
      studyDates: updatedDates,
      history: [newHistoryItem, ...currentHistory]
    };

    localStorage.setItem(KEYS.STUDY_LOGS, JSON.stringify(updated));
    return updated;
  },

  removeStudyLog: (title, minutes = 0) => {
    const current = storageService.getStudyLogs();
    const currentHistory = current.history || [];
    
    const indexToRemove = currentHistory.findIndex(item => item.title === title);
    if (indexToRemove !== -1) {
      const removedItem = currentHistory[indexToRemove];
      const updatedHistory = currentHistory.filter((_, idx) => idx !== indexToRemove);
      const minsDeducted = removedItem.durationMins || minutes || 0;

      const updated = {
        ...current,
        totalMinutes: Math.max(0, (current.totalMinutes || 0) - minsDeducted),
        completedSessions: Math.max(0, (current.completedSessions || 0) - 1),
        history: updatedHistory
      };

      localStorage.setItem(KEYS.STUDY_LOGS, JSON.stringify(updated));
      return updated;
    }
    return current;
  }
};
