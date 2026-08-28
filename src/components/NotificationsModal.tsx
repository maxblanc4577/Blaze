import React from 'react';
import { X } from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  buzzEvents: any[];
  onSelectProfile: (p: any) => void;
  profiles: any[];
  onMarkAllAsRead: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  buzzEvents,
  onMarkAllAsRead,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Notifications</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {buzzEvents.length === 0 ? (
            <p className="text-stone-500 text-sm text-center py-4">No new notifications</p>
          ) : (
            buzzEvents.map((ev, i) => (
              <div key={i} className="p-3 bg-stone-50 rounded-xl text-sm text-stone-700">
                Activity update #{i + 1}
              </div>
            ))
          )}
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={onMarkAllAsRead} className="text-xs font-medium text-orange-600 hover:underline">Mark all as read</button>
        </div>
      </div>
    </div>
  );
};
