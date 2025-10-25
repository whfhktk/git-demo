import React from 'react';
import { useCalendarStore } from '@/store/calendar';
import { formatDate, getTimeSlots } from '@/utils/date';
import { CalendarEvent } from '@/types';
import { cn } from '@/utils/cn';

interface TimeSlotProps {
  time: Date;
  events: CalendarEvent[];
}

const TimeSlot: React.FC<TimeSlotProps> = ({ time, events }) => {
  return (
    <div className="border-b border-gray-100 h-16 relative hover:bg-gray-50 cursor-pointer">
      <div className="absolute left-0 top-0 w-20 text-sm text-gray-500 p-3">
        {formatDate(time, 'HH:mm')}
      </div>
      <div className="ml-20 h-full relative p-2">
        {events.map((event, index) => (
          <div
            key={event.id}
            className={cn(
              'absolute left-2 right-2 p-2 rounded text-sm text-white font-medium cursor-pointer hover:opacity-80 shadow-sm',
              'flex items-center justify-between'
            )}
            style={{ 
              backgroundColor: event.color,
              top: `${index * 4}px`,
              zIndex: events.length - index
            }}
          >
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{event.title}</div>
              {event.location && (
                <div className="text-xs opacity-90 truncate">{event.location}</div>
              )}
            </div>
            <div className="text-xs opacity-90 ml-2">
              {!event.allDay && `${formatDate(event.startTime, 'HH:mm')} - ${formatDate(event.endTime, 'HH:mm')}`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const DayView: React.FC = () => {
  const { currentDate, getEventsForDateRange } = useCalendarStore();
  const timeSlots = getTimeSlots(0, 24, 60); // Full day, 1-hour intervals

  // Get all-day events for the current date
  const dayStart = new Date(currentDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(currentDate);
  dayEnd.setHours(23, 59, 59, 999);
  
  const allDayEvents = getEventsForDateRange(dayStart, dayEnd).filter(event => event.allDay);

  return (
    <div className="flex-1 bg-white overflow-auto">
      {/* Day header */}
      <div className="sticky top-0 bg-white border-b z-10 p-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {formatDate(currentDate, 'yyyy年M月d日 EEEE')}
        </h2>
        
        {/* All-day events */}
        {allDayEvents.length > 0 && (
          <div className="mt-4">
            <div className="text-sm font-medium text-gray-600 mb-2">全天事件</div>
            <div className="space-y-2">
              {allDayEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-3 rounded-lg text-white font-medium cursor-pointer hover:opacity-80 shadow-sm"
                  style={{ backgroundColor: event.color }}
                >
                  <div className="flex items-center justify-between">
                    <span>{event.title}</span>
                    {event.location && (
                      <span className="text-sm opacity-90">{event.location}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Time slots */}
      <div className="relative">
        {timeSlots.map((time) => {
          const slotStart = new Date(currentDate);
          slotStart.setHours(time.getHours(), time.getMinutes(), 0, 0);
          const slotEnd = new Date(slotStart);
          slotEnd.setHours(slotStart.getHours() + 1);
          
          const events = getEventsForDateRange(slotStart, slotEnd).filter(event => !event.allDay);
          
          return (
            <TimeSlot
              key={time.toISOString()}
              time={time}
              events={events}
            />
          );
        })}
      </div>
    </div>
  );
};