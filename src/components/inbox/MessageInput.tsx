import React, { useState } from 'react';
import { Paperclip, Mic, SendHorizontal, Image as ImageIcon, Smile } from 'lucide-react';

const MessageInput = () => {
  const [message, setMessage] = useState('');

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
              placeholder="Type your message here..."
              className="w-full max-h-32 min-h-[36px] resize-none rounded-lg bg-[#0d1117] px-3 py-2 text-xs text-white placeholder-slate-600 outline-none border border-[#3b4149] focus:border-[#ff9900]/50 transition-all font-medium"
              rows={1}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${target.scrollHeight}px`;
              }}
            />
          </div>

          <button className={`mb-0.5 flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-150 ${
            message.trim() 
              ? 'bg-[#ff9900] text-[#15191d] shadow-sm active:scale-95' 
              : 'bg-[#24292e] text-slate-600 cursor-not-allowed opacity-50'
          }`}>
            <SendHorizontal size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default MessageInput;
