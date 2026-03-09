import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import api from '../api/axiosInstance';
import { toast } from 'react-hot-toast';
import type { Notification } from '../types/mess';

const NotificationCenter: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = useCallback(async () => {
        try {
            const response = await api.get('/notifications');
            setNotifications(response.data.data);
            setUnreadCount(response.data.data.filter((n: Notification) => !n.read).length);
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        }
    }, []);

    useEffect(() => {
        let mounted = true;
        const loadNotifications = async () => {
            if (mounted) {
                await fetchNotifications();
            }
        };
        loadNotifications();

        const interval = setInterval(fetchNotifications, 60000);
        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, [fetchNotifications]);

    const markAsRead = async (id: string) => {
        try {
            await api.put(`/notifications/${id}/read`);
            fetchNotifications();
        } catch (err) {
            console.error('Failed to mark notification as read', err);
            toast.error('Failed to mark as read');
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            await api.delete(`/notifications/${id}`);
            fetchNotifications();
            toast.success('Notification deleted');
        } catch (err) {
            console.error('Failed to delete notification', err);
            toast.error('Failed to delete notification');
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
            >
                <Bell size={20} className="text-gray-600" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-4 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-black text-sm uppercase tracking-widest">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={() => markAsRead('all')}
                                    className="text-[10px] font-black text-primary uppercase hover:underline"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-50">
                            {notifications.length > 0 ? (
                                notifications.map(n => (
                                    <div
                                        key={n.id}
                                        className={`p-4 flex gap-4 hover:bg-gray-50 transition-colors relative group ${!n.read ? 'bg-primary/5' : ''}`}
                                    >
                                        <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${!n.read ? 'bg-primary' : 'bg-transparent'}`} />
                                        <div className="flex-grow">
                                            <p className="text-sm font-bold text-gray-900 leading-tight">{n.title}</p>
                                            <p className="text-xs text-gray-500 mt-1">{n.message}</p>
                                            <p className="text-[10px] text-gray-400 font-medium mt-2">
                                                {n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                                            </p>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
                                            {!n.read && (
                                                <button onClick={() => markAsRead(n.id)} className="p-1 text-green-500 hover:bg-green-50 rounded-md">
                                                    <Check size={14} />
                                                </button>
                                            )}
                                            <button onClick={() => deleteNotification(n.id)} className="p-1 text-red-400 hover:bg-red-50 rounded-md">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center">
                                    <Bell size={32} className="mx-auto text-gray-200 mb-2" />
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No notifications yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationCenter;
