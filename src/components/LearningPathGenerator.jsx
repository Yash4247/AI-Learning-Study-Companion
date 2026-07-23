import React, { useState, useEffect } from 'react';
import { Compass, Sparkles, Clock, Target, Award, CheckCircle2, Circle, ExternalLink, CalendarPlus, BookOpen, Globe, Edit3 } from 'lucide-react';
import { aiService, getRoadmapShUrl } from '../services/aiService';
import { storageService } from '../services/storageService';

export default function LearningPathGenerator({ resetKey, onPushToSchedule, onNotify }) {
  const [profile, setProfile] = useState(storageService.getUserProfile());
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [isCustomGoal, setIsCustomGoal] = useState(false);
  const [isCustomSkills, setIsCustomSkills] = useState(false);

  useEffect(() => {
    const existingPath = storageService.getLearningPath();
    setRoadmap(existingPath || null);
    setProfile(storageService.getUserProfile());
  }, [resetKey]);

  const handleGeneratePath = async (e, customGoal = null) => {
    if (e) e.preventDefault();
    setLoading(true);
    const targetProfile = customGoal ? { ...profile, goal: customGoal } : profile;
    if (customGoal) setProfile(targetProfile);

    try {
      storageService.setUserProfile(targetProfile);
      const generated = await aiService.generateLearningPath(targetProfile);
      setRoadmap(generated);
      storageService.setLearningPath(generated);
      onNotify(`Generated ${targetProfile.goal} master plan!`, 'success');
    } catch (err) {
      onNotify('Failed to generate learning path', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTopic = (weekIndex, topicId) => {
    if (!roadmap) return;
    const updatedWeeks = [...roadmap.weeks];
    const topic = updatedWeeks[weekIndex].topics.find(t => t.id === topicId);
    if (topic) {
      topic.completed = !topic.completed;
      const newRoadmap = { ...roadmap, weeks: updatedWeeks };
      setRoadmap(newRoadmap);
      storageService.setLearningPath(newRoadmap);
    }
  };

  const handlePushAllToSchedule = () => {
    if (!roadmap) return;
    const allTopics = [];
    const totalWeeks = parseInt(roadmap.durationWeeks) || parseInt(profile.durationWeeks) || 4;

    roadmap.weeks.forEach(w => {
      w.topics.forEach(t => {
        allTopics.push({
          id: t.id,
          title: `[Week ${w.weekNumber}: ${w.title}] ${t.title}`,
          durationMins: t.durationMins,
          priority: t.priority,
          resource: t.resource || `${roadmap.goal} Guide`
        });
      });
    });

    onPushToSchedule(allTopics, profile.hoursPerWeek ? profile.hoursPerWeek / 7 : 2, totalWeeks);
    onNotify(`Pushed ${allTopics.length} topics across ${totalWeeks} full study weeks into Daily Schedule!`, 'success');
  };

  const activeRoadmapUrl = roadmap?.roadmapUrl || getRoadmapShUrl(profile.goal || 'developer');

  const popularRoadmaps = [
    { name: 'Frontend Developer', icon: '💻' },
    { name: 'Backend Developer', icon: '⚙️' },
    { name: 'Full Stack Developer', icon: '⚡' },
    { name: 'AI & Data Scientist', icon: '🤖' },
    { name: 'DevOps Engineer', icon: '☁️' }
  ];

  const handleGoalSelectChange = (e) => {
    const val = e.target.value;
    if (val === 'CUSTOM') {
      setIsCustomGoal(true);
      setProfile({ ...profile, goal: '' });
    } else {
      setIsCustomGoal(false);
      setProfile({ ...profile, goal: val });
    }
  };

  const handleSkillSelectChange = (e) => {
    const val = e.target.value;
    if (val === 'CUSTOM') {
      setIsCustomSkills(true);
      setProfile({ ...profile, skills: '' });
    } else {
      setIsCustomSkills(false);
      setProfile({ ...profile, skills: val });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Hero / Form Banner */}
      <div className="glass-card pulse-card" style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ padding: '10px', background: 'rgba(99, 102, 241, 0.15)', borderRadius: '12px', color: 'var(--primary)' }}>
            <Compass size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>AI Learning Path & Plan Maker</h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Select your target career goal and current skills from the professional dropdowns below to generate milestone plans.
            </p>
          </div>
        </div>

        {/* Quick Select Buttons */}
        <div style={{ marginTop: '16px', marginBottom: '12px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            ⚡ Quick-Load Popular Master Track Plans:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
            {popularRoadmaps.map((track) => (
              <button
                key={track.name}
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={(e) => {
                  setIsCustomGoal(false);
                  handleGeneratePath(e, track.name);
                }}
                disabled={loading}
                style={{
                  fontSize: '0.82rem',
                  borderColor: profile.goal === track.name ? 'var(--accent-emerald)' : 'var(--border-light)',
                  color: profile.goal === track.name ? 'var(--accent-emerald)' : 'var(--text-main)',
                  background: profile.goal === track.name ? 'rgba(16, 185, 129, 0.15)' : 'rgba(15, 23, 42, 0.6)'
                }}
              >
                <span>{track.icon} {track.name}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleGeneratePath} className="grid-2" style={{ marginTop: '20px' }}>
          {/* Target Skill / Career Goal Dropdown */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>
                <Target size={14} className="text-primary" />
                Target Skill / Career Goal
              </label>

              {profile.goal && (
                <a
                  href={getRoadmapShUrl(profile.goal)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, textDecoration: 'none' }}
                >
                  <Globe size={12} />
                  <span>Interactive Guide ↗</span>
                </a>
              )}
            </div>

            {!isCustomGoal ? (
              <select
                className="form-select"
                value={profile.goal}
                onChange={handleGoalSelectChange}
                required
              >
                <option value="" disabled>-- Select Target Career / Skill Goal --</option>

                <optgroup label="💻 Frontend Development">
                  <option value="Frontend Developer">Frontend Developer (HTML, CSS, JS, React)</option>
                  <option value="React.js & Next.js Specialist">React.js & Next.js Specialist</option>
                  <option value="Vue.js & Nuxt Frontend Engineer">Vue.js & Nuxt Frontend Engineer</option>
                  <option value="Angular Web Application Developer">Angular Web Application Developer</option>
                </optgroup>

                <optgroup label="⚙️ Backend & Server Engineering">
                  <option value="Backend Developer">Backend Developer (Node.js & Express)</option>
                  <option value="Node.js & Microservices Architect">Node.js & Microservices Architect</option>
                  <option value="Python Backend Developer (FastAPI & Django)">Python Backend Developer (FastAPI & Django)</option>
                  <option value="Java Spring Boot Enterprise Engineer">Java Spring Boot Enterprise Engineer</option>
                  <option value="Go Systems Engineer">Go (Golang) Systems Engineer</option>
                </optgroup>

                <optgroup label="⚡ Full Stack Software Engineering">
                  <option value="Full Stack Developer">Full Stack Developer (MERN Stack)</option>
                  <option value="Full Stack Developer (PERN Stack)">Full Stack Developer (PERN / PostgreSQL Stack)</option>
                  <option value="Jamstack & Serverless Web Engineer">Jamstack & Serverless Web Engineer</option>
                </optgroup>

                <optgroup label="🤖 AI, Machine Learning & Data Science">
                  <option value="AI & Data Scientist">AI & Data Scientist (Python, ML & PyTorch)</option>
                  <option value="Machine Learning Specialist">Machine Learning & Deep Learning Specialist</option>
                  <option value="Generative AI & LLM Engineer">Generative AI & LLM Engineer (RAG & LangChain)</option>
                  <option value="Data Engineer & ETL Pipeline Developer">Data Engineer & ETL Pipeline Developer</option>
                </optgroup>

                <optgroup label="☁️ DevOps, Cloud & Cyber Security">
                  <option value="DevOps Engineer">DevOps Engineer (Docker, Kubernetes & AWS)</option>
                  <option value="Cloud Solutions Architect">Cloud Solutions Architect (AWS / GCP)</option>
                  <option value="Cyber Security Specialist">Cyber Security & Ethical Hacking Specialist</option>
                </optgroup>

                <optgroup label="📱 Mobile App Development">
                  <option value="Flutter Mobile Engineer">Flutter Cross-Platform Mobile Engineer</option>
                  <option value="Android Native Developer">Android Native Developer (Kotlin)</option>
                  <option value="iOS Native Developer">iOS Native Developer (Swift)</option>
                </optgroup>

                <option value="CUSTOM">✍️ Enter Custom Career Goal...</option>
              </select>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  value={profile.goal}
                  onChange={(e) => setProfile({ ...profile, goal: e.target.value })}
                  placeholder="e.g. Quantum Computing Basics, Game Dev in Unity..."
                  required
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsCustomGoal(false)}
                  title="Switch back to dropdown"
                >
                  Dropdown
                </button>
              </div>
            )}
          </div>

          {/* Current Skills / Knowledge Level Dropdown */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>
                <Award size={14} />
                Current Skills / Knowledge Level
              </label>
            </div>

            {!isCustomSkills ? (
              <select
                className="form-select"
                value={profile.skills}
                onChange={handleSkillSelectChange}
                required
              >
                <option value="" disabled>-- Select Your Current Skill Level --</option>

                <optgroup label="🟢 Beginner Level">
                  <option value="Absolute Beginner (No prior coding experience)">Absolute Beginner (No prior coding experience)</option>
                  <option value="Basic HTML5 & CSS3">Basic HTML5 & CSS3</option>
                  <option value="Basic Computer Science & CLI Commands">Basic Computer Science & CLI Commands</option>
                </optgroup>

                <optgroup label="🟡 Intermediate Level">
                  <option value="HTML, CSS & JavaScript ES6+">HTML, CSS & JavaScript ES6+</option>
                  <option value="Basic Python & Data Structures">Basic Python & Data Structures</option>
                  <option value="Git & GitHub Version Control">Git & GitHub Version Control</option>
                  <option value="React.js Basics (Components & State)">React.js Basics (Components & State)</option>
                  <option value="Relational SQL Databases (PostgreSQL / MySQL)">Relational SQL Databases (PostgreSQL / MySQL)</option>
                  <option value="Node.js & Basic REST APIs">Node.js & Basic REST APIs</option>
                </optgroup>

                <optgroup label="🔴 Advanced Level">
                  <option value="Full Stack Web Development (React + Node.js)">Full Stack Web Development (React + Node.js)</option>
                  <option value="Python Data Science (NumPy, Pandas, Scikit-Learn)">Python Data Science (NumPy, Pandas, Scikit-Learn)</option>
                  <option value="Docker & Containerization Fundamentals">Docker & Containerization Fundamentals</option>
                  <option value="Data Structures & Algorithms (DSA Mastery)">Data Structures & Algorithms (DSA Mastery)</option>
                </optgroup>

                <option value="CUSTOM">✍️ Enter Custom Skill Combination...</option>
              </select>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  value={profile.skills}
                  onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
                  placeholder="e.g. HTML, CSS, C++, Basic SQL"
                  required
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsCustomSkills(false)}
                  title="Switch back to dropdown"
                >
                  Dropdown
                </button>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              <Clock size={14} />
              Available Time (Hours per Week)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              className="form-input"
              value={profile.hoursPerWeek}
              onChange={(e) => setProfile({ ...profile, hoursPerWeek: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <BookOpen size={14} />
              Target Duration (Weeks)
            </label>
            <select
              className="form-select"
              value={profile.durationWeeks}
              onChange={(e) => setProfile({ ...profile, durationWeeks: e.target.value })}
            >
              <option value="2">2 Weeks (Express Intensive)</option>
              <option value="4">4 Weeks (Standard Mastery)</option>
              <option value="6">6 Weeks (Deep Dive)</option>
              <option value="8">8 Weeks (Comprehensive Bootcamp)</option>
            </select>
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Sparkles size={18} />
              <span>{loading ? 'AI Crafting Plan...' : 'Generate Learning Path'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Generated Roadmap Display */}
      {roadmap && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Reference Banner */}
          <div
            className="glass-card"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(99, 102, 241, 0.15))',
              borderColor: 'rgba(16, 185, 129, 0.4)',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px 12px', background: 'rgba(16, 185, 129, 0.25)', borderRadius: '8px', color: 'var(--accent-emerald)', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Globe size={16} />
                <span>Verified Curriculum</span>
              </div>
              <div>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Curriculum Milestone Standards
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  All modules, topics, and skill milestones for <strong>{roadmap.goal || profile.goal}</strong> are mapped to industry standards.
                </p>
              </div>
            </div>

            <a
              href={activeRoadmapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-emerald)', borderColor: 'rgba(16, 185, 129, 0.6)', fontWeight: 700 }}
            >
              <span>View Interactive Node Diagram ↗</span>
              <ExternalLink size={14} />
            </a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🎯 {roadmap.title}</span>
                <span className="badge badge-cyan">{roadmap.durationWeeks || profile.durationWeeks} Weeks</span>
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Click any topic to mark complete or push the full {roadmap.durationWeeks || profile.durationWeeks}-week plan into your daily schedule.
              </p>
            </div>

            <button className="btn btn-accent btn-sm" onClick={handlePushAllToSchedule}>
              <CalendarPlus size={16} />
              <span>Push All {roadmap.durationWeeks || profile.durationWeeks} Weeks to Daily Schedule</span>
            </button>
          </div>

          {/* Weeks Accordion / Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {roadmap.weeks.map((week, wIdx) => (
              <div key={wIdx} className="glass-card" style={{ borderLeft: '4px solid var(--accent-emerald)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <span className="badge badge-emerald" style={{ marginBottom: '6px' }}>Week {week.weekNumber}</span>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{week.title}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>{week.description}</p>
                  </div>

                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                    {week.topics.filter(t => t.completed).length} / {week.topics.length} Done
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {week.topics.map((topic) => {
                    const isDone = topic.completed;
                    const priorityClass = topic.priority === 'High' ? 'badge-rose' : topic.priority === 'Medium' ? 'badge-amber' : 'badge-cyan';

                    return (
                      <div
                        key={topic.id}
                        onClick={() => handleToggleTopic(wIdx, topic.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          background: isDone ? 'rgba(16, 185, 129, 0.08)' : 'rgba(15, 23, 42, 0.7)',
                          border: `1px solid ${isDone ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-light)'}`,
                          borderRadius: '10px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {isDone ? (
                            <CheckCircle2 size={20} color="var(--accent-emerald)" />
                          ) : (
                            <Circle size={20} color="var(--text-subtle)" />
                          )}
                          <div>
                            <span style={{
                              fontWeight: 600,
                              fontSize: '0.92rem',
                              textDecoration: isDone ? 'line-through' : 'none',
                              color: isDone ? 'var(--text-muted)' : 'var(--text-main)',
                              display: 'block'
                            }}>
                              {topic.title}
                            </span>
                            {topic.resource && (
                              <span
                                style={{
                                  fontSize: '0.74rem',
                                  color: 'var(--text-subtle)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  marginTop: '2px'
                                }}
                              >
                                <span>Ref: {topic.resource}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span className={`badge ${priorityClass}`}>{topic.priority}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} /> {topic.durationMins}m
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
