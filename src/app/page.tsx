import React from 'react';
import Sidebar from '@/components/inbox/Sidebar';
import ConversationList from '@/components/inbox/ConversationList';
import ChatWindow from '@/components/inbox/ChatWindow';

export default function Home() {
  return (
    <main className="flex h-screen w-screen overflow-hidden bg-[#0d1117] text-slate-300 antialiased font-sans">
      {/* 1. Navigation Column (AWS Sidebar style) */}
      <Sidebar />
      
      {/* 2. List Column (Dense Message list) */}
      <ConversationList />
      
      {/* 3. Content Column (Main Chat Console) */}
      <div className="flex flex-1 flex-col overflow-hidden bg-[#0d1117]">
        <ChatWindow />
      </div>
      
      {/* Subtle Grid Pattern overlay for POS look */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.03] bg-[radial-gradient(#8b949e_1px,transparent_1px)] [background-size:20px_20px]" />
    </main>
  );
}
