import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import type { Technology } from '../types';

interface TechModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, color: string) => Promise<void>;
  initialTech?: Technology | null;
}

const PRESET_COLORS = [
  '#7c3aed', // purple
  '#a855f7', // violet
  '#06b6d4', // cyan
  '#10b981', // green
  '#f59e0b', // amber
  '#eab308', // yellow
  '#ef4444', // red
  '#fb923c', // orange
  '#ec4899', // pink
  '#6366f1', // indigo
  '#3b82f6', // blue
  '#64748b', // slate
];

export const TechModal: React.FC<TechModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTech,
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#7c3aed');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setIsSubmitting(false);
      if (initialTech) {
        setName(initialTech.name);
        setColor(initialTech.color);
      } else {
        setName('');
        setColor('#7c3aed');
      }
    }
  }, [isOpen, initialTech]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setErrorMsg('Technology name cannot be empty.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await onSave(cleanName, color);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save technology category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#f4f4f5' }}>
            {initialTech ? 'Edit Technology' : '+ New Technology Category'}
          </h2>
          <button onClick={onClose} className="btn-icon">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {errorMsg && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: '6px',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#f87171',
              fontSize: '12px',
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#a1a1aa', marginBottom: '6px' }}>
              Category Name *
            </label>
            <input
              type="text"
              className="input-dark"
              placeholder="e.g. PyTorch, Kubernetes, Next.js"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#a1a1aa', marginBottom: '8px' }}>
              Accent Color
            </label>
            
            {/* Color Swatches */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', marginBottom: '10px' }}>
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{
                    height: '32px',
                    backgroundColor: c,
                    borderRadius: '6px',
                    border: color === c ? '2px solid #ffffff' : '1px solid rgba(0,0,0,0.3)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: color === c ? '0 0 8px rgba(255,255,255,0.4)' : 'none',
                  }}
                >
                  {color === c && <Check size={14} color="#ffffff" strokeWidth={3} />}
                </button>
              ))}
            </div>

            {/* Custom Hex Code */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{
                  width: '36px',
                  height: '32px',
                  padding: '0',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  background: 'transparent',
                  cursor: 'pointer',
                }}
              />
              <input
                type="text"
                className="input-dark"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{ flex: 1, height: '32px', fontSize: '12px' }}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} className="btn-secondary" disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : initialTech ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
