"use client";

import React, { useState } from 'react';
import { Paperclip, Mic, SendHorizontal, Image as ImageIcon, Smile } from 'lucide-react';

interface MessageInputProps {
  contactPhone: string;
}

const MessageInput = ({ contactPhone }: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim() || isSending) return;

    setIsSending(true);
    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: contactPhone,
          text: message.trim(),
        }),
      });

      if (response.ok) {
        setMessage('');
      } else {
        const error = await response.json();
        console.error('Failed to send message:', error);
        alert('Failed to send message: ' + (error.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message. Please check console.');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <footer className="px-4 py-3 bg-[#15191d] border-t border-[#24292e] shrink-0">
      <div className="flex flex-col gap-2 max-w-[1200px] mx-auto">
        <div className="flex items-center gap-2">
           <button className="p-1 text-slate-500 hover:text-white hover:bg-[#24292e] rounded transition-colors">
            <Paperclip size={14} />
          </button>
          <button className="p-1 text-slate-500 hover:text-white hover:bg-[#24292e] rounded transition-colors">
            <ImageIcon size={14} />
          </button>
          <button className="p-1 text-slate-500 hover:text-white hover:bg-[#24292e] rounded transition-colors">
            <Mic size={14} />
          </button>
          <div className="h-4 w-px bg-[#24292e] mx-1" />
          <div className="flex flex-1 gap-1 overflow-x-auto no-scrollbar">
            {['Quick Hello', 'Price list', 'Location info', 'Next steps'].map((label, i) => (
              <button 
                key={i}
                type="button"
                onClick={() => setMessage(label)}
                className="flex-shrink-0 px-2 py-1 rounded-lg bg-[#24292e] text-[9px] font-bold uppercase tracking-tight text-slate-400 border border-[#3b4149] hover:border-[#ff9900]/50 hover:text-white transition-all"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSending}
              placeholder="Type your message here..."
              className="w-full max-h-32 min-h-[36px] resize-none rounded-lg bg-[#0d1117] px-3 py-2 text-xs text-white placeholder-slate-600 outline-none border border-[#3b4149] focus:border-[#ff9900]/50 transition-all font-medium disabled:opacity-50"
              rows={1}
            />
          </div>

          <button 
            type="button"
            onClick={handleSend}
            disabled={!message.trim() || isSending}
            className={`mb-0.5 flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-150 ${
              message.trim() && !isSending
                ? 'bg-[#ff9900] text-[#15191d] shadow-sm active:scale-95' 
                : 'bg-[#24292e] text-slate-600 cursor-not-allowed opacity-50'
            }`}
          >
            <SendHorizontal size={14} strokeWidth={2.5} className={isSending ? 'animate-pulse' : ''} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default MessageInput;
