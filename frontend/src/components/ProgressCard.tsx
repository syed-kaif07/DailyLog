import React from 'react';
import { FileText, Pencil, Trash2 } from 'lucide-react';
import type { ProgressEntry } from '../types';

interface ProgressCardProps {
  entry: ProgressEntry;
  onEdit: (entry: ProgressEntry) => void;
  onDelete: (entry: ProgressEntry) => void;
  isOverlay?: boolean;
  isDragging?: boolean;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
  entry,
  onEdit,
  onDelete,
  isOverlay = false,
  isDragging = false,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return <span className="status-pill status-completed">Completed</span>;
      case 'In Progress':
        return <span className="status-pill status-inprogress">In Progress</span>;
      case 'Planned':
      default:
        return <span className="status-pill status-planned">Planned</span>;
    }
  };

  return (
    <div
      className={`progress-card ${isOverlay ? 'card-drag-overlay' : ''} ${isDragging ? 'is-dragging-card' : ''}`}
      style={{
        borderLeft: `3px solid ${entry.technology_color || 'var(--accent-purple)'}`,
        cursor: isOverlay ? 'grabbing' : 'grab',
      }}
    >
      {/* Top Header: Tech Badge + Status Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
        <span
          className="tech-pill"
          style={{
            backgroundColor: `${entry.technology_color || '#7c3aed'}22`,
            border: `1px solid ${entry.technology_color || '#7c3aed'}45`,
            color: '#f4f4f5',
          }}
        >
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: entry.technology_color || '#7c3aed',
            marginRight: '5px',
            display: 'inline-block'
          }} />
          {entry.technology_name}
        </span>
        {getStatusBadge(entry.status)}
      </div>

      {/* Entry Title */}
      <div style={{
        fontSize: '13.5px',
        fontWeight: '600',
        color: '#f4f4f5',
        lineHeight: 1.4,
        marginTop: '2px',
        letterSpacing: '-0.1px',
      }}>
        {entry.title}
      </div>

      {/* Progress Bullet Points directly readable without clicking */}
      {entry.progress_points && entry.progress_points.length > 0 && (
        <ul style={{
          listStyleType: 'none',
          padding: 0,
          margin: '2px 0 0 0',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
        }}>
          {entry.progress_points.map((point, idx) => (
            <li
              key={idx}
              style={{
                fontSize: '12.5px',
                color: '#e4e4e7',
                lineHeight: 1.45,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '6px',
              }}
            >
              <span style={{ color: '#a1a1aa', fontSize: '13px', lineHeight: '14px', userSelect: 'none' }}>•</span>
              <span style={{ wordBreak: 'break-word' }}>{point}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Tags if available */}
      {entry.tags && entry.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '3px' }}>
          {entry.tags.map((tag, i) => (
            <span
              key={i}
              style={{
                fontSize: '10.5px',
                color: '#a1a1aa',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                padding: '2px 6px',
                borderRadius: '4px',
                border: '1px solid rgba(255, 255, 255, 0.07)',
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Card Footer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '4px',
        paddingTop: '6px',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#a1a1aa' }}>
          <FileText size={13} strokeWidth={1.8} />
          {entry.is_demo && (
            <span style={{ fontSize: '9.5px', color: '#71717a', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
              demo
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(entry);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="btn-icon"
            title="Edit entry"
            style={{ padding: '3px', color: '#a1a1aa' }}
          >
            <Pencil size={13} strokeWidth={1.8} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(entry);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="btn-icon"
            title="Delete entry"
            style={{ padding: '3px', color: '#a1a1aa' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#a1a1aa')}
          >
            <Trash2 size={13} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </div>
  );
};
