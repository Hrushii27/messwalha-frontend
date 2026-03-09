import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/common/Button';
import { Search, Send, Image as ImageIcon, Phone, Video, Info } from 'lucide-react';
import { useAppSelector } from '../../hooks/redux';
import type { RootState } from '../../store';
import api from '../api/axiosInstance';
import { io, Socket } from 'socket.io-client';
import type { Chat, ChatMessage } from '../types/mess';

const ChatPage: React.FC = () => {
    const { user } = useAppSelector((state: RootState) => state.auth);
    const [chats, setChats] = useState<Chat[]>([]);
    const [activeChat, setActiveChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const activeChatRef = useRef<Chat | null>(null);

    useEffect(() => {
        activeChatRef.current = activeChat;
    }, [activeChat]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const response = await api.get('/chats');
                setChats(response.data.data);
                if (response.data.data.length > 0) {
                    setActiveChat(response.data.data[0]);
                }
            } catch (error) {
                console.error('Error fetching chats:', error);
            }
        };

        fetchChats();

        // Initialize socket
        const socketUrl = window.location.origin;
        socketRef.current = io(socketUrl, {
            auth: { token: localStorage.getItem('token') }
        });

        socketRef.current.on('new_message', (message: ChatMessage) => {
            if (activeChatRef.current && message.chatId === activeChatRef.current.id) {
                setMessages(prev => [...prev, message]);
            }
            // Update chat list summary
            setChats(prev => prev.map(c =>
                c.id === message.chatId ? { ...c, messages: [message], updatedAt: new Date().toISOString() } : c
            ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, []);

    useEffect(() => {
        if (activeChat) {
            const fetchMessages = async () => {
                try {
                    const response = await api.get(`/chats/${activeChat.id}/messages`);
                    setMessages(response.data.data);
                    socketRef.current?.emit('join_chat', activeChat.id);
                } catch (error) {
                    console.error('Error fetching messages:', error);
                }
            };
            fetchMessages();
        }
    }, [activeChat]);

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChat) return;

        socketRef.current?.emit('send_message', {
            chatId: activeChat.id,
            text: newMessage
        });

        setNewMessage('');
    };

    const getChatPartner = (chat: Chat) => {
        return user?.id === chat.studentId ? chat.owner : chat.student;
    };

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8 h-[calc(100vh-120px)]">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-0 h-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100 bg-white">
                    {/* Sidebar: Chat List */}
                    <div className="md:col-span-4 border-r border-gray-100 flex flex-col h-full bg-gray-50/30">
                        <div className="p-6 border-b border-gray-100 bg-white">
                            <h2 className="text-2xl font-black mb-4 tracking-tighter">Messages</h2>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search conversations..."
                                    className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                                />
                            </div>
                        </div>

                        <div className="flex-grow overflow-y-auto p-4 space-y-2">
                            {chats.map(chat => {
                                const partner = getChatPartner(chat);
                                const lastMsg = chat.messages?.[0];
                                return (
                                    <button
                                        key={chat.id}
                                        onClick={() => setActiveChat(chat)}
                                        className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all group ${activeChat?.id === chat.id
                                            ? 'bg-white shadow-xl shadow-primary/5 border-primary/10 border'
                                            : 'hover:bg-white/50'}`}
                                    >
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black">
                                                {partner?.name?.charAt(0)}
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-sm text-gray-900">{partner?.name}</h4>
                                                <span className="text-[10px] text-gray-400 font-bold">{new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 line-clamp-1 font-medium italic mt-0.5">
                                                {lastMsg?.text || 'No messages yet'}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Main Content: Active Chat */}
                    <div className="md:col-span-8 flex flex-col h-full bg-white relative">
                        {activeChat ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-black">
                                            {getChatPartner(activeChat)?.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-gray-900">{getChatPartner(activeChat)?.name}</h3>
                                            <p className="text-[10px] text-green-500 font-black uppercase tracking-widest">Online Now</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="sm" className="rounded-xl text-gray-400"><Phone size={20} /></Button>
                                        <Button variant="ghost" size="sm" className="rounded-xl text-gray-400"><Video size={20} /></Button>
                                        <Button variant="ghost" size="sm" className="rounded-xl text-gray-400"><Info size={20} /></Button>
                                    </div>
                                </div>

                                {/* Messages Area */}
                                <div className="flex-grow overflow-y-auto p-8 space-y-6">
                                    {messages.map((msg) => {
                                        const isOwn = msg.senderId === user?.id;
                                        return (
                                            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                                <div className={`max-w-[70%] group ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                                                    <div className={`p-4 rounded-3xl text-sm font-medium shadow-sm transition-all ${isOwn
                                                        ? 'bg-primary text-white rounded-br-none'
                                                        : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                                                        {msg.text}
                                                    </div>
                                                    <span className="text-[9px] text-gray-400 font-black uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                <div className="p-6 border-t border-gray-100 bg-white">
                                    <form onSubmit={handleSendMessage} className="flex items-center gap-4 bg-gray-50 p-2 rounded-3xl border border-gray-100">
                                        <Button type="button" variant="ghost" size="sm" className="rounded-2xl text-gray-400 px-3">
                                            <ImageIcon size={20} />
                                        </Button>
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Type your message here..."
                                            className="flex-grow bg-transparent border-none outline-none px-2 text-sm font-medium"
                                        />
                                        <Button type="submit" size="sm" className="rounded-2xl w-12 h-12 p-0 flex items-center justify-center">
                                            <Send size={20} />
                                        </Button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="flex-grow flex items-center justify-center text-center p-12">
                                <div className="space-y-4 opacity-30 translate-y-[-20%]">
                                    <div className="w-24 h-24 bg-gray-100 rounded-[2.5rem] mx-auto flex items-center justify-center text-primary">
                                        <Send size={48} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-widest">Your Inbox</h3>
                                        <p className="text-sm font-bold mt-2">Select a conversation to start chatting</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ChatPage;
