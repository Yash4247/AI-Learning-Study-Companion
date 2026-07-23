import React, { useState } from 'react';
import { Key, X, Check, ExternalLink } from 'lucide-react';
import { storageService } from '../services/storageService';

export default function ApiKeyModal({ isOpen, onClose, onSaveKey }) {
  const [key, setKey] = useState(storageService.getApiKey());
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    storageService.setApiKey(key.trim());
    onSaveKey(key.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Key size={22} className="text-primary" style={{ color: 'var(--primary)' }} />
            <span>Configure Gemini AI Key</span>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Google Gemini API Key (Optional)</label>
            <input
              type="password"
              className="form-input"
              placeholder="AIzaSy..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginTop: '4px' }}>
              When provided, Apex Learn uses live Gemini 1.5 Flash models for real-time path generation & syllabus parsing. Without a key, high-quality offline AI simulation is active.
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '24px' }}>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              style={{ color: 'var(--accent-cyan)', fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <span>Get Free Gemini Key</span>
              <ExternalLink size={14} />
            </a>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setKey(''); storageService.setApiKey(''); onSaveKey(''); }}>
                Clear Key
              </button>
              <button type="submit" className="btn btn-primary btn-sm">
                {savedSuccess ? <><Check size={16} /> Saved!</> : 'Save Settings'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
