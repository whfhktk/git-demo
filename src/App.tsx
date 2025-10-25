import { useState } from 'react';
import { useCalendarStore } from './store/calendar';
import { CalendarHeader } from './components/Calendar/CalendarHeader';
import { CalendarView } from './components/Calendar/CalendarView';
import { EventForm } from './components/Events/EventForm';
import { EventDetail } from './components/Events/EventDetail';
import { useNotifications } from './hooks/useNotifications';
import { CalendarEvent } from './types';

function App() {
  const { 
    isCreating, 
    isEditing, 
    selectedEvent, 
    setIsCreating, 
    setIsEditing, 
    setSelectedEvent 
  } = useCalendarStore();
  
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>();
  const [showEventDetail, setShowEventDetail] = useState(false);

  // Initialize notifications
  useNotifications();

  const handleCloseEventForm = () => {
    setIsCreating(false);
    setIsEditing(false);
    setEditingEvent(undefined);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setIsEditing(true);
    setShowEventDetail(false);
  };


  const handleCloseEventDetail = () => {
    setShowEventDetail(false);
    setSelectedEvent(undefined);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <CalendarHeader />
      <CalendarView />
      
      {/* Event Form Dialog */}
      <EventForm
        event={editingEvent}
        isOpen={isCreating || isEditing}
        onClose={handleCloseEventForm}
      />
      
      {/* Event Detail Dialog */}
      <EventDetail
        event={selectedEvent || null}
        isOpen={showEventDetail}
        onClose={handleCloseEventDetail}
        onEdit={handleEditEvent}
      />
    </div>
  );
}

export default App;