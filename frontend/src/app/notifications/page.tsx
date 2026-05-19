'use client';

import { Bell, CheckCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import { Spinner, EmptyState, Button } from '@/components/ui';
import { useNotifications, useMarkNotificationRead } from '@/hooks';
import { notificationsApi } from '@/services/api';
import { formatRelative } from '@/utils';
import { cn } from '@/utils';
import type { Notification } from '@/types';
import { useQueryClient } from '@tanstack/react-query';

const NOTIF_ICONS: Record<string, string> = {
  booking_request:  '📩',
  booking_accepted: '✅',
  booking_rejected: '❌',
  ride_reminder:    '⏰',
  chat_message:     '💬',
  ride_cancelled:   '🚫',
  system:           '📢',
};

export default function NotificationsPage() {
  const { data, isLoading } = useNotifications();
  const { mutateAsync: markRead } = useMarkNotificationRead();
  const qc = useQueryClient();

  const markAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      qc.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to update notifications');
    }
  };

  const notifications: Notification[] = data?.data || [];
  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">Notifications</h1>
              {unread > 0 && (
                <p className="text-sm text-white/40 mt-0.5">{unread} unread</p>
              )}
            </div>
            {unread > 0 && (
              <button onClick={markAllRead}
                className="flex items-center gap-1.5 text-sm text-[#00C853] hover:text-[#00A846] transition-colors">
                <CheckCheck className="w-4 h-4" /> Mark all read
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20"><Spinner /></div>
          ) : notifications.length === 0 ? (
            <EmptyState
              icon={<Bell className="w-14 h-14" />}
              title="No notifications"
              description="You're all caught up! We'll let you know when something happens."
            />
          ) : (
            <div className="space-y-2">
              {notifications.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => !notif.isRead && markRead(notif.id)}
                  className={cn(
                    'w-full text-left flex items-start gap-4 p-4 rounded-2xl border transition-all',
                    notif.isRead
                      ? 'bg-transparent border-transparent hover:bg-white/[0.02]'
                      : 'bg-[#111111] border-white/[0.06] hover:border-[#00C853]/15'
                  )}
                >
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 text-lg">
                    {NOTIF_ICONS[notif.type] || '🔔'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn('text-sm font-medium leading-tight', notif.isRead ? 'text-white/60' : 'text-white')}>
                        {notif.title}
                      </p>
                      <span className="text-xs text-white/25 flex-shrink-0">
                        {formatRelative(notif.createdAt)}
                      </span>
                    </div>
                    <p className={cn('text-sm mt-0.5 leading-relaxed', notif.isRead ? 'text-white/30' : 'text-white/60')}>
                      {notif.message}
                    </p>
                  </div>

                  {/* Unread dot */}
                  {!notif.isRead && (
                    <div className="w-2 h-2 rounded-full bg-[#00C853] flex-shrink-0 mt-1.5" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
