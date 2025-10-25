import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { CalendarEvent, EventFormData, EVENT_COLORS } from '@/types';
import { useCalendarStore } from '@/store/calendar';
import { formatDateForInput, formatTimeForInput, createDateFromInputs } from '@/utils/date';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { MapPin, Users, Bell, Trash2 } from 'lucide-react';

interface EventFormProps {
  event?: CalendarEvent;
  isOpen: boolean;
  onClose: () => void;
}

const REMINDER_OPTIONS = [
  { value: 0, label: '事件开始时' },
  { value: 5, label: '5分钟前' },
  { value: 15, label: '15分钟前' },
  { value: 30, label: '30分钟前' },
  { value: 60, label: '1小时前' },
  { value: 1440, label: '1天前' },
];

export const EventForm: React.FC<EventFormProps> = ({ event, isOpen, onClose }) => {
  const { addEvent, updateEvent, deleteEvent } = useCalendarStore();
  const [allDay, setAllDay] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>(EVENT_COLORS[0]);
  const [reminders, setReminders] = useState<number[]>([15]); // Default 15 minutes

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EventFormData>();

  const isEditing = !!event;

  useEffect(() => {
    if (event) {
      // Populate form with event data
      setValue('title', event.title);
      setValue('description', event.description || '');
      setValue('startDate', formatDateForInput(event.startTime));
      setValue('startTime', formatTimeForInput(event.startTime));
      setValue('endDate', formatDateForInput(event.endTime));
      setValue('endTime', formatTimeForInput(event.endTime));
      setValue('location', event.location || '');
      setValue('attendees', event.attendees?.join(', ') || '');
      setAllDay(event.allDay);
      setSelectedColor(event.color);
      setReminders(event.reminders?.map(r => r.minutes) || [15]);
    } else {
      // Reset form for new event
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      
      reset();
      setValue('startDate', formatDateForInput(now));
      setValue('startTime', formatTimeForInput(now));
      setValue('endDate', formatDateForInput(oneHourLater));
      setValue('endTime', formatTimeForInput(oneHourLater));
      setAllDay(false);
      setSelectedColor(EVENT_COLORS[0]);
      setReminders([15]);
    }
  }, [event, setValue, reset]);

  const onSubmit = (data: EventFormData) => {
    try {
      const startTime = allDay 
        ? new Date(data.startDate + 'T00:00:00')
        : createDateFromInputs(data.startDate, data.startTime);
      
      const endTime = allDay
        ? new Date(data.endDate + 'T23:59:59')
        : createDateFromInputs(data.endDate, data.endTime);

      const eventData = {
        title: data.title,
        description: data.description,
        startTime,
        endTime,
        allDay,
        color: selectedColor,
        location: data.location,
        attendees: data.attendees ? data.attendees.split(',').map(a => a.trim()).filter(Boolean) : [],
        reminders: reminders.map(minutes => ({
          id: Date.now().toString() + Math.random(),
          minutes,
          method: 'popup' as const,
        })),
      };

      if (isEditing && event) {
        updateEvent(event.id, eventData);
      } else {
        addEvent(eventData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleDelete = () => {
    if (event && window.confirm('确定要删除这个日程吗？')) {
      deleteEvent(event.id);
      onClose();
    }
  };

  const handleReminderToggle = (minutes: number) => {
    setReminders(prev => 
      prev.includes(minutes)
        ? prev.filter(m => m !== minutes)
        : [...prev, minutes]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? '编辑日程' : '新建日程'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">标题 *</Label>
            <Input
              id="title"
              {...register('title', { required: '请输入日程标题' })}
              placeholder="请输入日程标题"
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="请输入日程描述"
              rows={3}
            />
          </div>

          {/* All Day Toggle */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="allDay"
              checked={allDay}
              onCheckedChange={(checked) => setAllDay(checked === true)}
            />
            <Label htmlFor="allDay">全天事件</Label>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>开始时间</Label>
              <div className="space-y-2">
                <Input
                  type="date"
                  {...register('startDate', { required: '请选择开始日期' })}
                />
                {!allDay && (
                  <Input
                    type="time"
                    {...register('startTime', { required: !allDay ? '请选择开始时间' : false })}
                  />
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>结束时间</Label>
              <div className="space-y-2">
                <Input
                  type="date"
                  {...register('endDate', { required: '请选择结束日期' })}
                />
                {!allDay && (
                  <Input
                    type="time"
                    {...register('endTime', { required: !allDay ? '请选择结束时间' : false })}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">
              <MapPin className="w-4 h-4 inline mr-1" />
              地点
            </Label>
            <Input
              id="location"
              {...register('location')}
              placeholder="请输入地点"
            />
          </div>

          {/* Attendees */}
          <div className="space-y-2">
            <Label htmlFor="attendees">
              <Users className="w-4 h-4 inline mr-1" />
              参与者
            </Label>
            <Input
              id="attendees"
              {...register('attendees')}
              placeholder="请输入参与者，用逗号分隔"
            />
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label>颜色</Label>
            <div className="flex space-x-2">
              {EVENT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 ${
                    selectedColor === color ? 'border-gray-800' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>

          {/* Reminders */}
          <div className="space-y-2">
            <Label>
              <Bell className="w-4 h-4 inline mr-1" />
              提醒
            </Label>
            <div className="space-y-2">
              {REMINDER_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`reminder-${option.value}`}
                    checked={reminders.includes(option.value)}
                    onCheckedChange={() => handleReminderToggle(option.value)}
                  />
                  <Label htmlFor={`reminder-${option.value}`} className="text-sm">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0">
            <div>
              {isEditing && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  删除
                </Button>
              )}
            </div>
            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 sm:flex-none">
                取消
              </Button>
              <Button type="submit" className="flex-1 sm:flex-none">
                {isEditing ? '保存' : '创建'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};