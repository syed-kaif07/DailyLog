export type Status = 'Planned' | 'In Progress' | 'Completed';

export interface Technology {
  id: number;
  name: string;
  color: string;
  created_at: string;
  entry_count: number;
}

export interface ProgressEntry {
  id: number;
  date: string; // YYYY-MM-DD
  technology_id: number;
  technology_name: string;
  technology_color: string;
  title: string;
  progress_points: string[];
  status: Status;
  tags: string[];
  is_demo: boolean;
  order_index?: number;
  created_at: string;
  updated_at: string;
}

export interface Insights {
  total_entries: number;
  this_week_entries: number;
  unique_active_days: number;
  current_streak: number;
  completion_rate: number;
  by_status: {
    completed: number;
    in_progress: number;
    planned: number;
  };
  by_technology: {
    id: number;
    name: string;
    color: string;
    count: number;
    percentage: number;
  }[];
  recent_activity: {
    date: string;
    count: number;
  }[];
}

export type ActiveView = 'board' | 'entries' | 'calendar' | 'insights' | 'techstack' | 'settings';
