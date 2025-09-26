export interface Habit {
  id: string;
  habit_name: string;
  habit_category: string | null;
  user_name: string;
  target_frequency: string | null;
  date_tracked: string;
  completed: boolean;
  streak_count: number;
  notes: string | null;
  company_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateHabitRequest {
  habit_name: string;
  habit_category?: string;
  user_name: string;
  target_frequency?: string;
  date_tracked: string;
  completed?: boolean;
  streak_count?: number;
  notes?: string;
  company_id: string;
}

export interface UpdateHabitRequest {
  habit_name?: string;
  habit_category?: string;
  user_name?: string;
  target_frequency?: string;
  date_tracked?: string;
  completed?: boolean;
  streak_count?: number;
  notes?: string;
}

export interface HabitStats {
  total: number;
  completed: number;
  completionRate: number;
  activeStreaks: number;
  byCategory: Record<string, number>;
  byUser: Record<string, number>;
}

export interface HabitFormData {
  habit_name: string;
  habit_category: string;
  user_name: string;
  target_frequency: string;
  date_tracked: string;
  completed: boolean;
  notes: string;
}

export interface HabitCategory {
  value: string;
  label: string;
}

export interface HabitFrequency {
  value: string;
  label: string;
}

// Constants
export const HABIT_CATEGORIES: HabitCategory[] = [
  { value: 'health', label: 'Health & Fitness' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'learning', label: 'Learning & Development' },
  { value: 'business', label: 'Business' },
  { value: 'personal', label: 'Personal Development' },
  { value: 'finance', label: 'Finance' },
  { value: 'relationships', label: 'Relationships' },
  { value: 'creativity', label: 'Creativity' }
];

export const HABIT_FREQUENCIES: HabitFrequency[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'custom', label: 'Custom' }
];

// Helper functions
export const calculateHabitStats = (habits: Habit[]): HabitStats => {
  const total = habits.length;
  const completed = habits.filter(h => h.completed).length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const activeStreaks = habits.filter(h => h.streak_count > 0).length;

  const byCategory = habits.reduce((acc, habit) => {
    const category = habit.habit_category || 'uncategorized';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byUser = habits.reduce((acc, habit) => {
    acc[habit.user_name] = (acc[habit.user_name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return { total, completed, completionRate, activeStreaks, byCategory, byUser };
};

export const groupHabitsByUser = (habits: Habit[]): Record<string, Habit[]> => {
  return habits.reduce((acc, habit) => {
    const user = habit.user_name;
    if (!acc[user]) acc[user] = [];
    acc[user].push(habit);
    return acc;
  }, {} as Record<string, Habit[]>);
};