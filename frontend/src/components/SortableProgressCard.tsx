import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ProgressEntry } from '../types';
import { ProgressCard } from './ProgressCard';

interface SortableProgressCardProps {
  entry: ProgressEntry;
  onEdit: (entry: ProgressEntry) => void;
  onDelete: (entry: ProgressEntry) => void;
  disabled?: boolean;
}

export const SortableProgressCard: React.FC<SortableProgressCardProps> = ({
  entry,
  onEdit,
  onDelete,
  disabled = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: entry.id,
    data: {
      type: 'card',
      entry,
    },
    disabled,
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    touchAction: 'none',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`sortable-card-wrapper ${isDragging ? 'is-dragging-placeholder' : ''}`}
    >
      <ProgressCard
        entry={entry}
        onEdit={onEdit}
        onDelete={onDelete}
        isDragging={isDragging}
      />
    </div>
  );
};
