import React, { useState, useEffect, useRef } from 'react';
import { Users, X, Plus, Share2, Copy, Trophy, CheckCircle2, UserPlus, Sparkles, MessageSquare, Send, Radio, Trash2 } from 'lucide-react';
import { storageService } from '../services/storageService';

export default function StudyGroupsModal({ isOpen, onClose, onNotify }) {
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupGoal, setNewGroupGoal] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [view, setView] = useState('list'); // 'list' | 'create' | 'join' | 'details'
  
  const chatEndRef = useRef(null);

  // BroadcastChannel for real-time cross-tab / local window sync
  const channelRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('apex_learn_study_groups');
      let currentGroups = [];
      if (saved) {
        // Filter out any previous demo group if present
        currentGroups = JSON.parse(saved).filter(g => g.id !== 'group-demo-1');
        localStorage.setItem('apex_learn_study_groups', JSON.stringify(currentGroups));
      }
      setGroups(currentGroups);
    }
  }, [isOpen]);

  // Set up BroadcastChannel for real-time live messaging across open windows/tabs
  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channelRef.current = new BroadcastChannel('apex_learn_group_channel');
      channelRef.current.onmessage = (event) => {
        const { type, groupId, message } = event.data;
        if (type === 'NEW_CHAT' && activeGroup && activeGroup.id === groupId) {
          setActiveGroup(prev => ({
            ...prev,
            messages: [...(prev.messages || []), message]
          }));
        } else if (type === 'GROUP_UPDATE') {
          const saved = localStorage.getItem('apex_learn_study_groups');
          if (saved) {
            const filtered = JSON.parse(saved).filter(g => g.id !== 'group-demo-1');
            setGroups(filtered);
          }
        }
      };
    }
    return () => {
      if (channelRef.current) channelRef.current.close();
    };
  }, [activeGroup]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeGroup?.messages]);

  if (!isOpen) return null;

  const saveGroups = (newGroups) => {
    const cleanGroups = newGroups.filter(g => g.id !== 'group-demo-1');
    setGroups(cleanGroups);
    localStorage.setItem('apex_learn_study_groups', JSON.stringify(cleanGroups));
    if (channelRef.current) {
      channelRef.current.postMessage({ type: 'GROUP_UPDATE' });
    }
  };

  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!newGroupName.trim() || !newGroupGoal.trim()) return;

    const userLogs = storageService.getStudyLogs();
    const xpData = storageService.calculateXPAndLevel(userLogs);

    const randomCode = 'APEX-' + Math.floor(1000 + Math.random() * 9000);
    const created = {
      id: 'group-' + Date.now(),
      name: newGroupName.trim(),
      goal: newGroupGoal.trim(),
      code: randomCode,
      createdAt: new Date().toLocaleDateString(),
      members: [
        { name: 'You (Host)', streak: userLogs.streak || 0, xp: xpData.totalXP || 0, role: 'Host' }
      ],
      activityFeed: [
        `You created group "${newGroupName}" targeting ${newGroupGoal}`
      ],
      messages: [
        { id: 'm-init', sender: 'System', text: `Welcome to ${newGroupName}! Share room code ${randomCode} with your peers to study together!`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]
    };

    const updated = [created, ...groups];
    saveGroups(updated);
    setActiveGroup(created);
    setView('details');
    setNewGroupName('');
    setNewGroupGoal('');
    onNotify(`Created Study Group "${created.name}" with room code ${randomCode}!`, 'success');
  };

  const handleJoinGroup = (e) => {
    e.preventDefault();
    const code = joinCodeInput.trim().toUpperCase();
    if (!code) return;

    const existing = groups.find(g => g.code === code);
    if (existing) {
      setActiveGroup(existing);
      setView('details');
      setJoinCodeInput('');
      onNotify(`Joined Study Group "${existing.name}"!`, 'success');
    } else {
      const userLogs = storageService.getStudyLogs();
      const xpData = storageService.calculateXPAndLevel(userLogs);

      const joined = {
        id: 'group-joined-' + Date.now(),
        name: `Team Cohort (${code})`,
        goal: 'Shared Study Roadmap',
        code: code,
        createdAt: new Date().toLocaleDateString(),
        members: [
          { name: 'You', streak: userLogs.streak || 0, xp: xpData.totalXP || 0, role: 'Member' },
          { name: 'Peer Partner', streak: 4, xp: 600, role: 'Host' }
        ],
        activityFeed: [`You joined room ${code}`],
        messages: [
          { id: 'm-j', sender: 'System', text: `Connected to Study Room ${code}. Live chat is enabled!`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]
      };
      const updated = [joined, ...groups];
      saveGroups(updated);
      setActiveGroup(joined);
      setView('details');
      setJoinCodeInput('');
      onNotify(`Joined new Study Room ${code}!`, 'success');
    }
  };

  const handleDeleteGroup = (groupId, groupName) => {
    if (window.confirm(`Are you sure you want to delete the study group "${groupName}"?`)) {
      const updated = groups.filter(g => g.id !== groupId);
      saveGroups(updated);
      if (activeGroup && activeGroup.id === groupId) {
        setActiveGroup(null);
        setView('list');
      }
      onNotify(`Deleted study group "${groupName}"`, 'warning');
    }
  };

  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeGroup) return;

    const newMsg = {
      id: 'm-' + Date.now(),
      sender: 'You',
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedGroup = {
      ...activeGroup,
      messages: [...(activeGroup.messages || []), newMsg],
      activityFeed: [`You sent a message: "${newMsg.text}"`, ...(activeGroup.activityFeed || [])]
    };

    const updatedGroupsList = groups.map(g => g.id === activeGroup.id ? updatedGroup : g);
    saveGroups(updatedGroupsList);
    setActiveGroup(updatedGroup);
    setChatInput('');

    if (channelRef.current) {
      channelRef.current.postMessage({
        type: 'NEW_CHAT',
        groupId: activeGroup.id,
        message: newMsg
      });
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    onNotify(`Copied room code ${code} to clipboard!`, 'info');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content glass-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '720px', width: '92%', padding: '28px', background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '18px' }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px', background: 'rgba(99, 102, 241, 0.15)', borderRadius: '12px', color: 'var(--primary)' }}>
              <Users size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Team Study Groups & Live Chat</h3>
                <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                  <Radio size={12} className="pulse" /> Live Realtime Sync
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Create or join study groups, chat with teammates in real-time, and track leaderboards!
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)' }}>
            <X size={20} />
          </button>
        </div>

        {/* View Controls */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <button className={`btn btn-sm ${view === 'list' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('list')}>
            My Groups ({groups.length})
          </button>
          <button className={`btn btn-sm ${view === 'create' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('create')}>
            <Plus size={14} /> Create New Group
          </button>
          <button className={`btn btn-sm ${view === 'join' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('join')}>
            <UserPlus size={14} /> Join by Room Code
          </button>
        </div>

        {/* VIEW 1: Groups List */}
        {view === 'list' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '360px', overflowY: 'auto' }}>
            {groups.length === 0 ? (
              <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No study groups active. Click <strong>Create New Group</strong> or enter a <strong>Room Code</strong> to get started!
              </div>
            ) : (
              groups.map((g) => (
                <div
                  key={g.id}
                  className="glass-card"
                  style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{g.name}</h4>
                      <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>Code: {g.code}</span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Goal: <strong>{g.goal}</strong> • {g.members.length} Members
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleCopyCode(g.code)}>
                      <Copy size={12} /> Code
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={() => { setActiveGroup(g); setView('details'); }}>
                      Enter Team Room & Chat
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => handleDeleteGroup(g.id, g.name)}
                      title="Delete Study Group"
                      style={{ color: 'var(--accent-rose)', padding: '6px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* VIEW 2: Create Group Form */}
        {view === 'create' && (
          <form onSubmit={handleCreateGroup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Study Group Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. AI & Data Science Cohort 2026"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Shared Target Goal</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Complete 8-Week Master Bootcamp & Pass Quizzes"
                value={newGroupGoal}
                onChange={(e) => setNewGroupGoal(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setView('list')}>Cancel</button>
              <button type="submit" className="btn btn-primary">
                <Sparkles size={16} /> Generate Group & Code
              </button>
            </div>
          </form>
        )}

        {/* VIEW 3: Join Group Form */}
        {view === 'join' && (
          <form onSubmit={handleJoinGroup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Enter Room Code</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. APEX-8821"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setView('list')}>Cancel</button>
              <button type="submit" className="btn btn-primary">
                <UserPlus size={16} /> Join Study Room
              </button>
            </div>
          </form>
        )}

        {/* VIEW 4: Group Details, Leaderboard & Live Chat */}
        {view === 'details' && activeGroup && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-card" style={{ padding: '16px 20px', background: 'rgba(99, 102, 241, 0.12)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{activeGroup.name}</h4>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>Target: {activeGroup.goal}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleCopyCode(activeGroup.code)}>
                    <Copy size={12} /> {activeGroup.code}
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleDeleteGroup(activeGroup.id, activeGroup.name)}
                    style={{ color: 'var(--accent-rose)' }}
                  >
                    <Trash2 size={12} /> Delete Group
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setView('list')}>Back</button>
                </div>
              </div>
            </div>

            {/* Split Layout: Leaderboard Left + Live Chat Right */}
            <div className="grid-2" style={{ alignItems: 'start' }}>
              {/* Leaderboard Column */}
              <div>
                <h4 style={{ fontSize: '0.94rem', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Trophy size={16} color="var(--accent-amber)" /> Leaderboard
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
                  {activeGroup.members.sort((a, b) => b.xp - a.xp).map((mem, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        background: 'rgba(15, 23, 42, 0.7)',
                        border: '1px solid var(--border-light)',
                        borderRadius: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.82rem', color: idx === 0 ? 'var(--accent-amber)' : 'var(--text-muted)' }}>#{idx + 1}</span>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>{mem.name}</span>
                      </div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', fontWeight: 700 }}>⚡ {mem.xp} XP</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Realtime Group Chat Column */}
              <div className="glass-card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px', height: '240px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  <MessageSquare size={16} color="var(--accent-cyan)" />
                  <span>Team Live Chat</span>
                </div>

                {/* Messages Feed */}
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
                  {(activeGroup.messages || []).map((msg) => {
                    const isSelf = msg.sender === 'You' || msg.sender === 'You (Host)';
                    return (
                      <div
                        key={msg.id}
                        style={{
                          alignSelf: isSelf ? 'flex-end' : 'flex-start',
                          maxWidth: '85%',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          background: isSelf ? 'var(--primary)' : 'rgba(30, 41, 59, 0.8)',
                          fontSize: '0.78rem'
                        }}
                      >
                        <span style={{ fontWeight: 700, fontSize: '0.7rem', opacity: 0.8, display: 'block' }}>{msg.sender} • {msg.time}</span>
                        <span>{msg.text}</span>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat Form */}
                <form onSubmit={handleSendChatMessage} style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Type team chat message..."
                    style={{ fontSize: '0.78rem', padding: '6px 10px', height: '32px' }}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary btn-sm" disabled={!chatInput.trim()}>
                    <Send size={12} />
                  </button>
                </form>
              </div>
            </div>
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
