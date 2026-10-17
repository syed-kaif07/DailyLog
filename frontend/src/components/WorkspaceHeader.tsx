import React from 'react';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  X
} from 'lucide-react';
import type { Technology, ActiveView } from '../types';

interface WorkspaceHeaderProps {
  activeView: ActiveView;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTechId: number | null;
  setSelectedTechId: (id: number | null) => void;
  selectedStatus: string | null;
  setSelectedStatus: (status: string | null) => void;
  technologies: Technology[];
  weekRangeText: string;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onJumpToToday: () => void;
  onOpenLogToday: () => void;
  onClearFilters: () => void;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  activeView,
  searchQuery,
  setSearchQuery,
  selectedTechId,
  setSelectedTechId,
  selectedStatus,
  setSelectedStatus,
  technologies,
  weekRangeText,
  onPrevWeek,
  onNextWeek,
  onJumpToToday,
  onOpenLogToday,
  onClearFilters,
}) => {
  const hasActiveFilters = Boolean(searchQuery || selectedTechId !== null || selectedStatus !== null);

  const getTitleAndSubtitle = () => {
    switch (activeView) {
      case 'entries':
        return {
          title: 'All Logged Entries',
          subtitle: 'Searchable, chronological catalog of all engineering milestones.',
        };
      case 'calendar':
        return {
          title: 'Monthly Progress Calendar',
          subtitle: 'Visualize your consistency and learning habits day by day.',
        };
      case 'insights':
        return {
          title: 'Engineering Insights & Analytics',
          subtitle: 'Real progress metrics, technology distribution, and logging streaks.',
        };
      case 'techstack':
        return {
          title: 'Technology Stack Categories',
          subtitle: 'Organize and manage your core technologies and topic labels.',
        };
      case 'settings':
        return {
          title: 'Settings & Data Backup',
          subtitle: 'Manage local storage, seed demo data, and import/export your logs.',
        };
      case 'board':
      default:
        return {
          title: 'Daily Progress Board',
          subtitle: 'Track what you learn, build and practice. One small step everyday.',
        };
    }
  };

  const { title, subtitle } = getTitleAndSubtitle();

  return (
    <header className="workspace-header">
      {/* Top Bar: Title & Primary Action */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <h1 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#f4f4f5',
            letterSpacing: '-0.3px',
            lineHeight: 1.2,
          }}>
            {title}
          </h1>
          <p style={{ fontSize: '13px', color: '#a1a1aa', marginTop: '3px' }}>
            {subtitle}
          </p>
        </div>

        {/* Log Today button (Hologram style restrained purple) */}
        <button
          onClick={onOpenLogToday}
          className="btn-primary"
          style={{
            padding: '8px 16px',
            fontSize: '13px',
            flexShrink: 0,
          }}
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>+ Log Today</span>
        </button>
      </div>

      {/* Bottom Bar: Filters, Search & Date Navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
      }}>
        {/* Left Side: Search + Dropdowns */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', flex: 1 }}>
          {/* Search Bar */}
          <div style={{ position: 'relative', minWidth: '220px', maxWidth: '320px', flex: 1 }}>
            <Search
              size={14}
              color="#a1a1aa"
              style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              className="input-dark"
              placeholder="Search tasks, topics, points..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '30px', paddingRight: searchQuery ? '28px' : '10px', height: '34px', fontSize: '12.5px' }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="btn-icon"
                style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', padding: '2px' }}
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Technology Filter Dropdown */}
          <div style={{ position: 'relative' }}>
            <select
              value={selectedTechId !== null ? String(selectedTechId) : ''}
              onChange={(e) => setSelectedTechId(e.target.value ? Number(e.target.value) : null)}
              className="input-dark"
              style={{
                height: '34px',
                padding: '4px 10px',
                fontSize: '12.5px',
                width: 'auto',
                minWidth: '140px',
                color: selectedTechId !== null ? '#f4f4f5' : '#a1a1aa',
                borderColor: selectedTechId !== null ? 'var(--accent-purple)' : 'var(--border-subtle)',
              }}
            >
              <option value="" style={{ background: '#18191f', color: '#a1a1aa' }}>
                All technologies
              </option>
              {technologies.map((t) => (
                <option key={t.id} value={t.id} style={{ background: '#18191f', color: '#f4f4f5' }}>
                  {t.name} ({t.entry_count})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter Dropdown */}
          <div style={{ position: 'relative' }}>
            <select
              value={selectedStatus || ''}
              onChange={(e) => setSelectedStatus(e.target.value || null)}
              className="input-dark"
              style={{
                height: '34px',
                padding: '4px 10px',
                fontSize: '12.5px',
                width: 'auto',
                minWidth: '125px',
                color: selectedStatus ? '#f4f4f5' : '#a1a1aa',
                borderColor: selectedStatus ? 'var(--accent-purple)' : 'var(--border-subtle)',
              }}
            >
              <option value="" style={{ background: '#18191f', color: '#a1a1aa' }}>
                All statuses
              </option>
              <option value="Completed" style={{ background: '#18191f', color: '#34d399' }}>
                Completed
              </option>
              <option value="In Progress" style={{ background: '#18191f', color: '#c4b5fd' }}>
                In Progress
              </option>
              <option value="Planned" style={{ background: '#18191f', color: '#d4d4d8' }}>
                Planned
              </option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              style={{
                background: 'transparent',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#f87171',
                borderRadius: '7px',
                padding: '4px 10px',
                fontSize: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                height: '34px',
                transition: 'all 0.12s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.12)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <X size={12} />
              <span>Clear filters</span>
            </button>
          )}
        </div>

        {/* Right Side: Week Date Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={onPrevWeek}
            className="btn-icon"
            title="Previous week"
            style={{
              height: '32px',
              width: '32px',
              border: '1px solid var(--border-subtle)',
              borderRadius: '7px',
              backgroundColor: '#181920',
              color: '#a1a1aa',
            }}
          >
            <ChevronLeft size={16} />
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 12px',
            borderRadius: '7px',
            backgroundColor: '#181920',
            border: '1px solid var(--border-subtle)',
            fontSize: '12.5px',
            color: '#f4f4f5',
            fontWeight: '500',
            userSelect: 'none',
          }}>
            <CalendarIcon size={14} color="#c4b5fd" />
            <span>{weekRangeText}</span>
          </div>

          <button
            onClick={onNextWeek}
            className="btn-icon"
            title="Next week"
            style={{
              height: '32px',
              width: '32px',
              border: '1px solid var(--border-subtle)',
              borderRadius: '7px',
              backgroundColor: '#181920',
              color: '#a1a1aa',
            }}
          >
            <ChevronRight size={16} />
          </button>

          <button
            onClick={onJumpToToday}
            style={{
              height: '32px',
              padding: '0 12px',
              borderRadius: '7px',
              border: '1px solid var(--border-subtle)',
              backgroundColor: '#181920',
              color: '#a1a1aa',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.12s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#f4f4f5';
              e.currentTarget.style.borderColor = 'var(--accent-purple)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#a1a1aa';
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
            }}
          >
            Today
          </button>
        </div>
      </div>
    </header>
  );
};
