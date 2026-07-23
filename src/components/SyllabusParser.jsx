import React, { useState, useEffect } from 'react';
import { BookOpen, UploadCloud, FileText, Sparkles, CheckCircle2, CalendarPlus, Image as ImageIcon, X, Edit3 } from 'lucide-react';
import { aiService } from '../services/aiService';
import { storageService } from '../services/storageService';

export default function SyllabusParser({ onPushToSchedule, onNotify }) {
  const [syllabusText, setSyllabusText] = useState('');
  const [fileName, setFileName] = useState('');
  const [imageDataUrl, setImageDataUrl] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [savedSyllabi, setSavedSyllabi] = useState([]);
  const [activeSyllabus, setActiveSyllabus] = useState(null);
  const [parseMode, setParseMode] = useState('syllabus'); // 'syllabus' | 'handwritten'

  useEffect(() => {
    const existing = storageService.getSyllabi();
    setSavedSyllabi(existing);
    if (existing.length > 0) {
      setActiveSyllabus(existing[0]);
    }
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp|gif|bmp)$/i.test(file.name);

    if (isImage) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        setImageDataUrl(dataUrl);
        setSyllabusText(`[Image Loaded: ${file.name}] - Ready for AI Vision & Multimodal OCR.`);
        onNotify(`Loaded image "${file.name}" successfully! Click Parse to run AI Vision OCR.`, 'success');
      };
      reader.readAsDataURL(file);
    } else {
      setImageDataUrl(null);
      const reader = new FileReader();
      reader.onload = (event) => {
        setSyllabusText(event.target.result);
        onNotify(`Loaded ${file.name} successfully! Click Parse to extract.`, 'success');
      };
      reader.readAsText(file);
    }
  };

  const handleRemoveImage = () => {
    setImageDataUrl(null);
    setSyllabusText('');
    setFileName('');
  };

  const handleParseSyllabus = async (e) => {
    if (e) e.preventDefault();
    if (!syllabusText.trim() && !imageDataUrl) {
      onNotify('Please upload an image, file, or paste content first.', 'warning');
      return;
    }

    setParsing(true);
    try {
      let parsed = null;
      if (parseMode === 'handwritten') {
        parsed = await aiService.parseHandwrittenNotes(
          syllabusText,
          fileName || 'Handwritten Notes',
          imageDataUrl
        );
      } else {
        parsed = await aiService.parseSyllabus(
          syllabusText,
          fileName || 'Course Syllabus',
          imageDataUrl
        );
      }

      setActiveSyllabus(parsed);
      const updatedList = [parsed, ...savedSyllabi.filter(s => s.id !== parsed.id)];
      setSavedSyllabi(updatedList);
      storageService.saveSyllabus(parsed);

      onNotify(`Extracted ${parsed.modules.length} modules from ${parsed.courseTitle}!`, 'success');
    } catch (err) {
      onNotify('Failed to parse syllabus/notes content', 'error');
    } finally {
      setParsing(false);
    }
  };

  const handlePushSyllabusToSchedule = () => {
    if (!activeSyllabus) return;
    const allTopics = [];

    activeSyllabus.modules.forEach((mod) => {
      mod.topics.forEach((t) => {
        allTopics.push({
          id: t.id,
          title: `[${mod.title}] ${t.title}`,
          durationMins: t.durationMins || 90,
          priority: t.priority || 'Medium',
          resource: activeSyllabus.courseTitle
        });
      });
    });

    onPushToSchedule(allTopics, 2, 4);
    onNotify(`Pushed ${allTopics.length} syllabus topics to Daily Planner!`, 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Banner */}
      <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '12px', color: 'var(--accent-emerald)' }}>
              <BookOpen size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Smart Syllabus & Handwritten Notes Ingestion</h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Upload printed syllabi, notebook photos, or whiteboard snapshots to extract structured topics into your schedule.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className={`btn btn-sm ${parseMode === 'syllabus' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setParseMode('syllabus')}
            >
              📄 Printed Syllabus
            </button>
            <button
              className={`btn btn-sm ${parseMode === 'handwritten' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setParseMode('handwritten')}
            >
              ✍️ Handwritten Notes OCR
            </button>
          </div>
        </div>

        <form onSubmit={handleParseSyllabus} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* File Upload Box */}
            <div
              style={{
                border: '2px dashed var(--border-light)',
                borderRadius: '12px',
                padding: '24px',
                textAlign: 'center',
                background: 'rgba(15, 23, 42, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}
            >
              <UploadCloud size={32} color="var(--primary)" style={{ marginBottom: '10px' }} />
              <h4 style={{ fontSize: '0.96rem', fontWeight: 700, marginBottom: '4px' }}>
                {parseMode === 'handwritten' ? 'Upload Handwritten Notes / Whiteboard Photo' : 'Upload Syllabus File or Image'}
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', marginBottom: '12px' }}>
                Supports PNG, JPG, WEBP, PDF screenshot, or .TXT files
              </p>
              <input
                type="file"
                accept=".txt,.pdf,image/*"
                onChange={handleFileUpload}
                style={{ opacity: 0, position: 'absolute', width: '100%', height: '100%', cursor: 'pointer', top: 0, left: 0 }}
              />

              {fileName && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '0.82rem', color: 'var(--accent-emerald)', fontWeight: 700 }}>
                  <FileText size={14} />
                  <span>{fileName}</span>
                  {imageDataUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', marginLeft: '6px' }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Direct Text Input */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Or Paste Text / Handwritten Notes Transcript</label>
              <textarea
                className="form-textarea"
                style={{ height: '120px', fontSize: '0.84rem' }}
                placeholder={parseMode === 'handwritten' ? "e.g. Unit 1: Introduction to Calculus. Key Formula: f'(x) = lim (f(x+h)-f(x))/h..." : "Paste syllabus course objectives, modules, or contact hours here..."}
                value={syllabusText}
                onChange={(e) => setSyllabusText(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={parsing}>
              <Sparkles size={18} />
              <span>{parsing ? 'AI Vision Extracting...' : parseMode === 'handwritten' ? 'Run Handwritten OCR' : 'Parse Syllabus'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Extracted Syllabus Display */}
      {activeSyllabus && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📖 {activeSyllabus.courseTitle}</span>
                {activeSyllabus.isHandwrittenOCR && (
                  <span className="badge badge-emerald">✍️ Handwritten OCR</span>
                )}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Uploaded: {activeSyllabus.uploadedAt} • Extracted {activeSyllabus.modules.length} Course Modules
              </p>
            </div>

            <button className="btn btn-accent btn-sm" onClick={handlePushSyllabusToSchedule}>
              <CalendarPlus size={16} />
              <span>Push All Modules to Daily Planner</span>
            </button>
          </div>

          {/* Modules List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {activeSyllabus.modules.map((mod, mIdx) => (
              <div key={mIdx} className="glass-card" style={{ borderLeft: '4px solid var(--accent-cyan)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{mod.title}</h4>
                  <span className="badge badge-cyan">{mod.weight || '25% Weight'}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {mod.topics.map((topic) => (
                    <div
                      key={topic.id}
                      style={{
                        padding: '10px 14px',
                        background: 'rgba(15, 23, 42, 0.6)',
                        borderRadius: '8px',
                        border: '1px solid var(--border-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <CheckCircle2 size={16} color="var(--accent-emerald)" />
                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{topic.title}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className={`badge ${topic.priority === 'High' ? 'badge-rose' : 'badge-amber'}`}>
                          {topic.priority || 'Medium'}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {topic.durationMins || 90}m
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
