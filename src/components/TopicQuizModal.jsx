import React, { useState, useEffect } from 'react';
import { Trophy, CheckCircle2, XCircle, Sparkles, X, RotateCcw, Award, Loader2 } from 'lucide-react';
import { aiService } from '../services/aiService';

export default function TopicQuizModal({ isOpen, onClose, topicTitle = '', onQuizCompleted }) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && topicTitle) {
      setLoading(true);
      setSubmitted(false);
      setSelectedAnswers({});
      setScore(0);
      aiService.generateTopicCompletionQuiz(topicTitle)
        .then((res) => {
          if (res) setQuizData(res);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isOpen, topicTitle]);

  if (!isOpen) return null;

  const questions = quizData?.questions || [];

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

    if (onQuizCompleted) {
      const bonusXP = calculatedScore * 50;
      onQuizCompleted(calculatedScore, questions.length, bonusXP);
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  const isAllAnswered = questions.length > 0 && questions.every(q => selectedAnswers[q.id] !== undefined);
  const passPercent = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const cleanTitle = topicTitle.replace(/\[.*?\]/g, '').trim();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content glass-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', width: '92%', padding: '28px', background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '16px' }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '12px', color: 'var(--accent-emerald)' }}>
              <Trophy size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                  Topic Completion Quiz
                </h3>
                <span className="badge badge-emerald">✨ +150 XP Bonus</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Verify your mastery of <strong>{cleanTitle}</strong> before check-off!
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <Loader2 size={36} className="spin" color="var(--primary)" style={{ marginBottom: '12px' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Generating Topic Quiz via AI...</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Crafting questions tailored to {cleanTitle}...
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
                    {passPercent >= 66 ? `🎉 Quiz Passed! Score: ${score}/${questions.length} (+${score * 50} XP)` : `⚠️ Score: ${score}/${questions.length}`}
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {passPercent >= 66 ? 'Awesome job! Topic marked as completed & bonus XP added.' : 'Review explanations below and retry!'}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '400px', overflowY: 'auto', paddingRight: '4px' }}>
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
                      const isSelected = selectedAnswers[q.id] === optIdx;
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
                          onClick={() => handleSelectOption(q.id, optIdx)}
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

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
              <button className="btn btn-secondary" onClick={onClose}>
                {submitted ? 'Done' : 'Skip Quiz'}
              </button>
              {!submitted && (
                <button className="btn btn-primary" onClick={handleSubmitQuiz} disabled={!isAllAnswered}>
                  <Sparkles size={16} /> Submit & Claim XP
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
