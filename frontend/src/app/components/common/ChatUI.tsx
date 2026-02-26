import React, { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Send, User, MessageCircle, X } from 'lucide-react';

export const ChatUI: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([
        { text: 'Hi! I have a question about the monthly plan.', sent: true },
        { text: 'Hello! I can help with that. What would you like to know?', sent: false },
    ]);

    const handleSend = () => {
        if (!message.trim()) return;
        setMessages([...messages, { text: message, sent: true }]);
        setMessage('');
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 w-16 h-16 bg-primary text-white rounded-full shadow-2xl shadow-primary/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group"
            >
                <MessageCircle size={32} className="group-hover:rotate-12 transition-transform" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary rounded-full border-2 border-white animate-pulse" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-8 right-8 w-80 md:w-96 h-[500px] z-50 flex flex-col scale-in-center">
            <Card className="flex-grow flex flex-col p-0 overflow-hidden shadow-2xl border-primary/10">
                {/* Header */}
                <div className="bg-primary p-4 text-white flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                            <User size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-sm leading-none">Support & Owners</p>
                            <p className="text-[10px] text-white/70 mt-1">Reply time: ~10 mins</p>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.sent ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sent
                                ? 'bg-primary text-white rounded-tr-none shadow-md shadow-primary/10'
                                : 'bg-white text-gray-700 rounded-tl-none shadow-sm'
                                }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input */}
                <div className="p-4 bg-white border-t border-gray-100 flex items-center space-x-2">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type a message..."
                        className="flex-grow text-sm bg-gray-50 border-none rounded-xl px-4 py-2 focus:ring-2 ring-primary/20 outline-none"
                    />
                    <Button onClick={handleSend} className="rounded-xl p-2 h-10 w-10 min-w-0" size="sm">
                        <Send size={18} />
                    </Button>
                </div>
            </Card>

            <p className="text-[10px] text-gray-400 text-center mt-2 italic">
                Powered by MessWalha Live Chat
            </p>
        </div>
    );
};
