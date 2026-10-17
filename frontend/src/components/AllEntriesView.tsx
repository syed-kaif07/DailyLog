import React from 'react';
import { ArrowUpDown, Pencil, Trash2, Calendar, FileText } from 'lucide-react';
import type { ProgressEntry } from '../types';

interface AllEntriesViewProps {
  entries: ProgressEntry[];
  onEditEntry: (entry: ProgressEntry) => void;
  onDeleteEntry: (entry: ProgressEntry) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  onOpenLogToday: () => void;
}

export const AllEntriesView: React.FC<AllEntriesViewProps> = ({
  entries,
  onEditEntry,
  onDeleteEntry,
  sortOrder,
  setSortOrder,
  onOpenLogToday,
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
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
      {/* View Header with Sort Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
      }}>
        <div style={{ fontSize: '13px', color: '#a1a1aa' }}>
          Showing <span style={{ color: '#f4f4f5', fontWeight: '600' }}>{entries.length}</span> recorded entries
        </div>

        <button
          onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
          className="btn-secondary"
          style={{ height: '32px', fontSize: '12.5px' }}
        >
          <ArrowUpDown size={13} />
          <span>Sort: {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
        </button>
      </div>

      {entries.length === 0 ? (
        <div style={{
          padding: '60px 20px',
          textAlign: 'center',
          backgroundColor: '#16171d',
          borderRadius: '10px',
          border: '1px solid var(--border-subtle)',
        }}>
          <FileText size={36} color="#52525b" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: '15px', color: '#f4f4f5', fontWeight: '600' }}>No entries found</h3>
          <p style={{ fontSize: '13px', color: '#a1a1aa', maxWidth: '360px', margin: '4px auto 16px auto' }}>
            No progress entries match your current search and filters.
          </p>
          <button onClick={onOpenLogToday} className="btn-primary" style={{ margin: '0 auto' }}>
            + Log First Entry
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {entries.map((entry) => (
            <div
              key={entry.id}
              style={{
                backgroundColor: '#1a1b22',
                border: '1px solid var(--border-subtle)',
                borderLeft: `3px solid ${entry.technology_color || 'var(--accent-purple)'}`,
                borderRadius: '8px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '16px',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#20222b';
                e.currentTarget.style.borderColor = 'var(--border-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1a1b22';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }}
            >
              {/* Left Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Meta row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} color="#a1a1aa" />
                    {entry.date}
                  </span>
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
                  {entry.is_demo && (
                    <span style={{ fontSize: '10px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      (demo)
                    </span>
                  )}
                </div>

                {/* Title */}
                <h4 style={{ fontSize: '14.5px', fontWeight: '600', color: '#f4f4f5', marginBottom: '8px' }}>
                  {entry.title}
                </h4>

                {/* Bullets */}
                <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {entry.progress_points.map((pt, i) => (
                    <li key={i} style={{ fontSize: '12.5px', color: '#e4e4e7', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                      <span style={{ color: '#a1a1aa' }}>•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>

                {/* Tags */}
                {entry.tags && entry.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                    {entry.tags.map((t, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '11px',
                          color: '#a1a1aa',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          padding: '2px 7px',
                          borderRadius: '4px',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Action buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                <button
                  onClick={() => onEditEntry(entry)}
                  className="btn-icon"
                  title="Edit entry"
                  style={{ padding: '6px', color: '#a1a1aa' }}
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => onDeleteEntry(entry)}
                  className="btn-icon"
                  title="Delete entry"
                  style={{ padding: '6px', color: '#a1a1aa' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#a1a1aa')}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
