"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Lock, Unlock, Phone, Search, MoreVertical, Menu, Bell, HelpCircle, ChevronRight } from 'lucide-react';
import MessageItem from './MessageItem';
import MessageInput from './MessageInput';
import { supabase } from '@/lib/supabase';
import { Message, Contact } from '@/types';

interface ChatWindowProps {
  contactPhone: string;
}

const ChatWindow = ({ contactPhone }: ChatWindowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchContact();
    fetchMessages();

    // Subscribe to messages for THIS contact
    const channel = supabase
      .channel(`chat:${contactPhone}`)
      .on(
        'postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'messages',
          filter: `contact_phone=eq.${contactPhone}`
        }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMessages(prev => [...prev, payload.new as Message]);
          } else if (payload.eventType === 'UPDATE') {
            setMessages(prev => prev.map(m => m.id === payload.new.id ? payload.new as Message : m));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [contactPhone]);

  const fetchContact = async () => {
    const { data } = await supabase
      .from('contacts')
      .select('*')
      .eq('phone', contactPhone)
      .single();
    setContact(data);
  };

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('contact_phone', contactPhone)
      .order('created_at', { ascending: true });

    if (!error) {
      setMessages(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!isLocked && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLocked]);

  return (
    <div className="flex flex-1 flex-col h-full bg-[#0d1117]">
      {/* AWS Style Header */}
      <header className="h-14 flex items-center justify-between px-4 bg-[#15191d] border-b border-[#24292e] text-white z-40 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 cursor-pointer hover:text-[#ff9900] transition-colors">
            <Menu className="w-5 h-5 text-slate-400" />
            <span className="text-sm font-bold tracking-tight">Chat Console</span>
          </div>
          <div className="h-6 w-[1px] bg-[#24292e] mx-1" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#1c2128] border border-[#3b4149] flex items-center justify-center text-[10px] font-bold text-[#ff9900]">
              {contact?.name?.charAt(0) || contactPhone.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white leading-none">{contact?.name || contactPhone}</span>
              <span className="text-[9px] font-medium text-emerald-500 mt-0.5 flex items-center gap-1">
                <span className="h-1 w-1 rounded-full bg-emerald-500 shadow-sm" /> Connected
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => setIsLocked(!isLocked)}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-tight transition-all border ${
              isLocked 
                ? 'bg-[#ff9900]/10 text-[#ff9900] border-[#ff9900]/30 shadow-sm' 
                : 'bg-[#24292e] text-slate-400 border-[#3b4149] hover:text-white'
            }`}
          >
            {isLocked ? <Lock size={12} /> : <Unlock size={12} />}
            {isLocked ? 'Focus Locked' : 'Scroll Free'}
          </button>
          <div className="h-4 w-px bg-[#24292e] mx-1" />
          <button className="p-2 text-slate-400 hover:bg-[#24292e] hover:text-white rounded transition-colors">
            <Search size={14} />
          </button>
          <button className="p-2 text-slate-400 hover:bg-[#24292e] hover:text-white rounded transition-colors">
            <Bell size={14} />
          </button>
          <button className="p-2 text-slate-400 hover:bg-[#24292e] hover:text-white rounded transition-colors">
            <HelpCircle size={14} />
          </button>
          <button className="p-2 text-slate-400 hover:bg-[#24292e] hover:text-white rounded transition-colors">
            <MoreVertical size={14} />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-4 no-scrollbar relative bg-[#0d1117]"
        onScroll={(e) => {
          const target = e.currentTarget;
          const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 1;
          if (!isAtBottom) setIsLocked(true);
        }}
      >
        <div className="max-w-[1200px] mx-auto flex flex-col pt-4">
          {loading && messages.length === 0 ? (
             <div className="flex justify-center p-8 text-slate-500 text-xs">Loading history...</div>
          ) : messages.length === 0 ? (
            <div className="flex justify-center p-8 text-slate-600 text-[10px] uppercase font-bold tracking-widest italic opacity-50">
              No message history with this contact
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {messages.map((msg) => (
                <MessageItem 
                  key={msg.id} 
                  id={msg.id as any}
                  text={msg.text} 
                  sender={msg.sender} 
                  time={new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  status={msg.status}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <MessageInput contactPhone={contactPhone} />
    </div>
  );
};

export default ChatWindow;
