import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import type { ProgressEntry, Technology } from '../types';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  targetEntry?: ProgressEntry | null;
  targetTech?: Technology | null;
  isDeleting: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  targetEntry,
  targetTech,
  isDeleting,
}) => {
  if (!isOpen) return null;

  const isTechBlocked = targetTech && targetTech.entry_count > 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isTechBlocked ? '#fbbf24' : '#ef4444' }}>
            <AlertTriangle size={18} />
            <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#f4f4f5' }}>
              {isTechBlocked
                ? 'Category Protected'
                : targetTech
                ? 'Delete Technology Category'
                : 'Delete Progress Entry'}
            </h2>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {isTechBlocked ? (
            <div style={{ fontSize: '13px', color: '#e4e4e7', lineHeight: 1.5 }}>
              Cannot delete <strong style={{ color: '#ffffff' }}>{targetTech?.name}</strong> because it currently contains{' '}
              <span style={{ color: '#fbbf24', fontWeight: '700' }}>{targetTech?.entry_count} logged entries</span>.
              <br /><br />
              To prevent accidental data loss, please reassign or delete its associated entries before removing this category.
            </div>
          ) : targetTech ? (
            <div style={{ fontSize: '13px', color: '#e4e4e7', lineHeight: 1.5 }}>
              Are you sure you want to permanently delete the category{' '}
              <strong style={{ color: '#ffffff' }}>{targetTech.name}</strong>?
              <br />
              This category has 0 entries and will be removed from your stack.
            </div>
          ) : (
            <div style={{ fontSize: '13px', color: '#e4e4e7', lineHeight: 1.5 }}>
              Are you sure you want to delete{' '}
              <strong style={{ color: '#ffffff' }}>"{targetEntry?.title}"</strong> ({targetEntry?.date})?
              <br />
              This action cannot be undone.
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} className="btn-secondary" disabled={isDeleting}>
              {isTechBlocked ? 'Close' : 'Cancel'}
            </button>
            {!isTechBlocked && (
              <button
                type="button"
                onClick={onConfirm}
                className="btn-primary"
                style={{ backgroundColor: '#dc2626', borderColor: '#b91c1c' }}
                disabled={isDeleting}
              >
                <Trash2 size={14} />
                <span>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
