import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addDays,
  subDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  isToday,
  parseISO,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';

export const formatDate = (date: Date, formatStr: string) => {
  return format(date, formatStr, { locale: zhCN });
};

export const getMonthDays = (date: Date) => {
  const start = startOfWeek(startOfMonth(date), { weekStartsOn: 1 }); // Monday as first day
  const end = endOfWeek(endOfMonth(date), { weekStartsOn: 1 });
  
  return eachDayOfInterval({ start, end });
};

export const getWeekDays = (date: Date) => {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  
  return eachDayOfInterval({ start, end });
};

export const navigateDate = (date: Date, direction: 'prev' | 'next', viewType: 'month' | 'week' | 'day' | 'agenda') => {
  switch (viewType) {
    case 'month':
      return direction === 'next' ? addMonths(date, 1) : subMonths(date, 1);
    case 'week':
      return direction === 'next' ? addWeeks(date, 1) : subWeeks(date, 1);
    case 'day':
      return direction === 'next' ? addDays(date, 1) : subDays(date, 1);
    case 'agenda':
      return date; // Agenda view doesn't navigate by date
    default:
      return date;
  }
};

export const getDateTitle = (date: Date, viewType: 'month' | 'week' | 'day' | 'agenda') => {
  switch (viewType) {
    case 'month':
      return formatDate(date, 'yyyy年M月');
    case 'week':
      const weekStart = startOfWeek(date, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
      return `${formatDate(weekStart, 'M月d日')} - ${formatDate(weekEnd, 'M月d日')}`;
    case 'day':
      return formatDate(date, 'yyyy年M月d日 EEEE');
    case 'agenda':
      return '议程视图';
    default:
      return '';
  }
};

export const isCurrentMonth = (date: Date, currentDate: Date) => {
  return isSameMonth(date, currentDate);
};

export const isCurrentDay = (date: Date, currentDate: Date) => {
  return isSameDay(date, currentDate);
};

export const isTodayDate = (date: Date) => {
  return isToday(date);
};

export const formatTime = (date: Date) => {
  return format(date, 'HH:mm');
};

export const formatDateTime = (date: Date) => {
  return format(date, 'yyyy-MM-dd HH:mm');
};

export const parseDateTime = (dateStr: string, timeStr: string) => {
  return parseISO(`${dateStr}T${timeStr}`);
};

export const formatDateForInput = (date: Date) => {
  return format(date, 'yyyy-MM-dd');
};

export const formatTimeForInput = (date: Date) => {
  return format(date, 'HH:mm');
};

export const createDateFromInputs = (dateStr: string, timeStr: string) => {
  return new Date(`${dateStr}T${timeStr}`);
};

export const getTimeSlots = (startHour = 0, endHour = 24, interval = 30) => {
  const slots = [];
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const time = new Date();
      time.setHours(hour, minute, 0, 0);
      slots.push(time);
    }
  }
  return slots;
};