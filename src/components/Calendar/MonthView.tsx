import React from 'react';
import { useCalendarStore } from '@/store/calendar';
import { getMonthDays, formatDate, isCurrentMonth, isCurrentDay, isTodayDate } from '@/utils/date';
import { CalendarEvent } from '@/types';
import { cn } from '@/utils/cn';

const WEEKDAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

interface DayCellProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  events: CalendarEvent[];
  onClick: () => void;
}

const DayCell: React.FC<DayCellProps> = ({
  date,
  isCurrentMonth,
  isToday,
  isSelected,
  events,
  onClick,
}) => {
  return (
    <div
      className={cn(
        'min-h-[80px] sm:min-h-[120px] p-1 sm:p-2 border-r border-b cursor-pointer hover:bg-gray-50 transition-colors',
        !isCurrentMonth && 'bg-gray-50 text-gray-400',
        isSelected && 'bg-blue-50'
      )}
      onClick={onClick}
    >
      <div
        className={cn(
          'flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 text-xs sm:text-sm font-medium rounded-full mb-1 sm:mb-2',
          isToday && 'bg-blue-600 text-white',
          !isToday && isCurrentMonth && 'text-gray-900',
          !isToday && !isCurrentMonth && 'text-gray-400'
        )}
      >
        {formatDate(date, 'd')}
      </div>
      
      <div className="space-y-1">
        {events.slice(0, window.innerWidth < 640 ? 2 : 3).map((event) => (
          <div
            key={event.id}
            className={cn(
              'text-xs p-1 rounded truncate text-white font-medium',
              'cursor-pointer hover:opacity-80'
            )}
            style={{ backgroundColor: event.color }}
            onClick={(e) => {
              e.stopPropagation();
              // Handle event click
            }}
          >
            <span className="hidden sm:inline">
              {event.allDay ? event.title : `${formatDate(event.startTime, 'HH:mm')} ${event.title}`}
            </span>
            <span className="sm:hidden">
              {event.title.length > 8 ? event.title.substring(0, 8) + '...' : event.title}
            </span>
          </div>
        ))}
        {events.length > (window.innerWidth < 640 ? 2 : 3) && (
          <div className="text-xs text-gray-500 font-medium">
            +{events.length - (window.innerWidth < 640 ? 2 : 3)} 更多
          </div>
        )}
      </div>
    </div>
  );
};

export const MonthView: React.FC = () => {
  const { currentDate, getEventsForDate, setCurrentDate } = useCalendarStore();
  const monthDays = getMonthDays(currentDate);

  const handleDayClick = (date: Date) => {
    setCurrentDate(date);
  };

  return (
    <div className="flex-1 bg-white">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b">
        {WEEKDAYS.map((day, index) => (
          <div
            key={day}
            className="p-2 sm:p-4 text-xs sm:text-sm font-medium text-gray-700 text-center border-r last:border-r-0"
          >
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{['一', '二', '三', '四', '五', '六', '日'][index]}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {monthDays.map((date) => {
          const events = getEventsForDate(date);
          const isCurrentMonthDay = isCurrentMonth(date, currentDate);
          const isToday = isTodayDate(date);
          const isSelected = isCurrentDay(date, currentDate);

          return (
            <DayCell
              key={date.toISOString()}
              date={date}
              isCurrentMonth={isCurrentMonthDay}
              isToday={isToday}
              isSelected={isSelected}
              events={events}
              onClick={() => handleDayClick(date)}
            />
          );
        })}
      </div>
    </div>
  );
};