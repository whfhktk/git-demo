import { create } from 'zustand';
import { CalendarEvent, CalendarState, ViewType } from '@/types';
import { startOfDay, endOfDay } from 'date-fns';

interface CalendarStore extends CalendarState {
  setCurrentDate: (date: Date) => void;
  setViewType: (viewType: ViewType) => void;
  addEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEvent: (id: string, event: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  setSelectedEvent: (event?: CalendarEvent) => void;
  setIsCreating: (isCreating: boolean) => void;
  setIsEditing: (isEditing: boolean) => void;
  getEventsForDate: (date: Date) => CalendarEvent[];
  getEventsForDateRange: (startDate: Date, endDate: Date) => CalendarEvent[];
}

// Sample events for demonstration
const sampleEvents: CalendarEvent[] = [
  {
    id: '1',
    title: '团队会议',
    description: '讨论项目进展和下周计划',
    startTime: new Date(2024, 9, 25, 10, 0), // Oct 25, 2024 10:00 AM
    endTime: new Date(2024, 9, 25, 11, 30),   // Oct 25, 2024 11:30 AM
    allDay: false,
    color: '#3b82f6',
    location: '会议室A',
    attendees: ['张三', '李四', '王五'],
    reminders: [{ id: 'r1', minutes: 15, method: 'popup' }],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: '产品评审',
    description: '新功能设计评审',
    startTime: new Date(2024, 9, 26, 14, 0),
    endTime: new Date(2024, 9, 26, 16, 0),
    allDay: false,
    color: '#10b981',
    location: '在线会议',
    reminders: [{ id: 'r2', minutes: 30, method: 'notification' }],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    title: '年度体检',
    description: '',
    startTime: startOfDay(new Date(2024, 9, 28)),
    endTime: endOfDay(new Date(2024, 9, 28)),
    allDay: true,
    color: '#ef4444',
    location: '医院',
    reminders: [{ id: 'r3', minutes: 1440, method: 'email' }], // 1 day before
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  currentDate: new Date(),
  viewType: 'month',
  events: sampleEvents,
  selectedEvent: undefined,
  isCreating: false,
  isEditing: false,

  setCurrentDate: (date: Date) => set({ currentDate: date }),
  
  setViewType: (viewType: ViewType) => set({ viewType }),
  
  addEvent: (eventData) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({ events: [...state.events, newEvent] }));
  },
  
  updateEvent: (id: string, eventData: Partial<CalendarEvent>) => {
    set((state) => ({
      events: state.events.map((event) =>
        event.id === id
          ? { ...event, ...eventData, updatedAt: new Date() }
          : event
      ),
    }));
  },
  
  deleteEvent: (id: string) => {
    set((state) => ({
      events: state.events.filter((event) => event.id !== id),
      selectedEvent: state.selectedEvent?.id === id ? undefined : state.selectedEvent,
    }));
  },
  
  setSelectedEvent: (event?: CalendarEvent) => set({ selectedEvent: event }),
  
  setIsCreating: (isCreating: boolean) => set({ isCreating }),
  
  setIsEditing: (isEditing: boolean) => set({ isEditing }),
  
  getEventsForDate: (date: Date) => {
    const events = get().events;
    return events.filter((event) => {
      const eventStart = startOfDay(event.startTime);
      const eventEnd = startOfDay(event.endTime);
      const targetDate = startOfDay(date);
      
      return targetDate >= eventStart && targetDate <= eventEnd;
    });
  },
  
  getEventsForDateRange: (startDate: Date, endDate: Date) => {
    const events = get().events;
    return events.filter((event) => {
      return (
        event.startTime <= endDate && event.endTime >= startDate
      );
    });
  },
}));