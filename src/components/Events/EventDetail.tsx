import React from 'react';
import { CalendarEvent } from '@/types';
import { useCalendarStore } from '@/store/calendar';
import { formatDate, formatTime } from '@/utils/date';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Clock, MapPin, Users, Bell, Edit, Trash2 } from 'lucide-react';

interface EventDetailProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (event: CalendarEvent) => void;
}

export const EventDetail: React.FC<EventDetailProps> = ({
  event,
  isOpen,
  onClose,
  onEdit,
}) => {
  const { deleteEvent } = useCalendarStore();

  if (!event) return null;

  const handleDelete = () => {
    if (window.confirm('确定要删除这个日程吗？')) {
      deleteEvent(event.id);
      onClose();
    }
  };

  const handleEdit = () => {
    onEdit(event);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div
                className="w-4 h-4 rounded-full mt-1 flex-shrink-0"
                style={{ backgroundColor: event.color }}
              />
              <div className="flex-1">
                <DialogTitle className="text-xl font-semibold text-left">
                  {event.title}
                </DialogTitle>
                {event.description && (
                  <p className="text-gray-600 mt-2 text-left">
                    {event.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Time */}
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-gray-500" />
            <div>
              <div className="font-medium">
                {formatDate(event.startTime, 'yyyy年M月d日 EEEE')}
              </div>
              <div className="text-gray-600">
                {event.allDay
                  ? '全天'
                  : `${formatTime(event.startTime)} - ${formatTime(event.endTime)}`
                }
              </div>
            </div>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-gray-500" />
              <div>
                <div className="font-medium">地点</div>
                <div className="text-gray-600">{event.location}</div>
              </div>
            </div>
          )}

          {/* Attendees */}
          {event.attendees && event.attendees.length > 0 && (
            <div className="flex items-start space-x-3">
              <Users className="w-5 h-5 text-gray-500 mt-1" />
              <div>
                <div className="font-medium">参与者 ({event.attendees.length})</div>
                <div className="text-gray-600">
                  {event.attendees.join(', ')}
                </div>
              </div>
            </div>
          )}

          {/* Reminders */}
          {event.reminders && event.reminders.length > 0 && (
            <div className="flex items-start space-x-3">
              <Bell className="w-5 h-5 text-gray-500 mt-1" />
              <div>
                <div className="font-medium">提醒</div>
                <div className="text-gray-600">
                  {event.reminders.map((reminder) => (
                    <div key={reminder.id}>
                      {reminder.minutes === 0
                        ? '事件开始时'
                        : reminder.minutes < 60
                        ? `${reminder.minutes}分钟前`
                        : reminder.minutes < 1440
                        ? `${Math.floor(reminder.minutes / 60)}小时前`
                        : `${Math.floor(reminder.minutes / 1440)}天前`
                      }
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Created/Updated info */}
          <div className="text-xs text-gray-500 pt-4 border-t">
            创建时间：{formatDate(event.createdAt, 'yyyy-MM-dd HH:mm')}
            {event.updatedAt.getTime() !== event.createdAt.getTime() && (
              <>
                <br />
                更新时间：{formatDate(event.updatedAt, 'yyyy-MM-dd HH:mm')}
              </>
            )}
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="mr-auto"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            删除
          </Button>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              关闭
            </Button>
            <Button onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-2" />
              编辑
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};