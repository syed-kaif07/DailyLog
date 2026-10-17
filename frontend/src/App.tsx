import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { WorkspaceHeader } from './components/WorkspaceHeader';
import { DailyBoard } from './components/DailyBoard';
import { AllEntriesView } from './components/AllEntriesView';
import { CalendarView } from './components/CalendarView';
import { InsightsView } from './components/InsightsView';
import { TechStackView } from './components/TechStackView';
import { SettingsView } from './components/SettingsView';
import { EntryModal } from './components/EntryModal';
import { TechModal } from './components/TechModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';

import type { 
  Technology, 
  ProgressEntry, 
  ActiveView, 
  Status 
} from './types';
import { 
  getTechnologies, 
  getEntries, 
  createEntry, 
  updateEntry, 
  deleteEntry,
  createTechnology,
  updateTechnology,
  deleteTechnology,
  reorderEntries,
  type ReorderItem,
} from './api';

export const App: React.FC = () => {
  // Navigation
  const [activeView, setActiveView] = useState<ActiveView>('board');

  // Core Data
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTechId, setSelectedTechId] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Toast / Status Notifications
  const [toast, setToast] = useState<{
    type: 'info' | 'warning' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  // Week Navigation State
  // Default to 2026-10-12 (Monday of the target demo week)
  const [referenceDate, setReferenceDate] = useState<Date>(() => new Date(2026, 9, 12));

  // Modal States
  const [isEntryModalOpen, setIsEntryModalOpen] = useState<boolean>(false);
  const [editingEntry, setEditingEntry] = useState<ProgressEntry | null>(null);
  const [defaultEntryDate, setDefaultEntryDate] = useState<string>('2026-10-17');

  const [isTechModalOpen, setIsTechModalOpen] = useState<boolean>(false);
  const [editingTech, setEditingTech] = useState<Technology | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [targetDeleteEntry, setTargetDeleteEntry] = useState<ProgressEntry | null>(null);
  const [targetDeleteTech, setTargetDeleteTech] = useState<Technology | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Load Technologies
  const loadTechnologies = useCallback(async () => {
    try {
      const data = await getTechnologies();
      setTechnologies(data);
    } catch (err) {
      console.error('Error loading technologies:', err);
    }
  }, []);

  // Load Entries with filters
  const loadEntries = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getEntries({
        technology_id: selectedTechId,
        status: selectedStatus,
        search: searchQuery || undefined,
        sort_order: sortOrder,
      });
      setEntries(data);
    } catch (err) {
      console.error('Error loading entries:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedTechId, selectedStatus, searchQuery, sortOrder]);

  // Initial load
  useEffect(() => {
    loadTechnologies();
  }, [loadTechnologies]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // Compute Monday through Sunday for current reference date
  const weekDays = useMemo(() => {
    const d = new Date(referenceDate);
    // Find Monday (0 is Sunday, 1 is Monday)
    const dayOfWeek = (d.getDay() + 6) % 7;
    const monday = new Date(d);
    monday.setDate(d.getDate() - dayOfWeek);

    const days = [];
    const dayShorts = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const todayStr = '2026-10-17'; // Today's local date context

    for (let i = 0; i < 7; i++) {
      const cur = new Date(monday);
      cur.setDate(monday.getDate() + i);

      const yyyy = cur.getFullYear();
      const mm = String(cur.getMonth() + 1).padStart(2, '0');
      const dd = String(cur.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;

      const displayDate = `${monthNames[cur.getMonth()]} ${cur.getDate()}, ${yyyy}`;

      const dayEntries = entries.filter((e) => e.date === dateStr);

      days.push({
        dayName: dayShorts[i],
        dayShort: dayShorts[i],
        dateStr,
        displayDate,
        isToday: dateStr === todayStr,
        entries: dayEntries,
      });
    }

    return days;
  }, [referenceDate, entries]);

  const weekRangeText = useMemo(() => {
    if (weekDays.length === 0) return '';
    const first = weekDays[0].displayDate;
    const last = weekDays[6].displayDate;
    return `${first} → ${last}`;
  }, [weekDays]);

  // Week Controls
  const handlePrevWeek = () => {
    const next = new Date(referenceDate);
    next.setDate(next.getDate() - 7);
    setReferenceDate(next);
  };

  const handleNextWeek = () => {
    const next = new Date(referenceDate);
    next.setDate(next.getDate() + 7);
    setReferenceDate(next);
  };

  const handleJumpToToday = () => {
    setReferenceDate(new Date(2026, 9, 17));
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedTechId(null);
    setSelectedStatus(null);
  };

  // Entry CRUD Handlers
  const handleOpenLogToday = (specificDate?: string) => {
    setEditingEntry(null);
    setDefaultEntryDate(specificDate || '2026-10-17');
    setIsEntryModalOpen(true);
  };

  const handleEditEntry = (entry: ProgressEntry) => {
    setEditingEntry(entry);
    setIsEntryModalOpen(true);
  };

  const handleSaveEntry = async (payload: {
    date: string;
    technology_id: number;
    title: string;
    progress_points: string[];
    status: Status;
    tags: string[];
  }) => {
    if (editingEntry) {
      await updateEntry(editingEntry.id, payload);
    } else {
      await createEntry(payload);
    }
    await Promise.all([loadEntries(), loadTechnologies()]);
  };

  const handleDeleteEntryClick = (entry: ProgressEntry) => {
    setTargetDeleteEntry(entry);
    setTargetDeleteTech(null);
    setIsDeleteModalOpen(true);
  };

  // Tech Category CRUD Handlers
  const handleAddCategoryClick = () => {
    setEditingTech(null);
    setIsTechModalOpen(true);
  };

  const handleEditCategoryClick = (tech: Technology) => {
    setEditingTech(tech);
    setIsTechModalOpen(true);
  };

  const handleDeleteCategoryClick = (tech: Technology) => {
    setTargetDeleteTech(tech);
    setTargetDeleteEntry(null);
    setIsDeleteModalOpen(true);
  };

  const handleSaveCategory = async (name: string, color: string) => {
    if (editingTech) {
      await updateTechnology(editingTech.id, name, color);
    } else {
      await createTechnology(name, color);
    }
    await Promise.all([loadTechnologies(), loadEntries()]);
  };

  // Confirm Deletion
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (targetDeleteEntry) {
        await deleteEntry(targetDeleteEntry.id);
        await Promise.all([loadEntries(), loadTechnologies()]);
      } else if (targetDeleteTech) {
        await deleteTechnology(targetDeleteTech.id);
        if (selectedTechId === targetDeleteTech.id) {
          setSelectedTechId(null);
        }
        await loadTechnologies();
      }
      setIsDeleteModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Deletion failed');
    } finally {
      setIsDeleting(false);
    }
  };

  // Check if filters are active
  const hasActiveFilters = Boolean(
    searchQuery.trim() || selectedTechId !== null || selectedStatus !== null
  );

  // Handle Drag-and-Drop Reordering with optimistic UI & rollback on error
  const handleReorder = async (items: ReorderItem[], optimisticEntries: ProgressEntry[]) => {
    const previousEntries = entries;
    setEntries(optimisticEntries);

    try {
      await reorderEntries(items);
    } catch (err: any) {
      console.error('Failed to persist reorder:', err);
      // Revert optimistic state on failure
      setEntries(previousEntries);
      setToast({
        type: 'error',
        message: 'Failed to save card position. The change has been reverted.',
      });
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        technologies={technologies}
        selectedTechId={selectedTechId}
        onSelectTechnology={setSelectedTechId}
        onOpenNewTechModal={handleAddCategoryClick}
      />

      {/* Main Workspace Area */}
      <main className="workspace">
        <WorkspaceHeader
          activeView={activeView}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedTechId={selectedTechId}
          setSelectedTechId={setSelectedTechId}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          technologies={technologies}
          weekRangeText={weekRangeText}
          onPrevWeek={handlePrevWeek}
          onNextWeek={handleNextWeek}
          onJumpToToday={handleJumpToToday}
          onOpenLogToday={() => handleOpenLogToday()}
          onClearFilters={handleClearFilters}
        />

        {/* View Switcher */}
        {activeView === 'board' && (
          <DailyBoard
            days={weekDays}
            allEntries={entries}
            hasActiveFilters={hasActiveFilters}
            onReorder={handleReorder}
            onWarningMessage={(msg) => setToast({ type: 'warning', message: msg })}
            onAddEntryForDate={(dateStr) => handleOpenLogToday(dateStr)}
            onEditEntry={handleEditEntry}
            onDeleteEntry={handleDeleteEntryClick}
          />
        )}

        {activeView === 'entries' && (
          <AllEntriesView
            entries={entries}
            onEditEntry={handleEditEntry}
            onDeleteEntry={handleDeleteEntryClick}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            onOpenLogToday={() => handleOpenLogToday()}
          />
        )}

        {activeView === 'calendar' && (
          <CalendarView
            entries={entries}
            onAddEntryForDate={(dateStr) => handleOpenLogToday(dateStr)}
            onEditEntry={handleEditEntry}
            onDeleteEntry={handleDeleteEntryClick}
          />
        )}

        {activeView === 'insights' && <InsightsView />}

        {activeView === 'techstack' && (
          <TechStackView
            technologies={technologies}
            onAddCategory={handleAddCategoryClick}
            onEditCategory={handleEditCategoryClick}
            onDeleteCategory={handleDeleteCategoryClick}
          />
        )}

        {activeView === 'settings' && (
          <SettingsView
            onDataChanged={() => {
              loadTechnologies();
              loadEntries();
            }}
          />
        )}
      </main>

      {/* Entry Modal */}
      <EntryModal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        onSave={handleSaveEntry}
        technologies={technologies}
        initialEntry={editingEntry}
        defaultDate={defaultEntryDate}
        onAddNewTech={handleAddCategoryClick}
      />

      {/* Tech Modal */}
      <TechModal
        isOpen={isTechModalOpen}
        onClose={() => setIsTechModalOpen(false)}
        onSave={handleSaveCategory}
        initialTech={editingTech}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        targetEntry={targetDeleteEntry}
        targetTech={targetDeleteTech}
        isDeleting={isDeleting}
      />

      {/* Toast Alert Banner */}
      {toast && (
        <div className={`toast-banner toast-${toast.type}`}>
          <AlertCircle size={16} strokeWidth={2} style={{
            color: toast.type === 'error' ? '#ef4444' : toast.type === 'warning' ? '#f59e0b' : '#c4b5fd',
            flexShrink: 0,
          }} />
          <span style={{ flex: 1, lineHeight: 1.4 }}>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#a1a1aa',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
