import React from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { Technology } from '../types';

interface TechStackViewProps {
  technologies: Technology[];
  onAddCategory: () => void;
  onEditCategory: (tech: Technology) => void;
  onDeleteCategory: (tech: Technology) => void;
}

export const TechStackView: React.FC<TechStackViewProps> = ({
  technologies,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
}) => {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
      {/* Header with Add Action */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#f4f4f5' }}>
            Technology Categories ({technologies.length})
          </h2>
          <p style={{ fontSize: '13px', color: '#a1a1aa', marginTop: '2px' }}>
            Manage the stack components you are actively studying and engineering with.
          </p>
        </div>

        <button onClick={onAddCategory} className="btn-primary">
          <Plus size={15} strokeWidth={2.5} />
          <span>+ Add Technology</span>
        </button>
      </div>

      {/* Grid of Categories or Empty State */}
      {technologies.length === 0 ? (
        <div style={{
          padding: '60px 20px',
          textAlign: 'center',
          backgroundColor: '#16171d',
          borderRadius: '10px',
          border: '1px solid var(--border-subtle)',
        }}>
          <h3 style={{ fontSize: '15px', color: '#f4f4f5', fontWeight: '600' }}>No technology categories yet</h3>
          <p style={{ fontSize: '13px', color: '#a1a1aa', maxWidth: '420px', margin: '4px auto 16px auto', lineHeight: 1.45 }}>
            Create your first technology categories to organize your daily engineering logs (e.g. Python, PyTorch, LangGraph, Docker, System Design).
          </p>
          <button onClick={onAddCategory} className="btn-primary" style={{ margin: '0 auto' }}>
            <Plus size={15} strokeWidth={2.5} />
            <span>+ Create First Category</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
          {technologies.map((tech) => (
          <div
            key={tech.id}
            style={{
              backgroundColor: '#16171d',
              border: '1px solid var(--border-subtle)',
              borderLeft: `4px solid ${tech.color}`,
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '12px',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1d1e26';
              e.currentTarget.style.borderColor = 'var(--border-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#16171d';
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: tech.color }} />
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#f4f4f5' }}>
                    {tech.name}
                  </h3>
                </div>
                <div style={{ fontSize: '11.5px', color: '#a1a1aa', marginTop: '4px' }}>
                  Hex: {tech.color}
                </div>
              </div>

              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#d4d4d8',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  padding: '2px 8px',
                  borderRadius: '10px',
                }}
              >
                {tech.entry_count} {tech.entry_count === 1 ? 'entry' : 'entries'}
              </span>
            </div>

            {/* Actions */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '6px',
              paddingTop: '10px',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            }}>
              <button
                onClick={() => onEditCategory(tech)}
                className="btn-secondary"
                style={{ padding: '4px 10px', fontSize: '12px' }}
              >
                <Pencil size={12} />
                <span>Rename</span>
              </button>
              <button
                onClick={() => onDeleteCategory(tech)}
                className="btn-secondary"
                style={{ padding: '4px 10px', fontSize: '12px', color: '#f87171' }}
                title={tech.entry_count > 0 ? 'Cannot delete: category has entries' : 'Delete category'}
              >
                <Trash2 size={12} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};
