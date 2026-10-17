import React, { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  pointerWithin,
  closestCorners,
  useDroppable,
  type CollisionDetection,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import type { ProgressEntry } from '../types';
import type { ReorderItem } from '../api';
import { SortableProgressCard } from './SortableProgressCard';
import { ProgressCard } from './ProgressCard';

export interface DayColumnData {
  dayName: string;
  dayShort: string;
  dateStr: string; // YYYY-MM-DD
  displayDate: string; // e.g. "Oct 12, 2026"
  isToday: boolean;
  entries: ProgressEntry[];
}

export interface DailyBoardProps {
  days: DayColumnData[];
  allEntries: ProgressEntry[];
  hasActiveFilters: boolean;
  onReorder: (items: ReorderItem[], optimisticEntries: ProgressEntry[]) => void;
  onWarningMessage?: (msg: string) => void;
  onAddEntryForDate: (dateStr: string) => void;
  onEditEntry: (entry: ProgressEntry) => void;
  onDeleteEntry: (entry: ProgressEntry) => void;
}

const DroppableDayColumn: React.FC<{
  day: DayColumnData;
  isOver: boolean;
  isDraggingAny: boolean;
  onAddEntryForDate: (dateStr: string) => void;
  onEditEntry: (entry: ProgressEntry) => void;
  onDeleteEntry: (entry: ProgressEntry) => void;
}> = ({
  day,
  isOver,
  isDraggingAny,
  onAddEntryForDate,
  onEditEntry,
  onDeleteEntry,
}) => {
  const { setNodeRef } = useDroppable({
    id: `column-${day.dateStr}`,
    data: {
      type: 'column',
      dateStr: day.dateStr,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`day-column ${isOver ? 'target-column-highlight' : ''}`}
      style={{
        borderColor: isOver
          ? 'var(--accent-purple)'
          : day.isToday
          ? 'rgba(124, 58, 237, 0.45)'
          : 'var(--border-subtle)',
        backgroundColor: isOver
          ? 'rgba(124, 58, 237, 0.08)'
          : day.isToday
          ? 'rgba(28, 25, 38, 0.6)'
          : 'var(--bg-column)',
      }}
    >
      {/* Column Header */}
      <div style={{
        padding: '12px 14px 10px 14px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '14px',
              fontWeight: '700',
              color: day.isToday ? '#c4b5fd' : '#f4f4f5',
              letterSpacing: '-0.2px',
            }}>
              {day.dayShort}
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: '600',
                color: '#d4d4d8',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                padding: '1px 6px',
                borderRadius: '8px',
              }}
            >
              {day.entries.length}
            </span>
          </div>
          <div style={{ fontSize: '11.5px', color: '#a1a1aa', marginTop: '2px', fontWeight: '400' }}>
            {day.displayDate}
          </div>
        </div>

        {/* Quick Add Button in Header */}
        <button
          onClick={() => onAddEntryForDate(day.dateStr)}
          title={`Log entry for ${day.displayDate}`}
          className="btn-icon"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            padding: '5px',
            borderRadius: '6px',
            color: '#a1a1aa',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#f4f4f5';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#a1a1aa';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
          }}
        >
          <Plus size={14} strokeWidth={2.2} />
        </button>
      </div>

      {/* Cards List wrapped in SortableContext */}
      <SortableContext
        id={`sortable-${day.dateStr}`}
        items={day.entries.map((e) => e.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="column-cards-container">
          {day.entries.length === 0 ? (
            <div className={`empty-column-dropzone ${isDraggingAny ? 'active-target' : ''}`}>
              <span>{isDraggingAny ? 'Drop card here' : 'No entries'}</span>
            </div>
          ) : (
            day.entries.map((entry) => (
              <SortableProgressCard
                key={entry.id}
                entry={entry}
                onEdit={onEditEntry}
                onDelete={onDeleteEntry}
              />
            ))
          )}

          {/* Add Entry Card Button at bottom of column */}
          <button
            onClick={() => onAddEntryForDate(day.dateStr)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: '1px dashed #2d303c',
              backgroundColor: 'transparent',
              color: '#a1a1aa',
              fontSize: '12.5px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
              marginTop: day.entries.length > 0 ? '4px' : '0',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-purple)';
              e.currentTarget.style.color = '#c4b5fd';
              e.currentTarget.style.backgroundColor = 'rgba(124, 58, 237, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#2d303c';
              e.currentTarget.style.color = '#a1a1aa';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Plus size={13} strokeWidth={2} />
            <span>Add entry</span>
          </button>
        </div>
      </SortableContext>
    </div>
  );
};

