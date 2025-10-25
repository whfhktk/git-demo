import React from 'react';
import { useCalendarStore } from '@/store/calendar';
import { getWeekDays, formatDate, isCurrentDay, isTodayDate, getTimeSlots } from '@/utils/date';
import { CalendarEvent } from '@/types';
import { cn } from '@/utils/cn';

interface TimeSlotProps {
  time: Date;
  events: CalendarEvent[];
}

const TimeSlot: React.FC<TimeSlotProps> = ({ time, events }) => {
  return (
    <div className="border-b border-gray-100 h-12 relative">
      <div className="absolute left-0 top-0 w-16 text-xs text-gray-500 p-2">
        {formatDate(time, 'HH:mm')}
      </div>
      <div className="ml-16 h-full relative">
        {events.map((event) => (
          <div
            key={event.id}
            className="absolute left-0 right-0 mx-1 p-1 rounded text-xs text-white font-medium cursor-pointer hover:opacity-80"
            style={{ backgroundColor: event.color }}
          >
            {event.title}
          </div>
        ))}
      </div>
    </div>
  );
};

export const WeekView: React.FC = () => {
  const { currentDate, getEventsForDateRange } = useCalendarStore();
  const weekDays = getWeekDays(currentDate);
  const timeSlots = getTimeSlots(6, 22, 60); // 6 AM to 10 PM, 1-hour intervals

  return (
    <div className="flex-1 bg-white overflow-auto">
      {/* Week header */}
      <div className="sticky top-0 bg-white border-b z-10">
        <div className="grid grid-cols-8">
          <div className="w-16"></div>
          {weekDays.map((day) => {
            const isToday = isTodayDate(day);
            const isSelected = isCurrentDay(day, currentDate);
            
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  'p-4 text-center border-r',
                  isSelected && 'bg-blue-50'
                )}
              >
                <div className="text-sm text-gray-600">
                  {formatDate(day, 'EEE')}
                </div>
                <div
                  className={cn(
                    'text-lg font-semibold mt-1',
                    isToday && 'text-blue-600'
                  )}
                >
                  {formatDate(day, 'd')}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Time slots */}
      <div className="grid grid-cols-8">
        <div className="w-16">
          {timeSlots.map((time) => (
            <div key={time.toISOString()} className="h-12 border-b border-gray-100">
              <div className="text-xs text-gray-500 p-2">
                {formatDate(time, 'HH:mm')}
              </div>
            </div>
          ))}
        </div>
        
        {weekDays.map((day) => (
          <div key={day.toISOString()} className="border-r">
            {timeSlots.map((time) => {
              const slotStart = new Date(day);
              slotStart.setHours(time.getHours(), time.getMinutes(), 0, 0);
              const slotEnd = new Date(slotStart);
              slotEnd.setHours(slotStart.getHours() + 1);
              
              const events = getEventsForDateRange(slotStart, slotEnd);
              
              return (
                <TimeSlot
                  key={`${day.toISOString()}-${time.toISOString()}`}
                  time={time}
                  events={events}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};