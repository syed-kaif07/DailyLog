import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Check, AlertCircle } from 'lucide-react';
import type { Technology, ProgressEntry, Status } from '../types';

interface EntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: {
    date: string;
    technology_id: number;
    title: string;
    progress_points: string[];
    status: Status;
    tags: string[];
  }) => Promise<void>;
  technologies: Technology[];
  initialEntry?: ProgressEntry | null;
  defaultDate?: string;
  onAddNewTech: () => void;
}

export const EntryModal: React.FC<EntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  technologies,
  initialEntry,
  defaultDate,
  onAddNewTech,
}) => {
  const [date, setDate] = useState<string>('');
  const [techId, setTechId] = useState<number | ''>('');
  const [title, setTitle] = useState<string>('');
  const [points, setPoints] = useState<string[]>(['', '', '', '']);
  const [status, setStatus] = useState<Status>('Completed');
  const [tagsInput, setTagsInput] = useState<string>('');
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Initialize or reset form when opened or initialEntry changes
  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setIsSubmitting(false);

      if (initialEntry) {
        setDate(initialEntry.date);
        setTechId(initialEntry.technology_id);
        setTitle(initialEntry.title);
        setPoints(
          initialEntry.progress_points && initialEntry.progress_points.length > 0
            ? [...initialEntry.progress_points]
            : ['', '', '', '']
        );
        setStatus(initialEntry.status);
        setTagsInput(initialEntry.tags ? initialEntry.tags.join(', ') : '');
      } else {
        // New entry
        const todayIso = defaultDate || new Date().toISOString().split('T')[0];
        setDate(todayIso);
        if (technologies.length > 0) {
          setTechId(technologies[0].id);
        } else {
          setTechId('');
        }
        setTitle('');
        setPoints(['', '', '', '']);
        setStatus('Completed');
        setTagsInput('');
      }
    }
  }, [isOpen, initialEntry, defaultDate, technologies]);

  if (!isOpen) return null;

  const handlePointChange = (index: number, val: string) => {
    const updated = [...points];
    updated[index] = val;
    setPoints(updated);
  };

  const handleAddPoint = () => {
    setPoints([...points, '']);
  };

  const handleRemovePoint = (index: number) => {
    if (points.length <= 1) {
      setPoints(['']);
      return;
    }
    const updated = points.filter((_, i) => i !== index);
    setPoints(updated);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    // Validation
    if (!date) {
      setErrorMsg('Please select a date.');
      return;
    }
    if (!techId || technologies.length === 0) {
      setErrorMsg('A technology category is required. Please create and select a category first.');
      return;
    }
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setErrorMsg('Please provide an entry title or topic.');
      return;
    }

    const cleanPoints = points.map((p) => p.trim()).filter((p) => p.length > 0);
    if (cleanPoints.length === 0) {
      setErrorMsg('Please enter at least one progress bullet point.');
      return;
    }

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter((t) => t.length > 0);

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      await onSave({
        date,
        technology_id: Number(techId),
        title: cleanTitle,
        progress_points: cleanPoints,
        status,
        tags: parsedTags,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save entry. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Keyboard shortcut: Ctrl+Enter or Cmd+Enter to submit
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} onKeyDown={handleKeyDown}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#f4f4f5' }}>
              {initialEntry ? 'Edit Progress Entry' : '+ Log Today’s Progress'}
            </h2>
            <p style={{ fontSize: '12.5px', color: '#a1a1aa', marginTop: '2px' }}>
              Record what you studied, built, or debugged.
            </p>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {errorMsg && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: '7px',
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#f87171',
              fontSize: '12.5px',
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Row 1: Date & Technology */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#a1a1aa', marginBottom: '6px' }}>
                Date *
              </label>
              <input
                type="date"
                className="input-dark"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#a1a1aa' }}>
                  Technology *
                </label>
                <button
                  type="button"
                  onClick={onAddNewTech}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#c4b5fd',
                    fontSize: '11.5px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  + New
                </button>
              </div>
              {technologies.length === 0 ? (
                <button
                  type="button"
                  onClick={onAddNewTech}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    backgroundColor: 'rgba(124, 58, 237, 0.12)',
                    border: '1px dashed var(--accent-purple)',
                    borderRadius: '7px',
                    color: '#c4b5fd',
                    fontSize: '12px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <Plus size={13} />
                  <span>Create Category First</span>
                </button>
              ) : (
                <select
                  className="input-dark"
                  value={techId}
                  onChange={(e) => setTechId(Number(e.target.value))}
                  required
                >
                  <option value="" disabled style={{ background: '#181920', color: '#71717a' }}>
                    Select technology...
                  </option>
                  {technologies.map((t) => (
                    <option key={t.id} value={t.id} style={{ background: '#181920', color: '#f4f4f5' }}>
                      {t.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#a1a1aa', marginBottom: '6px' }}>
              Title / Topic *
            </label>
            <input
              type="text"
              className="input-dark"
              placeholder="e.g. Docker fundamentals, StateGraph basics, LlamaParse ingestion"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Progress Bullet Points */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#a1a1aa' }}>
                Progress Bullet Points * (3–4 recommended)
              </label>
              <button
                type="button"
                onClick={handleAddPoint}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#c4b5fd',
                  fontSize: '11.5px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Plus size={13} />
                <span>Add bullet</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {points.map((pt, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#a1a1aa', fontSize: '12.5px', minWidth: '16px', textAlign: 'right' }}>
                    {idx + 1}.
                  </span>
                  <input
                    type="text"
                    className="input-dark"
                    placeholder={`Point ${idx + 1}: e.g. ${
                      idx === 0
                        ? 'Learned core concepts...'
                        : idx === 1
                        ? 'Built working implementation...'
                        : idx === 2
                        ? 'Debugged edge cases...'
                        : 'Wrote summary notes...'
                    }`}
                    value={pt}
                    onChange={(e) => handlePointChange(idx, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePoint(idx)}
                    className="btn-icon"
                    title="Remove bullet point"
                    style={{ padding: '6px', color: '#a1a1aa' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Row: Status & Tags */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#a1a1aa', marginBottom: '6px' }}>
                Status
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {(['Planned', 'In Progress', 'Completed'] as Status[]).map((st) => {
                  const isCur = status === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatus(st)}
                      style={{
                        flex: 1,
                        padding: '6px 4px',
                        borderRadius: '7px',
                        fontSize: '11.5px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        border: isCur ? '1px solid var(--accent-purple)' : '1px solid var(--border-subtle)',
                        backgroundColor: isCur ? 'rgba(124, 58, 237, 0.18)' : '#181920',
                        color: isCur ? '#ffffff' : '#a1a1aa',
                        transition: 'all 0.12s ease',
                      }}
                    >
                      {st}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#a1a1aa', marginBottom: '6px' }}>
                Tags (optional)
              </label>
              <input
                type="text"
                className="input-dark"
                placeholder="e.g. dsa, leetcode, api"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '8px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)',
          }}>
            <span style={{ fontSize: '11.5px', color: '#a1a1aa' }}>
              Tip: Press <kbd style={{ background: '#22232b', padding: '2px 6px', borderRadius: '4px', border: '1px solid #2d303b', color: '#d4d4d8' }}>Ctrl+Enter</kbd> to save
            </span>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <Check size={14} strokeWidth={2.5} />
                    <span>{initialEntry ? 'Update Entry' : 'Save Entry'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