export const DailyBoard: React.FC<DailyBoardProps> = ({
  days,
  allEntries,
  hasActiveFilters,
  onReorder,
  onWarningMessage,
  onAddEntryForDate,
  onEditEntry,
  onDeleteEntry,
}) => {
  const [activeEntry, setActiveEntry] = useState<ProgressEntry | null>(null);
  const [overColumnDate, setOverColumnDate] = useState<string | null>(null);

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 6,
    },
  });

  const keyboardSensor = useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  });

  const sensors = useSensors(pointerSensor, keyboardSensor);

  // Collision detection prioritizing cards within pointer then closest column
  const collisionDetectionStrategy: CollisionDetection = useCallback((args) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      const cardCollision = pointerCollisions.find((c) => typeof c.id === 'number');
      if (cardCollision) {
        return [cardCollision];
      }
      return pointerCollisions;
    }
    return closestCorners(args);
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    const activeId = event.active.id;
    for (const d of days) {
      const match = d.entries.find((e) => e.id === activeId);
      if (match) {
        setActiveEntry(match);
        setOverColumnDate(d.dateStr);
        break;
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (!over) {
      setOverColumnDate(null);
      return;
    }

    if (typeof over.id === 'string' && over.id.startsWith('column-')) {
      setOverColumnDate(over.id.replace('column-', ''));
    } else {
      for (const d of days) {
        if (d.entries.some((e) => e.id === over.id)) {
          setOverColumnDate(d.dateStr);
          break;
        }
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const currentActive = activeEntry;
    setActiveEntry(null);
    setOverColumnDate(null);

    if (!over || !currentActive) return;
    if (active.id === over.id) return;

    // Find source column
    const sourceDay = days.find((d) => d.entries.some((e) => e.id === active.id));
    if (!sourceDay) return;

    // Find target column
    let targetDay: DayColumnData | undefined;

    if (typeof over.id === 'string' && over.id.startsWith('column-')) {
      const targetDate = over.id.replace('column-', '');
      targetDay = days.find((d) => d.dateStr === targetDate);
    } else {
      targetDay = days.find((d) => d.entries.some((e) => e.id === over.id));
    }

    if (!targetDay) return;

    // Same day reordering
    if (sourceDay.dateStr === targetDay.dateStr) {
      if (hasActiveFilters) {
        onWarningMessage?.(
          'Reordering within a day is disabled while filters are active to prevent displacing hidden entries. Clear filters to reorder within a day.'
        );
        return;
      }

      const oldIndex = sourceDay.entries.findIndex((e) => e.id === active.id);
      const newIndex = sourceDay.entries.findIndex((e) => e.id === over.id);

      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

      const reordered = arrayMove(sourceDay.entries, oldIndex, newIndex);
      const itemsToUpdate: ReorderItem[] = reordered.map((e, idx) => ({
        id: e.id,
        date: sourceDay.dateStr,
        order_index: idx,
      }));

      const nextEntries = allEntries.map((e) => {
        const match = itemsToUpdate.find((item) => item.id === e.id);
        return match ? { ...e, date: match.date, order_index: match.order_index } : e;
      });

      onReorder(itemsToUpdate, nextEntries);
      return;
    }

    // Cross day move (different days)
    let insertIndex = targetDay.entries.length;
    if (typeof over.id === 'number') {
      const overIdx = targetDay.entries.findIndex((e) => e.id === over.id);
      if (overIdx !== -1) {
        insertIndex = overIdx;
      }
    }

    if (hasActiveFilters) {
      // Safe append to target day when filtered to protect hidden cards
      const maxOrder = targetDay.entries.length > 0
        ? Math.max(...targetDay.entries.map((e) => e.order_index ?? 0)) + 1
        : 0;

      const itemsToUpdate: ReorderItem[] = [
        {
          id: currentActive.id,
          date: targetDay.dateStr,
          order_index: maxOrder,
        },
      ];

      const nextEntries = allEntries.map((e) => {
        if (e.id === currentActive.id) {
          return { ...e, date: targetDay.dateStr, order_index: maxOrder };
        }
        return e;
      });

      onReorder(itemsToUpdate, nextEntries);
    } else {
      // Clean sequential re-indexing for both source and target columns
      const remainingSource = sourceDay.entries.filter((e) => e.id !== currentActive.id);
      const newTarget = [...targetDay.entries];
      const movedEntry = { ...currentActive, date: targetDay.dateStr };
      newTarget.splice(insertIndex, 0, movedEntry);

      const itemsToUpdate: ReorderItem[] = [
        ...remainingSource.map((e, idx) => ({
          id: e.id,
          date: sourceDay.dateStr,
          order_index: idx,
        })),
        ...newTarget.map((e, idx) => ({
          id: e.id,
          date: targetDay.dateStr,
          order_index: idx,
        })),
      ];

      const nextEntries = allEntries.map((e) => {
        const match = itemsToUpdate.find((item) => item.id === e.id);
        return match ? { ...e, date: match.date, order_index: match.order_index } : e;
      });

      onReorder(itemsToUpdate, nextEntries);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="board-container">
        {days.map((day) => {
          const isTargetColumn = overColumnDate === day.dateStr && activeEntry?.date !== day.dateStr;
          return (
            <DroppableDayColumn
              key={day.dateStr}
              day={day}
              isOver={isTargetColumn}
              isDraggingAny={activeEntry !== null}
              onAddEntryForDate={onAddEntryForDate}
              onEditEntry={onEditEntry}
              onDeleteEntry={onDeleteEntry}
            />
          );
        })}
      </div>

      <DragOverlay
        dropAnimation={{
          duration: 180,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
        }}
      >
        {activeEntry ? (
          <div
            style={{
              width: '250px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.75), 0 0 0 1.5px var(--accent-purple)',
              borderRadius: '8px',
              cursor: 'grabbing',
              pointerEvents: 'none',
            }}
          >
            <ProgressCard
              entry={activeEntry}
              onEdit={() => {}}
              onDelete={() => {}}
              isOverlay
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
