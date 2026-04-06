"use client";

import React, { useEffect, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Contact } from '@/types';

interface ConversationListProps {
  selectedPhone: string | null;
  onSelect: (phone: string) => void;
}

const ConversationList = ({ selectedPhone, onSelect }: ConversationListProps) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();

    // Subscribe to realtime updates for contacts table
    const channel = supabase
      .channel('public:contacts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts' }, () => {
        fetchContacts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchContacts = async () => {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('Error fetching contacts:', error);
    } else {
      setContacts(data || []);
    }
    setLoading(false);
  };

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
        {loading ? (
          <div className="p-4 text-center text-slate-500 text-xs">Loading conversations...</div>
        ) : contacts.length === 0 ? (
          <div className="p-4 text-center text-slate-500 text-xs">No conversations found</div>
        ) : (
          contacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => onSelect(contact.phone)}
              className={`group flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-all duration-150 border-b border-[#24292e]/50 ${
                selectedPhone === contact.phone 
                  ? 'bg-[#24292e] text-white shadow-sm' 
                  : 'text-slate-400 hover:bg-[#1c2128] hover:text-white'
              }`}
            >
              <div className="relative h-9 w-9 flex-shrink-0">
                <div className={`h-full w-full rounded-lg bg-[#1c2128] border border-[#3b4149] flex items-center justify-center text-[10px] font-bold ${selectedPhone === contact.phone ? 'text-[#ff9900]' : 'text-slate-500'}`}>
                  {contact.name?.charAt(0) || '?'}
                </div>
                {contact.unread_count > 0 && (
                  <div className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded bg-[#ff9900] px-1 text-[8px] font-black text-[#15191d] shadow-md border border-[#15191d]">
                    {contact.unread_count}
                  </div>
                )}
              </div>
              
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between gap-2">
                  <span className={`truncate text-xs font-bold tracking-tight ${selectedPhone === contact.phone ? 'text-[#ff9900]' : 'text-slate-300'}`}>
                    {contact.name || contact.phone}
                  </span>
                  <span className="text-[9px] text-slate-500 font-bold tabular-nums">
                    {new Date(contact.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className={`mt-0.5 truncate text-[10px] font-medium leading-normal ${contact.unread_count > 0 ? 'text-slate-200' : 'text-slate-500'}`}>
                  {contact.last_message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList;
