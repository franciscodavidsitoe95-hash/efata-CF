import React, { useState, useEffect } from 'react';
import { Send, Image as ImageIcon, Mic, Phone, X, Paperclip } from 'lucide-react';
import { getData, saveData } from '../lib/storage';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { ChatMessage } from '../types';

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    setMessages(getData('MESSAGES') || []);
  }, []);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !user) return;
    const message: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: user.id,
      senderName: user.name,
      content: newMessage,
      type: 'text',
      createdAt: new Date().toISOString()
    };
    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    saveData('MESSAGES', updatedMessages);
    setNewMessage('');
  };

  return (
    <div className="p-8 lg:p-12 h-[calc(100vh-100px)] flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-brand-slate uppercase tracking-tighter">Chat Interno (Prototipo)</h1>
        <div className="flex space-x-4">
           <button className="p-3 bg-brand-green/10 text-brand-green rounded-2xl hover:bg-brand-green hover:text-white transition-all">
             <Phone className="h-5 w-5" />
           </button>
        </div>
      </div>
      
      <div className="flex-1 bg-white border border-brand-cream-dark rounded-[3rem] p-8 overflow-y-auto mb-8 shadow-inner shadow-gray-100">
         {messages.map(msg => (
            <div key={msg.id} className={`mb-6 flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-4 rounded-2xl max-w-[70%] ${msg.senderId === user?.id ? 'bg-brand-indigo text-white rounded-tr-none' : 'bg-brand-cream text-brand-slate rounded-tl-none border border-brand-cream-dark'}`}>
                    <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1">{msg.senderName}</p>
                    <p className="text-sm font-medium">{msg.content}</p>
                </div>
            </div>
         ))}
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="p-4 bg-brand-cream rounded-2xl text-gray-400 hover:text-brand-indigo"><Paperclip /></button>
        <button className="p-4 bg-brand-cream rounded-2xl text-gray-400 hover:text-brand-indigo"><ImageIcon /></button>
        <button className="p-4 bg-brand-cream rounded-2xl text-gray-400 hover:text-brand-indigo"><Mic /></button>
        <input 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          className="flex-1 rounded-2xl border-brand-cream-dark bg-white px-6 py-4 text-sm outline-none" 
          placeholder="Escrever mensagem..." 
        />
        <button onClick={handleSendMessage} className="p-4 bg-brand-indigo text-white rounded-2xl hover:bg-brand-blue"><Send /></button>
      </div>
    </div>
  );
}
