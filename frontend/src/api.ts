import { Technology, ProgressEntry, Insights, Status } from './types';

const API_BASE = '/api';

export async function getTechnologies(): Promise<Technology[]> {
  const res = await fetch(`${API_BASE}/technologies`);
  if (!res.ok) throw new Error('Failed to fetch technologies');
  return res.json();
}

export async function createTechnology(name: string, color: string): Promise<Technology> {
  const res = await fetch(`${API_BASE}/technologies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, color }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to create technology' }));
    throw new Error(err.detail || 'Failed to create technology');
  }
  return res.json();
}

export async function updateTechnology(id: number, name?: string, color?: string): Promise<Technology> {
  const res = await fetch(`${API_BASE}/technologies/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, color }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to update technology' }));
    throw new Error(err.detail || 'Failed to update technology');
  }
  return res.json();
}

export async function deleteTechnology(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/technologies/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to delete technology' }));
    throw new Error(err.detail || 'Failed to delete technology');
  }
}

export interface EntryFilters {
  technology_id?: number | null;
  status?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  search?: string | null;
  sort_order?: 'asc' | 'desc';
}

export async function getEntries(filters: EntryFilters = {}): Promise<ProgressEntry[]> {
  const params = new URLSearchParams();
  if (filters.technology_id) params.append('technology_id', String(filters.technology_id));
  if (filters.status) params.append('status', filters.status);
  if (filters.start_date) params.append('start_date', filters.start_date);
  if (filters.end_date) params.append('end_date', filters.end_date);
  if (filters.search) params.append('search', filters.search);
  if (filters.sort_order) params.append('sort_order', filters.sort_order);

  const res = await fetch(`${API_BASE}/entries?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch entries');
  return res.json();
}

export interface CreateEntryPayload {
  date: string;
  technology_id: number;
  title: string;
  progress_points: string[];
  status: Status;
  tags?: string[];
}

export async function createEntry(payload: CreateEntryPayload): Promise<ProgressEntry> {
  const res = await fetch(`${API_BASE}/entries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to create entry' }));
    throw new Error(err.detail || 'Failed to create entry');
  }
  return res.json();
}

export async function updateEntry(id: number, payload: Partial<CreateEntryPayload>): Promise<ProgressEntry> {
  const res = await fetch(`${API_BASE}/entries/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to update entry' }));
    throw new Error(err.detail || 'Failed to update entry');
  }
  return res.json();
}

export async function deleteEntry(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/entries/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to delete entry' }));
    throw new Error(err.detail || 'Failed to delete entry');
  }
}

export async function getInsights(): Promise<Insights> {
  const res = await fetch(`${API_BASE}/insights`);
  if (!res.ok) throw new Error('Failed to fetch insights');
  return res.json();
}

export async function seedDemoData(force = false): Promise<{ message: string; count: number }> {
  const res = await fetch(`${API_BASE}/demo/seed?force=${force}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to seed demo data');
  return res.json();
}

export async function clearDemoData(): Promise<{ message: string; deleted: number }> {
  const res = await fetch(`${API_BASE}/demo/clear`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to clear demo data');
  return res.json();
}

export async function exportData(): Promise<any> {
  const res = await fetch(`${API_BASE}/export`);
  if (!res.ok) throw new Error('Failed to export data');
  return res.json();
}

export async function importData(payload: any): Promise<{ imported_entries: number }> {
  const res = await fetch(`${API_BASE}/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to import data' }));
    throw new Error(err.detail || 'Failed to import data');
  }
  return res.json();
}

export interface ReorderItem {
  id: number;
  date: string;
  order_index: number;
}

export async function reorderEntries(items: ReorderItem[]): Promise<{ updated_count: number }> {
  const res = await fetch(`${API_BASE}/entries/reorder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to reorder entries' }));
    throw new Error(err.detail || 'Failed to reorder entries');
  }
  return res.json();
}

