import React from 'react';
import { Check, CheckCheck } from 'lucide-react';

interface MessageProps {
  id: number;
  text: string;
  sender: 'me' | 'them';
  time: string;
  status?: 'sent' | 'delivered' | 'read';
}

const MessageItem: React.FC<MessageProps> = ({ text, sender, time, status }) => {
  const isMe = sender === 'me';
  
  return (
    <div className={`flex w-full mb-1 animate-fade-in ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div className={`relative max-w-[85%] rounded-xl px-3 py-1.5 text-[11px] font-medium leading-normal tracking-tight shadow-sm transition-all duration-150 ${
        isMe 
          ? 'bg-[#1c2128] text-white border border-[#ff9900]/20' 
          : 'bg-[#15191d] text-slate-300 border border-[#24292e] backdrop-blur-md'
      }`}>
        <p className="whitespace-pre-wrap">{text}</p>
        <div className={`mt-1 flex items-center gap-1.5 ${isMe ? 'opacity-80 justify-end' : 'opacity-40 justify-start'}`}>
          <span className="text-[8px] font-bold uppercase tracking-tighter tabular-nums">{time}</span>
          {isMe && status && (
            <span className={status === 'read' ? 'text-[#ff9900]' : 'text-slate-500'}>
              {status === 'read' ? <CheckCheck size={10} strokeWidth={3} /> : <Check size={10} strokeWidth={3} />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
