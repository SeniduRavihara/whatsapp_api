"use client";

import React from 'react';

interface MessageProps {
  id: string | number;
  text?: string;
  sender: 'me' | 'them';
  time: string;
  status?: 'sent' | 'delivered' | 'read';
  type?: 'text' | 'image' | 'video' | 'audio' | 'document' | 'sticker' | 'location';
  mediaUrl?: string;
  mimeType?: string;
  caption?: string;
}

const MessageItem: React.FC<MessageProps> = ({ 
  text, 
  sender, 
  time, 
  status, 
  type = 'text', 
  mediaUrl, 
  mimeType, 
  caption 
}) => {
  const isMe = sender === 'me';
  
  const renderContent = () => {
    switch (type) {
      case 'image':
        return (
          <div className="flex flex-col gap-2">
            <div className="rounded-xl overflow-hidden shadow-sm border border-[#e1e3e4]/50 bg-white">
              <img 
                src={mediaUrl} 
                alt={caption || "Sent image"} 
                className="max-w-full max-h-[300px] object-cover cursor-pointer hover:opacity-95 transition-opacity"
              />
            </div>
            {caption && <p className="px-1 text-sm font-body">{caption}</p>}
          </div>
        );
      
      case 'document':
        return (
          <a 
            href={mediaUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-4 bg-white border border-[#e1e3e4] rounded-xl p-3 hover:bg-[#f8f9fa] transition-colors group no-underline"
          >
            <div className="w-10 h-10 rounded-lg bg-[#cfe6f2] flex items-center justify-center text-[#003752] group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-xl">description</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-headline font-bold text-[#191c1d] truncate">
                {caption || "Attached Document"}
              </p>
              <p className="text-[10px] text-[#727780] font-medium uppercase tracking-wider">
                {mimeType?.split('/')[1] || 'FILE'} • Download
              </p>
            </div>
            <span className="material-symbols-outlined text-[#727780] text-sm">download</span>
          </a>
        );

      case 'video':
        return (
          <div className="rounded-xl overflow-hidden shadow-sm border border-[#e1e3e4]/50 bg-black">
            <video 
              src={mediaUrl} 
              controls 
              className="max-w-full max-h-[300px]"
            />
          </div>
        );

      default:
        return <p className="whitespace-pre-wrap font-body">{text}</p>;
    }
  };
  
  return (
    <div className={`flex w-full mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300 ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
        <div 
          className={`px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed transition-all duration-200 ${
            type === 'text' 
              ? (isMe 
                  ? 'bg-[#003752] text-white rounded-tr-none shadow-md font-medium' 
                  : 'bg-white text-[#191c1d] rounded-tl-none border border-[#e1e3e4]/50')
              : (isMe ? 'items-end' : 'items-start')
          }`}
        >
          {renderContent()}
        </div>
        
        <div className={`flex items-center gap-1.5 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
          <span className="text-[10px] text-[#727780] font-medium font-body tabular-nums">
            {time}
          </span>
          {isMe && status && (
            <span className={`material-symbols-outlined text-xs ${status === 'read' ? 'text-[#3de273]' : 'text-[#727780]'}`}>
              {status === 'read' ? 'done_all' : 'done'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
