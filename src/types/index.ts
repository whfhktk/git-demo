export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  allDay: boolean;
  color: string;
  location?: string;
  attendees?: string[];
  reminders?: Reminder[];
  recurrence?: RecurrenceRule;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reminder {
  id: string;
  minutes: number; // Minutes before event
  method: 'popup' | 'email' | 'notification';
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: Date;
  count?: number;
  daysOfWeek?: number[]; // 0-6, Sunday is 0
}

export type ViewType = 'month' | 'week' | 'day' | 'agenda';

export interface CalendarState {
  currentDate: Date;
  viewType: ViewType;
  events: CalendarEvent[];
  selectedEvent?: CalendarEvent;
  isCreating: boolean;
  isEditing: boolean;
}

export interface EventFormData {
  title: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  allDay: boolean;
  color: string;
  location: string;
  attendees: string;
  reminders: Reminder[];
}

export const EVENT_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#f97316', // orange
  '#84cc16', // lime
  '#ec4899', // pink
  '#6b7280', // gray
] as const;