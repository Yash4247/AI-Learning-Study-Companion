import React, { useState, useEffect } from 'react';
import { Award, CheckCircle2, XCircle, HelpCircle, ArrowRight, RotateCcw, Trophy, Sparkles, X, Loader2 } from 'lucide-react';
import { aiService } from '../services/aiService';
import { storageService } from '../services/storageService';

export default function SundayQuizModal({ isOpen, onClose, weekNumber = 1, taskTitle = '', onQuizComplete }) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [liveQuestions, setLiveQuestions] = useState(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const apiKey = storageService.getApiKey();
      if (apiKey && apiKey.trim().length > 5) {
        setLoadingQuiz(true);
        aiService.generateSundayQuiz(weekNumber, taskTitle)
          .then((res) => {
            if (res && res.length > 0) {
              setLiveQuestions(res);
            }
          })
          .catch(() => {})
          .finally(() => setLoadingQuiz(false));
      }
    } else {
      setLiveQuestions(null);
      setSubmitted(false);
      setSelectedAnswers({});
      setScore(0);
    }
  }, [isOpen, weekNumber, taskTitle]);

  if (!isOpen) return null;

  // Default benchmark questions used in Offline Mode (referenced from roadmap.sh standards)
  const defaultQuestions = [
    {
      id: 1,
      question: `What is the primary architectural goal of Week ${weekNumber} (${taskTitle.replace(/\[.*?\]/g, '').trim()})?`,
      options: [
        "To establish modular code structure and verify foundational concepts",
        "To skip core testing and deploy directly to production",
        "To eliminate all CSS styling and use raw HTML only",
        "To avoid using git version control"
      ],
      correct: 0,
      explanation: "Establishing modular code architecture and verifying foundational concepts ensures scalable software development."
    },
    {
      id: 2,
      question: `When executing Week ${weekNumber} study tasks, what is the best practice for handling complex sub-topics?`,
      options: [
        "Ignore error tracebacks and proceed blindly",
        "Break tasks into checkable micro sub-topics and verify step-by-step",
        "Wait 2 weeks before testing any code",
        "Delete failing test assertions"
      ],
      correct: 1,
      explanation: "Breaking complex modules into smaller sub-topics and verifying each step guarantees high knowledge retention."
    },
    {
      id: 3,
      question: `How should you validate that Week ${weekNumber} learning milestones are successfully achieved?`,
      options: [
        "By completing self-check exercises, hands-on code review, and passing weekly quizzes",
        "By reading documentation once without writing code",
        "By deleting all local git repositories",
        "By skipping revision sessions"
      ],
      correct: 0,
      explanation: "Hands-on coding, code reviews, and retention quizzes validate real-world competency."
    }
  ];

  const questions = (liveQuestions && liveQuestions.length > 0) ? liveQuestions : defaultQuestions;
  const isLiveAI = Boolean(liveQuestions && liveQuestions.length > 0);

  const handleSelectOption = (qId, optionIdx) => {
    if (submitted) return;
    setSelectedAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const handleSubmitQuiz = () => {
    let calculatedScore = 0;
    questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correct) {
        calculatedScore += 1;
      }
    });
    setScore(calculatedScore);
    setSubmitted(true);

    if (calculatedScore >= 2 && onQuizComplete) {
      onQuizComplete(calculatedScore, questions.length);
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  const isAllAnswered = questions.every(q => selectedAnswers[q.id] !== undefined);
  const passPercent = Math.round((score / questions.length) * 100);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content glass-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', width: '90%', padding: '28px', background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '16px' }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px', background: 'rgba(245, 158, 11, 0.15)', borderRadius: '12px', color: 'var(--accent-amber)' }}>
              <Trophy size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                  Sunday Retention Quiz (Week {weekNumber})
                </h3>
                {isLiveAI && (
                  <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>✨ Gemini AI Live</span>
                )}
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Test your knowledge from this week's study sessions to unlock your Sunday Completion Badge!
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Loading Spinner */}
        {loadingQuiz ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <Loader2 size={36} className="spin" color="var(--primary)" style={{ marginBottom: '12px' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Generating Custom Quiz via Gemini AI...</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Crafting questions tailored specifically to {taskTitle.replace(/\[.*?\]/g, '').trim()}...
            </p>
          </div>
        ) : (
          <>
            {/* Quiz Result Banner */}
            {submitted && (
              <div
                style={{
                  padding: '16px 20px',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  background: passPercent >= 66 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  border: `1px solid ${passPercent >= 66 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: passPercent >= 66 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                    {passPercent >= 66 ? `🎉 Quiz Passed! Score: ${score}/${questions.length} (${passPercent}%)` : `⚠️ Score: ${score}/${questions.length} (${passPercent}%)`}
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {passPercent >= 66 ? 'Great job! Sunday retention session logged to your streak.' : 'Review week sub-topics and try again to improve your retention!'}
                  </p>
                </div>

                {passPercent < 66 && (
                  <button className="btn btn-secondary btn-sm" onClick={handleReset}>
                    <RotateCcw size={14} /> Retry
                  </button>
                )}
              </div>
            )}

            {/* Questions List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
              {questions.map((q, qIdx) => (
                <div
                  key={q.id || qIdx}
                  style={{
                    padding: '16px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-light)'
                  }}
                >
                  <h4 style={{ fontSize: '0.94rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-main)' }}>
                    Q{qIdx + 1}: {q.question}
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[q.id || qIdx] === optIdx;
                      const isCorrect = q.correct === optIdx;

                      let border = '1px solid var(--border-light)';
                      let bg = 'rgba(30, 41, 59, 0.5)';

                      if (submitted) {
                        if (isCorrect) {
                          border = '1px solid var(--accent-emerald)';
                          bg = 'rgba(16, 185, 129, 0.2)';
                        } else if (isSelected && !isCorrect) {
                          border = '1px solid var(--accent-rose)';
                          bg = 'rgba(239, 68, 68, 0.2)';
                        }
                      } else if (isSelected) {
                        border = '1px solid var(--primary)';
                        bg = 'rgba(99, 102, 241, 0.2)';
                      }

                      return (
                        <div
                          key={optIdx}
                          onClick={() => handleSelectOption(q.id || qIdx, optIdx)}
                          style={{
                            padding: '10px 14px',
                            borderRadius: '8px',
                            background: bg,
                            border: border,
                            cursor: submitted ? 'default' : 'pointer',
                            fontSize: '0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>
                              {String.fromCharCode(65 + optIdx)}.
                            </span>
                            <span>{opt}</span>
                          </div>

                          {submitted && isCorrect && <CheckCircle2 size={16} color="var(--accent-emerald)" />}
                          {submitted && isSelected && !isCorrect && <XCircle size={16} color="var(--accent-rose)" />}
                        </div>
                      );
                    })}
                  </div>

                  {submitted && (
                    <div style={{ marginTop: '10px', fontSize: '0.78rem', color: 'var(--text-muted)', background: 'rgba(255, 255, 255, 0.03)', padding: '8px 12px', borderRadius: '6px' }}>
                      💡 <strong>Explanation:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Modal Actions Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
              <button className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
              {!submitted && (
                <button className="btn btn-primary" onClick={handleSubmitQuiz} disabled={!isAllAnswered}>
                  <Sparkles size={16} /> Submit Sunday Quiz
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
