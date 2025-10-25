import React from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCalendarStore } from '@/store/calendar';
import { navigateDate, getDateTitle } from '@/utils/date';
import { ViewType } from '@/types';

const VIEW_LABELS: Record<ViewType, string> = {
  month: '月',
  week: '周',
  day: '日',
  agenda: '议程',
};

export const CalendarHeader: React.FC = () => {
  const {
    currentDate,
    viewType,
    setCurrentDate,
    setViewType,
    setIsCreating,
  } = useCalendarStore();

  const handlePrevious = () => {
    const newDate = navigateDate(currentDate, 'prev', viewType);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = navigateDate(currentDate, 'next', viewType);
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleCreateEvent = () => {
    setIsCreating(true);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b bg-white space-y-4 sm:space-y-0">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">日历</h1>
        <Button onClick={handleToday} variant="outline" size="sm">
          今天
        </Button>
      </div>

      <div className="flex items-center space-x-2 order-3 sm:order-2">
        <Button
          onClick={handlePrevious}
          variant="ghost"
          size="icon"
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <h2 className="text-base sm:text-lg font-semibold min-w-[160px] sm:min-w-[200px] text-center">
          {getDateTitle(currentDate, viewType)}
        </h2>
        
        <Button
          onClick={handleNext}
          variant="ghost"
          size="icon"
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center space-x-2 w-full sm:w-auto order-2 sm:order-3">
        <div className="flex rounded-lg border p-1 flex-1 sm:flex-none">
          {(Object.keys(VIEW_LABELS) as ViewType[]).map((view) => (
            <Button
              key={view}
              onClick={() => setViewType(view)}
              variant={viewType === view ? 'default' : 'ghost'}
              size="sm"
              className="px-2 sm:px-3 py-1 text-sm flex-1 sm:flex-none"
            >
              {VIEW_LABELS[view]}
            </Button>
          ))}
        </div>
        
        <Button onClick={handleCreateEvent} className="sm:ml-4">
          <Plus className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">新建日程</span>
        </Button>
      </div>
    </div>
  );
};