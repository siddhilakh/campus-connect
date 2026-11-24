import React from 'react';
import { X, CheckCheck, Trash2, Bell, ExternalLink } from 'lucide-react';
import { Notification } from '../types';
import { Link } from 'react-router-dom';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAllRead: () => void;
  onDelete: (id: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onDelete,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[85vh] mt-14 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-brand-400" />
            <h3 className="font-bold text-white text-base">In-App Notifications</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-semibold">
              {notifications.filter((n) => !n.isRead).length} new
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllRead}
              title="Mark all as read"
              className="p-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg flex items-center gap-1 transition-colors"
            >
              <CheckCheck className="w-4 h-4 text-emerald-400" />
              <span>Mark all read</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="p-3 overflow-y-auto space-y-2 flex-1 divide-y divide-slate-800/40">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Bell className="w-10 h-10 mx-auto text-slate-600 mb-2 opacity-50" />
              <p className="text-sm font-medium">No notifications right now.</p>
              <p className="text-xs text-slate-400">You're all caught up with campus updates!</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`pt-2.5 pb-2 px-3 rounded-xl transition-colors flex items-start justify-between gap-3 ${
                  n.isRead ? 'bg-slate-850/40' : 'bg-brand-500/10 border border-brand-500/20'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-200">{n.title}</span>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-2">{n.message}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      {new Date(n.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {n.link && (
                      <Link
                        to={n.link}
                        onClick={onClose}
                        className="text-[11px] text-brand-400 hover:text-brand-300 flex items-center gap-1 font-medium"
                      >
                        View details <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onDelete(n.id)}
                  title="Remove notification"
                  className="text-slate-400 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
