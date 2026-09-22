import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bell, Check, Trash2, X, AlertTriangle, Users, 
  Radio, Navigation, ShieldCheck, Activity, ChevronRight
} from 'lucide-react';
import { NotificationItem } from '../../types';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const { 
    notifications, 
    markNotificationRead, 
    clearNotifications, 
    darkMode,
    navigateTo 
  } = useApp();

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'incident':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'missing_person':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'crowd':
        return <Activity className="w-4 h-4 text-amber-500" />;
      case 'broadcast':
        return <Radio className="w-4 h-4 text-purple-500" />;
      case 'journey':
        return <Navigation className="w-4 h-4 text-amber-500" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
    }
  };

  const handleNotificationClick = (item: NotificationItem) => {
    markNotificationRead(item.id);
    if (item.type === 'incident' || item.type === 'crowd' || item.type === 'broadcast') {
      navigateTo('control_room', 'admin');
    } else if (item.type === 'missing_person') {
      navigateTo('family', 'family');
    } else if (item.type === 'journey') {
      navigateTo('citizen', 'citizen');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`relative w-full max-w-sm sm:max-w-md h-full shadow-2xl flex flex-col z-10 border-l transition-colors ${
        darkMode ? 'bg-[#12151e] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between ${
          darkMode ? 'border-slate-800/80' : 'border-slate-200/80'
        }`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-500 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Notifications</h3>
              <p className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {unreadCount > 0 ? `${unreadCount} unread alerts` : 'All alerts read'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                title="Clear all"
                className={`p-1.5 rounded-lg text-xs font-medium transition ${
                  darkMode ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-800' : 'text-slate-500 hover:text-rose-600 hover:bg-slate-100'
                }`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition ${
                darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                darkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400'
              }`}>
                <Bell className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-medium">No notifications</h4>
              <p className={`text-xs max-w-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                You're all caught up. Real-time emergency notifications and dispatch alerts will appear here.
              </p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3 relative group ${
                  !item.read 
                    ? darkMode 
                      ? 'bg-slate-800/40 border-blue-500/40 hover:bg-slate-800/70' 
                      : 'bg-blue-50/40 border-blue-200 hover:bg-blue-50/80 shadow-xs'
                    : darkMode 
                      ? 'bg-slate-900/30 border-slate-800 hover:bg-slate-800/30' 
                      : 'bg-white border-slate-200 hover:bg-slate-50 shadow-xs'
                }`}
              >
                {/* Unread indicator dot */}
                {!item.read && (
                  <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-blue-500" />
                )}

                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  item.severity === 'critical' ? 'bg-rose-500/10' :
                  item.severity === 'high' ? 'bg-amber-500/10' :
                  item.severity === 'success' ? 'bg-emerald-500/10' : 'bg-blue-500/10'
                }`}>
                  {getIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`text-xs font-semibold truncate ${
                      item.severity === 'critical' ? 'text-rose-600 dark:text-rose-400' : ''
                    }`}>
                      {item.title}
                    </h4>
                  </div>
                  <p className={`text-xs mt-0.5 line-clamp-2 leading-relaxed ${
                    darkMode ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    {item.message}
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-200/50 dark:border-slate-800/50 text-[10px]">
                    <span className={darkMode ? 'text-slate-500' : 'text-slate-400'}>
                      {item.timestamp}
                    </span>
                    <span className="text-blue-500 font-medium flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      View details <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className={`p-3 border-t text-center ${
            darkMode ? 'border-slate-800/80 bg-slate-950/40' : 'border-slate-200/80 bg-slate-50/50'
          }`}>
            <button
              onClick={() => notifications.forEach(n => markNotificationRead(n.id))}
              className={`text-xs font-medium transition ${
                darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
              }`}
            >
              Mark all as read
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
