import React from 'react';
import { 
  LayoutDashboard, 
  ListOrdered, 
  Calendar, 
  TrendingUp, 
  Layers, 
  Settings, 
  Plus, 
  Box,
  Filter
} from 'lucide-react';
import type { Technology, ActiveView } from '../types';

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  technologies: Technology[];
  selectedTechId: number | null;
  onSelectTechnology: (techId: number | null) => void;
  onOpenNewTechModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  technologies,
  selectedTechId,
  onSelectTechnology,
  onOpenNewTechModal,
}) => {
  const navItems = [
    { id: 'board' as ActiveView, label: 'Daily Board', icon: LayoutDashboard },
    { id: 'entries' as ActiveView, label: 'All Entries', icon: ListOrdered },
    { id: 'calendar' as ActiveView, label: 'Calendar', icon: Calendar },
    { id: 'insights' as ActiveView, label: 'Insights', icon: TrendingUp },
    { id: 'techstack' as ActiveView, label: 'Tech Stack', icon: Layers },
    { id: 'settings' as ActiveView, label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div style={{ padding: '18px 18px 16px 18px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: '#1f1b2e',
            border: '1px solid #4c1d95',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#c4b5fd'
          }}>
            <Box size={18} strokeWidth={2.2} />
          </div>
          <div>
            <h1 style={{ fontSize: '15px', fontWeight: '700', color: '#f4f4f5', letterSpacing: '-0.2px', lineHeight: 1.2 }}>
              BuildLog
            </h1>
            <p style={{ fontSize: '11px', color: '#a1a1aa', marginTop: '2px', fontWeight: '400' }}>
              My AI Engineering Journey
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div style={{ padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '7px',
                backgroundColor: isActive ? 'rgba(124, 58, 237, 0.14)' : 'transparent',
                color: isActive ? '#f4f4f5' : '#a1a1aa',
                border: isActive ? '1px solid rgba(124, 58, 237, 0.3)' : '1px solid transparent',
                fontSize: '13px',
                fontWeight: isActive ? '600' : '500',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                width: '100%',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = '#f4f4f5';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#a1a1aa';
                }
              }}
            >
              <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} color={isActive ? '#c4b5fd' : '#a1a1aa'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Technologies Category Section */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 10px 10px 10px', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 8px 8px 8px',
        }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#71717a', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
            Technologies
          </span>
          <button
            onClick={onOpenNewTechModal}
            title="Add new technology"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#a1a1aa',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '4px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#f4f4f5')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#a1a1aa')}
          >
            <Plus size={14} />
          </button>
        </div>

        {technologies.length === 0 ? (
          <div style={{
            padding: '16px 10px',
            textAlign: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '8px',
            border: '1px dashed #262831',
            margin: '4px 0',
          }}>
            <p style={{ fontSize: '11.5px', color: '#a1a1aa', marginBottom: '8px' }}>
              No categories yet
            </p>
            <button
              onClick={onOpenNewTechModal}
              style={{
                background: 'rgba(124, 58, 237, 0.14)',
                border: '1px solid rgba(124, 58, 237, 0.35)',
                borderRadius: '6px',
                color: '#c4b5fd',
                padding: '5px 10px',
                fontSize: '11.5px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Plus size={12} />
              <span>Add Category</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <button
              onClick={() => onSelectTechnology(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                borderRadius: '6px',
                backgroundColor: selectedTechId === null && activeView === 'board' ? 'rgba(255, 255, 255, 0.07)' : 'transparent',
                color: selectedTechId === null && activeView === 'board' ? '#f4f4f5' : '#a1a1aa',
                border: 'none',
                fontSize: '12.5px',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
                transition: 'all 0.12s ease',
              }}
              onMouseEnter={(e) => {
                if (selectedTechId !== null) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
              }}
              onMouseLeave={(e) => {
                if (selectedTechId !== null) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={12} color="#71717a" />
                <span>All Categories</span>
              </div>
            </button>

            {/* List of Technologies */}
            {technologies.map((tech) => {
              const isSelected = selectedTechId === tech.id;
              return (
                <button
                  key={tech.id}
                  onClick={() => {
                    onSelectTechnology(isSelected ? null : tech.id);
                    if (activeView !== 'board' && activeView !== 'entries') {
                      setActiveView('board');
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    backgroundColor: isSelected ? 'rgba(124, 58, 237, 0.16)' : 'transparent',
                    color: isSelected ? '#ffffff' : '#a1a1aa',
                    border: isSelected ? `1px solid rgba(124, 58, 237, 0.35)` : '1px solid transparent',
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    transition: 'all 0.12s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                      e.currentTarget.style.color = '#f4f4f5';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#a1a1aa';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: tech.color,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {tech.name}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '600',
                      color: isSelected ? '#ffffff' : '#71717a',
                      backgroundColor: isSelected ? 'rgba(124, 58, 237, 0.25)' : 'rgba(255,255,255,0.04)',
                      padding: '1px 6px',
                      borderRadius: '8px',
                      minWidth: '18px',
                      textAlign: 'center',
                    }}
                  >
                    {tech.entry_count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* User Profile Area (Hologram charcoal style) */}
      <div style={{
        padding: '12px 14px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        backgroundColor: '#0c0d10'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: '#1f2027',
          border: '1px solid #2d2f3a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: '700',
          color: '#f4f4f5',
          flexShrink: 0,
        }}>
          SK
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#f4f4f5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Syed Kaifuddin
          </div>
          <div style={{ fontSize: '11.5px', color: '#a1a1aa', whiteSpace: 'nowrap' }}>
            Personal workspace
          </div>
        </div>
      </div>
    </aside>
  );
};
