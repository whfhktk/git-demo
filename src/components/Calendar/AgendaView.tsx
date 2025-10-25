import React from 'react';
import { useCalendarStore } from '@/store/calendar';
import { formatDate, formatTime } from '@/utils/date';
import { CalendarEvent } from '@/types';
// import { cn } from '@/utils/cn';
import { Clock, MapPin, Users } from 'lucide-react';

interface EventItemProps {
  event: CalendarEvent;
  onClick: () => void;
}

const EventItem: React.FC<EventItemProps> = ({ event, onClick }) => {
  return (
    <div
      className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-start space-x-3">
        <div
          className="w-4 h-4 rounded-full mt-1 flex-shrink-0"
          style={{ backgroundColor: event.color }}
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{event.title}</h3>
          
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>
                {event.allDay
                  ? '全天'
                  : `${formatTime(event.startTime)} - ${formatTime(event.endTime)}`
                }
              </span>
            </div>
            
            {event.location && (
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span className="truncate">{event.location}</span>
              </div>
            )}
            
            {event.attendees && event.attendees.length > 0 && (
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{event.attendees.length} 人</span>
              </div>
            )}
          </div>
          
          {event.description && (
            <p className="mt-2 text-sm text-gray-600 line-clamp-2">
              {event.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

interface DayGroupProps {
  date: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

const DayGroup: React.FC<DayGroupProps> = ({ date, events, onEventClick }) => {
  if (events.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3 sticky top-0 bg-gray-50 py-2 z-10">
        {formatDate(date, 'M月d日 EEEE')}
      </h3>
      <div className="space-y-3">
        {events.map((event) => (
          <EventItem
            key={event.id}
            event={event}
            onClick={() => onEventClick(event)}
          />
        ))}
      </div>
    </div>
  );
};

export const AgendaView: React.FC = () => {
  const { events, setSelectedEvent } = useCalendarStore();
  
  // Group events by date for the next 30 days
  const today = new Date();
  const endDate = new Date();
  endDate.setDate(today.getDate() + 30);
  
  const upcomingEvents = events
    .filter(event => event.startTime >= today && event.startTime <= endDate)
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  
  // Group events by date
  const eventsByDate = upcomingEvents.reduce((groups, event) => {
    const dateKey = formatDate(event.startTime, 'yyyy-MM-dd');
    if (!groups[dateKey]) {
      groups[dateKey] = {
        date: new Date(event.startTime.getFullYear(), event.startTime.getMonth(), event.startTime.getDate()),
        events: []
      };
    }
    groups[dateKey].events.push(event);
    return groups;
  }, {} as Record<string, { date: Date; events: CalendarEvent[] }>);

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  return (
    <div className="flex-1 bg-gray-50 p-6 overflow-auto">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">即将到来的日程</h2>
          <p className="text-gray-600 mt-1">接下来30天的日程安排</p>
        </div>
        
        {Object.keys(eventsByDate).length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">📅</div>
            <p className="text-gray-600">暂无即将到来的日程</p>
          </div>
        ) : (
          <div>
            {Object.values(eventsByDate).map(({ date, events }) => (
              <DayGroup
                key={date.toISOString()}
                date={date}
                events={events}
                onEventClick={handleEventClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};