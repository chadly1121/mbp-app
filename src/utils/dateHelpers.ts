import { format, parseISO, isValid } from 'date-fns';

// Centralized date utilities to replace scattered date handling

export const getCurrentDateString = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};

export const getCurrentISOString = (): string => {
  return new Date().toISOString();
};

export const formatDateForDisplay = (dateString: string | null | undefined): string => {
  if (!dateString) return 'No date';
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return 'Invalid date';
    return format(date, 'MMM dd, yyyy');
  } catch {
    return 'Invalid date';
  }
};

export const formatDateForInput = (dateString: string | null | undefined): string => {
  if (!dateString) return getCurrentDateString();
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return getCurrentDateString();
    return format(date, 'yyyy-MM-dd');
  } catch {
    return getCurrentDateString();
  }
};

export const isDateOverdue = (dueDateString: string | null | undefined): boolean => {
  if (!dueDateString) return false;
  
  try {
    const dueDate = parseISO(dueDateString);
    if (!isValid(dueDate)) return false;
    return dueDate < new Date();
  } catch {
    return false;
  }
};