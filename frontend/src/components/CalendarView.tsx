import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalIcon } from 'lucide-react';
import type { ProgressEntry } from '../types';
import { ProgressCard } from './ProgressCard';

interface CalendarViewProps {
  entries: ProgressEntry[];
  onAddEntryForDate: (dateStr: string) => void;
  onEditEntry: (entry: ProgressEntry) => void;
  onDeleteEntry: (entry: ProgressEntry) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  entries,
  onAddEntryForDate,
  onEditEntry,
  onDeleteEntry,
}) => {
  // Calendar month state
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 9, 1)); // Oct 2026 default
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-10-17');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Group entries by date
  const entriesByDate = entries.reduce((acc, entry) => {
    if (!acc[entry.date]) acc[entry.date] = [];
    acc[entry.date].push(entry);
    return acc;
  }, {} as Record<string, ProgressEntry[]>);

  // Calculate calendar grid days
  const firstDayOfMonth = new Date(year, month, 1);
  // Get day of week (0 = Sunday, 1 = Monday). We want Monday = 0
  let startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; 
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = [];
  // Empty padding for days before start
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    const dateStr = `${year}-${mm}-${dd}`;
    calendarDays.push({ dayNum: d, dateStr });
  }

  const selectedEntries = entriesByDate[selectedDateStr] || [];

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden', padding: '16px 20px', gap: '16px' }}>
      {/* Left: Month Calendar Grid */}
      <div style={{
        flex: 1.5,
        backgroundColor: '#16171d',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px',
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Month Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CalIcon size={18} color="#c4b5fd" />
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#f4f4f5' }}>
              {monthNames[month]} {year}
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={handlePrevMonth} className="btn-icon" style={{ padding: '6px', border: '1px solid var(--border-subtle)', color: '#a1a1aa' }}>
              <ChevronLeft size={16} />
            </button>
            <button onClick={handleNextMonth} className="btn-icon" style={{ padding: '6px', border: '1px solid var(--border-subtle)', color: '#a1a1aa' }}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Day of Week Headers (Mon - Sun) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', marginBottom: '8px' }}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} style={{ textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#a1a1aa' }}>
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', flex: 1 }}>
          {calendarDays.map((cell, idx) => {
            if (!cell) {
              return <div key={`empty-${idx}`} style={{ opacity: 0.2 }} />;
            }

            const dayEntries = entriesByDate[cell.dateStr] || [];
            const isSelected = selectedDateStr === cell.dateStr;
            const hasEntries = dayEntries.length > 0;

            return (
              <div
                key={cell.dateStr}
                onClick={() => setSelectedDateStr(cell.dateStr)}
                style={{
                  backgroundColor: isSelected
                    ? 'rgba(124, 58, 237, 0.16)'
                    : hasEntries
                    ? '#1a1b24'
                    : '#14151a',
                  border: isSelected
                    ? '1px solid var(--accent-purple)'
                    : hasEntries
                    ? '1px solid #282a35'
                    : '1px solid #20222a',
                  borderRadius: '8px',
                  padding: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '75px',
                  transition: 'all 0.12s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.borderColor = '#383b4b';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.borderColor = hasEntries ? '#282a35' : '#20222a';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '12.5px',
                    fontWeight: isSelected || hasEntries ? '700' : '500',
                    color: isSelected ? '#ffffff' : hasEntries ? '#f4f4f5' : '#71717a',
                  }}>
                    {cell.dayNum}
                  </span>
                  {hasEntries && (
                    <span style={{
                      fontSize: '10px',
                      fontWeight: '700',
                      color: '#d4d4d8',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      padding: '1px 6px',
                      borderRadius: '8px',
                    }}>
                      {dayEntries.length}
                    </span>
                  )}
                </div>

                {/* Technology Dots */}
                {hasEntries && (
                  <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', marginTop: '4px' }}>
                    {dayEntries.slice(0, 5).map((e) => (
                      <div
                        key={e.id}
                        title={`${e.technology_name}: ${e.title}`}
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: e.technology_color || '#7c3aed',
                        }}
                      />
                    ))}
                    {dayEntries.length > 5 && (
                      <span style={{ fontSize: '9px', color: '#a1a1aa' }}>+{dayEntries.length - 5}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Selected Day Panel */}
      <div style={{
        flex: 1,
        backgroundColor: '#16171d',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px',
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#f4f4f5' }}>
              {selectedDateStr}
            </h3>
            <p style={{ fontSize: '12.5px', color: '#a1a1aa', marginTop: '2px' }}>
              {selectedEntries.length} entries recorded
            </p>
          </div>

          <button
            onClick={() => onAddEntryForDate(selectedDateStr)}
            className="btn-primary"
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            <Plus size={14} />
            <span>+ Add Entry</span>
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {selectedEntries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 10px', color: '#a1a1aa', fontSize: '13px' }}>
              No entries logged for this day.
              <br />
              <button
                onClick={() => onAddEntryForDate(selectedDateStr)}
                style={{
                  marginTop: '12px',
                  background: 'none',
                  border: 'none',
                  color: '#c4b5fd',
                  cursor: 'pointer',
                  fontSize: '13px',
                  textDecoration: 'underline',
                }}
              >
                Log your progress now
              </button>
            </div>
          ) : (
            selectedEntries.map((entry) => (
              <ProgressCard
                key={entry.id}
                entry={entry}
                onEdit={onEditEntry}
                onDelete={onDeleteEntry}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
