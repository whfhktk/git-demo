import { useEffect, useCallback } from 'react';
import { useCalendarStore } from '@/store/calendar';
import { CalendarEvent } from '@/types';

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
}

export const useNotifications = () => {
  const { events } = useCalendarStore();

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }, []);

  // Show notification
  const showNotification = useCallback((options: NotificationOptions) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        tag: options.tag,
        requireInteraction: true,
      });

      // Auto close after 10 seconds
      setTimeout(() => {
        notification.close();
      }, 10000);

      return notification;
    }
    return null;
  }, []);

  // Check for upcoming events and show reminders
  const checkReminders = useCallback(() => {
    const now = new Date();
    
    events.forEach((event: CalendarEvent) => {
      if (!event.reminders) return;

      event.reminders.forEach((reminder) => {
        const reminderTime = new Date(event.startTime.getTime() - reminder.minutes * 60 * 1000);
        const timeDiff = reminderTime.getTime() - now.getTime();
        
        // Show reminder if it's within 1 minute of the reminder time
        if (timeDiff > 0 && timeDiff <= 60000) {
          // const timeUntilEvent = Math.floor((event.startTime.getTime() - now.getTime()) / 60000);
          
          let reminderText = '';
          if (reminder.minutes === 0) {
            reminderText = '现在开始';
          } else if (reminder.minutes < 60) {
            reminderText = `${reminder.minutes}分钟后开始`;
          } else if (reminder.minutes < 1440) {
            reminderText = `${Math.floor(reminder.minutes / 60)}小时后开始`;
          } else {
            reminderText = `${Math.floor(reminder.minutes / 1440)}天后开始`;
          }

          showNotification({
            title: `日程提醒: ${event.title}`,
            body: `${reminderText}${event.location ? ` · ${event.location}` : ''}`,
            tag: `event-${event.id}-${reminder.id}`,
          });
        }
      });
    });
  }, [events, showNotification]);

  // Set up periodic reminder checking
  useEffect(() => {
    // Request permission on first load
    requestPermission();

    // Check reminders every minute
    const interval = setInterval(checkReminders, 60000);
    
    // Initial check
    checkReminders();

    return () => clearInterval(interval);
  }, [checkReminders, requestPermission]);

  return {
    requestPermission,
    showNotification,
    checkReminders,
  };
};