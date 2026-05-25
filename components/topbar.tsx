'use client';

import { Bell, Search, Menu, UserCircle, Wifi, WifiOff, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import { useAuth, DEMO_USERS } from '@/lib/contexts/AuthContext';
import { useNotifications } from '@/lib/contexts/NotificationContext';
import { useState, useEffect } from 'react';

export function Topbar() {
  const { currentUser, setCurrentUser } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll, addNotification } = useNotifications();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => {
      setIsOnline(true);
      addNotification({
        title: 'Connection Restored',
        message: 'You are back online. Offline changes are syncing.',
        type: 'success',
      });
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      addNotification({
        title: 'Connection Lost',
        message: 'You are running in offline mode. Changes will be saved locally.',
        type: 'warning',
      });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [addNotification]);

  const timeAgo = (date: number) => {
    // eslint-disable-next-line react-hooks/purity
    const diff = Date.now() - date;
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <header className="h-16 flex-shrink-0 bg-zinc-900 border-b border-zinc-700 flex items-center justify-between px-4 lg:px-8 z-10 relative">
      <div className="flex items-center flex-1">
        <button className="lg:hidden p-2 text-zinc-400 hover:text-zinc-100 mr-2">
          <Menu className="h-6 w-6" />
        </button>
        
        <div className="max-w-md w-full relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search equipment, work orders, alarm codes..." 
            className="w-full bg-zinc-950 border border-zinc-700 rounded-full py-2 pl-10 pr-4 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Network Status */}
        <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
          isOnline 
            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
            : 'bg-red-500/10 text-red-500 border-red-500/20'
        }`}>
          {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          {isOnline ? 'Online' : 'Offline Mode'}
        </div>

        {/* Role Menu */}
        <div className="relative">
          <button 
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 p-1.5 pl-3 rounded-full border border-zinc-700 hover:border-amber-500/50 bg-zinc-950 transition-all text-left"
          >
            <div>
              <div className="text-xs font-bold text-zinc-100">{currentUser?.name}</div>
              <div className="text-[10px] text-amber-500 uppercase tracking-widest">{currentUser?.role}</div>
            </div>
            <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 ml-1">
              <UserCircle className="h-5 w-5 text-zinc-400" />
            </div>
          </button>
          
          {showRoleMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden shadow-xl z-50">
              <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-zinc-500 font-bold border-b border-zinc-700 bg-zinc-900/50">
                Switch Role
              </div>
              {DEMO_USERS.map(user => (
                <button
                  key={user.id}
                  onClick={() => {
                    setCurrentUser(user);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-zinc-700 transition-colors flex flex-col ${currentUser?.id === user.id ? 'bg-amber-500/10 border-l-2 border-amber-500' : 'pl-[18px]'}`}
                >
                  <span className="font-bold text-zinc-100">{user.name}</span>
                  <span className="text-xs text-zinc-500">{user.role}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button 
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="p-2 relative text-zinc-400 hover:text-zinc-100 transition-colors rounded-full hover:bg-zinc-900"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden shadow-xl z-50 flex flex-col max-h-[80vh]">
              <div className="px-4 py-3 flex items-center justify-between border-b border-zinc-700 bg-zinc-900/50">
                <span className="text-sm uppercase tracking-widest text-zinc-100 font-bold">Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-[10px] text-amber-500 hover:text-amber-400 uppercase font-bold tracking-widest">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="overflow-y-auto overflow-x-hidden flex-1">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-zinc-500 text-sm">No notifications</div>
                ) : (
                  <div className="divide-y divide-zinc-700/50">
                    {notifications.map(notif => (
                      <div 
                        key={notif.id} 
                        className={`p-4 hover:bg-zinc-700/30 transition-colors cursor-pointer flex gap-3 ${notif.read ? 'opacity-60' : 'bg-zinc-700/10'}`}
                        onClick={() => {
                          if (!notif.read) markAsRead(notif.id);
                        }}
                      >
                        <div className="pt-0.5">
                          {notif.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                          {notif.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                          {notif.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                          {notif.type === 'info' && <Bell className="w-5 h-5 text-blue-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-bold text-zinc-100">{notif.title}</p>
                            <span className="text-[10px] text-zinc-500 whitespace-nowrap mt-0.5">{timeAgo(notif.createdAt)}</span>
                          </div>
                          <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{notif.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {notifications.length > 0 && (
                <div className="p-2 border-t border-zinc-700 bg-zinc-900/50">
                  <button onClick={clearAll} className="w-full py-2 text-xs text-zinc-500 hover:text-zinc-300 font-bold uppercase tracking-widest transition-colors rounded hover:bg-zinc-800">
                    Clear All
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
