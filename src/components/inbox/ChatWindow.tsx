"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Lock, Unlock, Phone, Search, MoreVertical, Menu, Bell, HelpCircle, ChevronRight } from 'lucide-react';
import MessageItem from './MessageItem';
import MessageInput from './MessageInput';

const ChatWindow = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isLocked, setIsLocked] = useState(false);
  
  const mockMessages = [
    { id: 1, text: "Hello! How can I help you today?", sender: 'them', time: '12:45 PM' },
    { id: 2, text: "I'm interested in your business services.", sender: 'me', time: '12:46 PM', status: 'read' },
    { id: 3, text: "Great! We offer a variety of cloud-based solutions tailored for small businesses.", sender: 'them', time: '12:47 PM' },
    { id: 4, text: "Could you send me a price list?", sender: 'me', time: '12:48 PM', status: 'delivered' },
    { id: 5, text: "Of course! Let me pull that up for you.", sender: 'them', time: '12:49 PM' },
    { id: 6, text: "Also, what are your opening hours?", sender: 'them', time: '12:50 PM' },
  ];

  useEffect(() => {
    if (!isLocked && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mockMessages, isLocked]);

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
              AJ
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white leading-none">Alice Johnson</span>
              <span className="text-[9px] font-medium text-emerald-500 mt-0.5 flex items-center gap-1">
                <span className="h-1 w-1 rounded-full bg-emerald-500 shadow-sm" /> Online
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
        className="flex-1 overflow-y-auto px-6 py-4 no-scrollbar relative bg-[#0d1117] bg-pattern-cube"
        onScroll={(e) => {
          const target = e.currentTarget;
          const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 1;
          if (!isAtBottom) setIsLocked(true);
        }}
      >
        <div className="max-w-[1200px] mx-auto flex flex-col pt-4">
          <div className="mb-6 flex justify-center">
            <span className="px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-slate-500 border-b border-[#24292e]">
              --- April 05, 2024 ---
            </span>
          </div>
          
          <div className="flex flex-col gap-2">
            {mockMessages.map((msg) => (
              <MessageItem 
                key={msg.id} 
                id={msg.id}
                text={msg.text} 
                sender={msg.sender as 'me' | 'them'} 
                time={msg.time}
                status={msg.status as any}
              />
            ))}
          </div>
        </div>
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatWindow;
