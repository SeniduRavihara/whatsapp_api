"use client";

import React, { useState } from 'react';
import Sidebar from '@/components/inbox/Sidebar';
import ConversationList from '@/components/inbox/ConversationList';
import ChatWindow from '@/components/inbox/ChatWindow';

export default function Home() {
  const [selectedContactPhone, setSelectedContactPhone] = useState<string | null>(null);

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-[#0d1117] text-slate-300 antialiased font-sans">
      {/* 1. Navigation Column (AWS Sidebar style) */}
      <Sidebar />
      
      {/* 2. List Column (Dense Message list) */}
      <ConversationList 
        selectedPhone={selectedContactPhone} 
        onSelect={setSelectedContactPhone} 
      />
      
      {/* 3. Content Column (Main Chat Console) */}
      <div className="flex flex-1 flex-col overflow-hidden bg-[#0d1117]">
        {selectedContactPhone ? (
          <ChatWindow contactPhone={selectedContactPhone} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            <div className="text-center">
              <div className="text-4xl mb-4 text-[#ff9900]/20">✉</div>
              <p className="text-sm font-medium">Select a conversation to start messaging</p>
              <p className="text-xs mt-1 text-slate-600">Select an active thread from the left panel</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Subtle Grid Pattern overlay for POS look */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.03] bg-[radial-gradient(#8b949e_1px,transparent_1px)] [background-size:20px_20px]" />
    </main>
  );
}
