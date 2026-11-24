import React, { useState, useEffect } from 'react';
import { Bell, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Notification } from '../types';
import { NotificationModal } from './NotificationModal';

export const Navbar: React.FC<{ title?: string; subtitle?: string }> = ({
  title = 'Dashboard',
  subtitle = 'Welcome to CampusConnect Central Opportunity Hub',
}) => {
  const { user, unreadCount } = useAuth();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeUnread, setActiveUnread] = useState(unreadCount);

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications();
      if (data.success) {
        setNotifications(data.notifications);
        setActiveUnread(data.unreadCount);
      }
    } catch (e) {
      console.warn('Could not fetch notifications:', e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const timer = setInterval(fetchNotifications, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setActiveUnread(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {}
  };

  const handleDeleteNotif = async (id: string) => {
    try {
      await api.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (e) {}
  };

  return (
    <>
      <header className="h-18 px-8 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between sticky top-0 z-20">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight font-sans">{title}</h1>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Institutional Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-850 border border-slate-800 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-slate-200">Medi-Caps University</span>
            <span className="text-[10px] text-brand-400 font-mono">B.Tech Demo</span>
          </div>

          {/* Notifications Trigger */}
          <button
            onClick={() => {
              setIsNotifOpen(true);
              fetchNotifications();
            }}
            className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {activeUnread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-brand-500 text-[10px] font-bold text-white flex items-center justify-center animate-bounce shadow-md shadow-brand-500/50">
                {activeUnread}
              </span>
            )}
          </button>
        </div>
      </header>

      <NotificationModal
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllRead}
        onDelete={handleDeleteNotif}
      />
    </>
  );
};
