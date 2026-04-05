import React from 'react';
import { Search, Filter } from 'lucide-react';

const ConversationList = () => {
  const conversations = [
    { id: 1, name: 'Alice Johnson', text: 'Hey, I had a question about...', time: '12:45 PM', unread: 3, active: true },
    { id: 2, name: 'Marketing Group', text: 'Bob: The new campaign is live!', time: '11:20 AM', unread: 0, active: false },
    { id: 3, name: 'Charlie Dave', text: 'Can we schedule a call?', time: 'Yesterday', unread: 1, active: false },
    { id: 4, name: 'Sarah Wilson', text: 'Thanks for the quick response!', time: 'Yesterday', unread: 0, active: false },
    { id: 5, name: 'Product Feedback', text: 'User 456: The UI looks great.', time: 'Apr 4', unread: 0, active: false },
    { id: 6, name: 'John Doe', text: 'Let me know what you think.', time: 'Apr 3', unread: 12, active: false },
    { id: 7, name: 'Support Ticket #123', text: 'New update available.', time: 'Apr 3', unread: 0, active: false },
    { id: 8, name: 'Dev Team', text: 'Fixed the minor spacing bug.', time: 'Apr 2', unread: 0, active: false },
  ];

  return (
    <div className="flex h-full w-[var(--conv-list-width)] flex-col bg-[#0d1117] border-r border-[#24292e]">
      <header className="px-4 h-14 flex items-center justify-between border-b border-[#24292e] bg-[#15191d]">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider">Inboxes</h2>
        <button className="p-1.5 text-slate-400 hover:text-white hover:bg-[#24292e] rounded transition-colors">
          <Filter size={14} />
        </button>
      </header>
      
      <div className="p-2 border-b border-[#24292e] bg-[#15191d]">
        <div className="relative group">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#ff9900] transition-colors z-10" />
          <input
            type="text"
            placeholder="Search resources..."
            className="w-full rounded-lg bg-[#24292e] py-1.5 pl-9 pr-3 text-[11px] text-slate-200 placeholder-slate-500 outline-none border border-[#3b4149] focus:border-[#ff9900]/50 transition-all font-medium"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto no-scrollbar pb-4 bg-[#0d1117]">
        {conversations.map((chat) => (
          <div
            key={chat.id}
            className={`group flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-all duration-150 border-b border-[#24292e]/50 ${
              chat.active 
                ? 'bg-[#24292e] text-white shadow-sm' 
                : 'text-slate-400 hover:bg-[#1c2128] hover:text-white'
            }`}
          >
            <div className="relative h-9 w-9 flex-shrink-0">
              <div className={`h-full w-full rounded-lg bg-[#1c2128] border border-[#3b4149] flex items-center justify-center text-[10px] font-bold ${chat.active ? 'text-[#ff9900]' : 'text-slate-500'}`}>
                {chat.name.charAt(0)}
              </div>
              {chat.unread > 0 && (
                <div className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded bg-[#ff9900] px-1 text-[8px] font-black text-[#15191d] shadow-md border border-[#15191d]">
                  {chat.unread}
                </div>
              )}
            </div>
            
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center justify-between gap-2">
                <span className={`truncate text-xs font-bold tracking-tight ${chat.active ? 'text-[#ff9900]' : 'text-slate-300'}`}>
                  {chat.name}
                </span>
                <span className="text-[9px] text-slate-500 font-bold tabular-nums">{chat.time}</span>
              </div>
              <p className={`mt-0.5 truncate text-[10px] font-medium leading-normal ${chat.unread > 0 ? 'text-slate-200' : 'text-slate-500'}`}>
                {chat.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationList;
