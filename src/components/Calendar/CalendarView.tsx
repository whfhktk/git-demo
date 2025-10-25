import React from 'react';
import { useCalendarStore } from '@/store/calendar';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { DayView } from './DayView';
import { AgendaView } from './AgendaView';

export const CalendarView: React.FC = () => {
  const { viewType } = useCalendarStore();

  const renderView = () => {
    switch (viewType) {
      case 'month':
        return <MonthView />;
      case 'week':
        return <WeekView />;
      case 'day':
        return <DayView />;
      case 'agenda':
        return <AgendaView />;
      default:
        return <MonthView />;
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {renderView()}
    </div>
  );
};