"use client";

import React from "react";

interface MessageProps {
  id: string | number;
  text?: string;
  sender: "me" | "them";
  time: string;
  status?: "sent" | "delivered" | "read";
  type?:
    | "text"
    | "image"
    | "video"
    | "audio"
    | "document"
    | "sticker"
    | "location"
    | "contacts";
  mediaUrl?: string;
  mimeType?: string;
  caption?: string;
  onMediaClick?: (url: string) => void;
}

const MessageItem: React.FC<MessageProps> = ({
  text,
  sender,
  time,
  status,
  type = "text",
  mediaUrl,
  mimeType,
  caption,
  onMediaClick,
}) => {
  const isMe = sender === "me";

  const renderContent = () => {
    switch (type) {
      case "image":
        return (
          <div className="flex flex-col gap-2">
            <div className="rounded-xl overflow-hidden shadow-sm border border-[#e1e3e4]/50 bg-white">
              <img
                src={mediaUrl}
                alt={caption || "Sent image"}
                onClick={() =>
                  onMediaClick && mediaUrl && onMediaClick(mediaUrl)
                }
                className="max-w-full max-h-[300px] object-cover cursor-pointer hover:opacity-95 transition-opacity"
              />
            </div>
            {caption && <p className="px-1 text-sm font-body">{caption}</p>}
          </div>
        );

      case "document":
        return (
          <a
            href={mediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 bg-white border border-[#e1e3e4] rounded-xl p-3 hover:bg-[#f8f9fa] transition-colors group no-underline"
          >
            <div className="w-10 h-10 rounded-lg bg-[#cfe6f2] flex items-center justify-center text-[#003752] group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-xl">
                description
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-headline font-bold text-[#191c1d] truncate">
                {caption || "Attached Document"}
              </p>
              <p className="text-[10px] text-[#727780] font-medium uppercase tracking-wider">
                {mimeType?.split("/")[1] || "FILE"} • Download
              </p>
            </div>
            <span className="material-symbols-outlined text-[#727780] text-sm">
              download
            </span>
          </a>
        );

      case "video":
        return (
          <div className="rounded-xl overflow-hidden shadow-sm border border-[#e1e3e4]/50 bg-black">
            <video
              src={mediaUrl}
              controls={false}
              onClick={() => onMediaClick && mediaUrl && onMediaClick(mediaUrl)}
              className="max-w-full max-h-[300px] cursor-pointer hover:opacity-95 transition-opacity"
            />
          </div>
        );

      case "audio":
        return (
          <div className="flex flex-col gap-2 min-w-[220px]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#cfe6f2] flex items-center justify-center text-[#003752]">
                <span className="material-symbols-outlined text-lg">mic</span>
              </div>
              <audio
                src={mediaUrl}
                controls
                className="flex-1 h-8 accent-[#003752]"
              />
            </div>
            {caption && (
              <p className="text-[10px] text-[#727780] font-medium uppercase tracking-wider px-1">
                {caption}
              </p>
            )}
          </div>
        );
      
      case "location": {
        const [lat, lng, locName, locAddr] = (text || "").split(",");
        return (
          <a
            href={`https://www.google.com/maps?q=${lat},${lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col gap-0 min-w-[240px] max-w-sm rounded-xl overflow-hidden border border-[#e1e3e4] bg-white group transition-all hover:border-[#003752] no-underline"
          >
            <div className="h-24 bg-[#cfe6f2] flex items-center justify-center relative overflow-hidden group-hover:bg-[#daeffa] transition-colors">
              <span className="material-symbols-outlined text-4xl text-[#003752] z-10 transition-transform group-hover:scale-110">
                location_on
              </span>
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_2px_2px,_#003752_1px,_transparent_0)] bg-[length:12px_12px]"></div>
            </div>
            <div className="p-3 border-t border-[#e1e3e4]">
              <h5 className="text-sm font-headline font-bold text-[#191c1d] truncate">
                {locName || "Shared Location"}
              </h5>
              <p className="text-[10px] text-[#727780] font-medium line-clamp-1 mt-0.5">
                {locAddr || `${lat}, ${lng}`}
              </p>
            </div>
          </a>
        );
      }

      case "contacts": {
        const [contactName, contactPhone] = (text || "").split("|");
        return (
          <div className="flex items-center gap-3 bg-white border border-[#e1e3e4] rounded-xl p-3 min-w-[200px] shadow-sm">
            <div className="w-10 h-10 rounded-full bg-[#cfe6f2] flex items-center justify-center text-[#003752] font-headline font-bold text-sm">
              {contactName?.charAt(0) || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-headline font-bold text-[#191c1d] truncate">
                {contactName || "Unknown Contact"}
              </p>
              <p className="text-[10px] font-medium text-[#727780] tracking-wider">
                {contactPhone || "No Phone Number"}
              </p>
            </div>
            <button className="material-symbols-outlined text-[#727780] text-sm hover:text-[#003752] transition-colors">
              person_add
            </button>
          </div>
        );
      }

      case "sticker":
        return (
          <div className="w-32 h-32">
            <img src={mediaUrl} alt="Sticker" className="w-full h-full object-contain" />
          </div>
        );

      default:
        return <p className="whitespace-pre-wrap font-body">{text}</p>;
    }
  };

  return (
    <div
      className={`flex w-full mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
        isMe ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`flex flex-col gap-1 ${
          isMe ? "items-end" : "items-start"
        } max-w-[75%]`}
      >
        <div
          className={`transition-all duration-200 ${
            type === "text"
              ? `px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed ${
                  isMe
                    ? "bg-[#003752] text-white rounded-tr-none shadow-md font-medium"
                    : "bg-white text-[#191c1d] rounded-tl-none border border-[#e1e3e4]/50"
                }`
              : type === "sticker"
              ? "" // No bubble for stickers
              : "px-1 py-1" // Minimal padding for other media
          }`}
        >
          {renderContent()}
        </div>

        <div
          className={`flex items-center gap-1.5 px-1 ${
            isMe ? "justify-end" : "justify-start"
          }`}
        >
          <span className="text-[10px] text-[#727780] font-medium font-body tabular-nums">
            {time}
          </span>
          {isMe && status && (
            <span
              className={`material-symbols-outlined text-xs ${
                status === "read" ? "text-[#3de273]" : "text-[#727780]"
              }`}
            >
              {status === "read" ? "done_all" : "done"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
