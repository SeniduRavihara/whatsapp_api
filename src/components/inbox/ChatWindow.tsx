"use client";

import { supabase } from "@/lib/supabase";
import { Contact, Message } from "@/types";
import React, { useEffect, useRef, useState } from "react";
import MessageItem from "./MessageItem";

interface ChatWindowProps {
  contactPhone: string;
  listMode?: "open" | "mini" | "closed";
  onToggleList?: () => void;
  isDetailsCollapsed?: boolean;
  onToggleDetails?: () => void;
}

const ChatWindow = ({
  contactPhone,
  listMode = "open",
  onToggleList,
  isDetailsCollapsed,
  onToggleDetails,
}: ChatWindowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFilePreview, setSelectedFilePreview] = useState<string | null>(
    null
  );
  const [galleryMediaIndex, setGalleryMediaIndex] = useState<number | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute media items for gallery
  const chatMedia = messages.filter(
    (m) =>
      (m.message_type === "image" || m.message_type === "video") && m.media_url
  );

  useEffect(() => {
    return () => {
      // Cleanup object URL to avoid memory leaks
      if (selectedFilePreview) {
        URL.revokeObjectURL(selectedFilePreview);
      }
    };
  }, [selectedFilePreview]);

  useEffect(() => {
    fetchContact();
    fetchMessages();

    // Subscribe to messages for THIS contact
    const channel = supabase
      .channel(`chat:${contactPhone}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `contact_phone=eq.${contactPhone}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setMessages((prev) => [...prev, payload.new as Message]);
          } else if (payload.eventType === "UPDATE") {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === payload.new.id ? (payload.new as Message) : m
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [contactPhone]);

  const fetchContact = async () => {
    const { data } = await supabase
      .from("contacts")
      .select("*")
      .eq("phone", contactPhone)
      .single();
    setContact(data);
  };

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("contact_phone", contactPhone)
      .order("created_at", { ascending: true });

    if (!error) {
      setMessages(data || []);

      // Attempt to clear unread counts / send read receipt
      if (data?.some((m) => m.sender === "them" && m.status !== "read")) {
        fetch("/api/whatsapp/read", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: contactPhone }),
        }).catch((err) => console.error("Failed to send read receipt", err));
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if ((!messageText.trim() && !selectedFile) || isSending) return;

    setIsSending(true);
    try {
      if (selectedFile) {
        // 1. Upload to Supabase Storage
        const fileName = `${Date.now()}-${selectedFile.name.replace(
          /[^a-zA-Z0-9.-]/g,
          "_"
        )}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("whatsapp_media")
          .upload(fileName, selectedFile, {
            contentType: selectedFile.type,
            upsert: true,
          });

        if (uploadError) {
          console.error("Upload Error:", uploadError);
          setIsSending(false);
          return;
        }

        // 2. Get Public URL
        const { data: publicUrlData } = supabase.storage
          .from("whatsapp_media")
          .getPublicUrl(fileName);

        const mediaUrl = publicUrlData.publicUrl;

        // 3. Determine WhatsApp media type
        let type = "document";
        if (selectedFile.type.startsWith("image/")) type = "image";
        else if (selectedFile.type.startsWith("video/")) type = "video";
        else if (selectedFile.type.startsWith("audio/")) type = "audio";

        // 4. Send message via API
        const response = await fetch("/api/whatsapp/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: contactPhone,
            type,
            mediaUrl,
            mimeType: selectedFile.type,
            caption: messageText.trim() || undefined,
          }),
        });

        if (response.ok) {
          setMessageText("");
          setSelectedFile(null);
          setSelectedFilePreview(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
        } else {
          const error = await response.json();
          console.error("Failed to send media:", error);
        }
      } else {
        const response = await fetch("/api/whatsapp/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: contactPhone,
            text: messageText.trim(),
          }),
        });

        if (response.ok) {
          setMessageText("");
        } else {
          const error = await response.json();
          console.error("Failed to send:", error);
        }
      }
    } catch (error) {
      console.error("Error sending:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setSelectedFilePreview(objectUrl);
  };

  const handleGenerateSummary = async () => {
    try {
      const res = await fetch("/api/whatsapp/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: contactPhone }),
      });
      if (!res.ok) throw new Error("Failed to generate summary");
      const data = await res.json();

      fetchContact();
      alert(`AI Summary Generated:\n${data.summary}`);
    } catch (e) {
      console.error(e);
      alert("Failed to generate AI summary.");
    }
  };

  const handleInternalNote = async () => {
    const note = prompt("Enter an internal note:");
    if (note) {
      try {
        await fetch("/api/whatsapp/contact", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: contactPhone, internal_notes: note }),
        });
        fetchContact();
      } catch (e) {
        console.error(e);
        alert("Failed to save note");
      }
    }
  };

  return (
    <section className="flex-1 bg-[#f8f9fa] flex flex-col relative">
      {/* Stitch Header */}
      <header className="h-16 flex items-center justify-between px-8 bg-white/70 backdrop-blur-md sticky top-0 z-10 border-b border-[#e1e3e4]">
        <div className="flex items-center gap-4">
          {onToggleList && (
            <button
              onClick={onToggleList}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#edeeef] transition-colors text-[#727780] hover:text-[#003752]"
              title="Toggle List Layout"
            >
              <span className="material-symbols-outlined">
                {listMode === "open" ? "menu_open" : "menu"}
              </span>
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-[#cfe6f2] flex items-center justify-center text-[#526772] font-headline font-bold overflow-hidden border border-[#e1e3e4]">
                {contact?.avatar_url ? (
                  <img
                    src={contact.avatar_url}
                    alt={contact.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  contact?.name?.charAt(0) || contactPhone.charAt(0)
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#3de273] rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h1 className="font-headline font-bold text-lg leading-tight text-[#003752]">
                {contact?.name || contactPhone}
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[11px] font-bold text-[#727780] uppercase tracking-wider">
                  Online
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateSummary}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-[#edeeef] hover:bg-[#e7e8e9] transition-colors text-xs font-semibold font-headline text-[#191c1d]"
          >
            <span className="material-symbols-outlined text-sm">summarize</span>
            Generate AI Summary
          </button>
          <button
            onClick={handleInternalNote}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-[#edeeef] hover:bg-[#e7e8e9] transition-colors text-xs font-semibold font-headline text-[#191c1d]"
          >
            <span className="material-symbols-outlined text-sm">label</span>
            Internal Note
          </button>
          <button
            onClick={() =>
              alert(
                "Enterprise video/audio calling is only supported on the official mobile app client."
              )
            }
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#1d4e6c] text-white hover:opacity-90 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined">videocam</span>
          </button>
          {onToggleDetails && (
            <button
              onClick={onToggleDetails}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all shadow-sm ${
                !isDetailsCollapsed
                  ? "bg-[#003752] text-white"
                  : "bg-[#edeeef] text-[#727780] hover:bg-[#e7e8e9]"
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontVariationSettings: !isDetailsCollapsed ? "'FILL' 1" : "",
                }}
              >
                info
              </span>
            </button>
          )}
        </div>
      </header>

      {/* Chat Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar"
      >
        {/* System Message Example */}
        <div className="flex justify-center mb-4">
          <div className="bg-[#cfe6f2]/50 text-[#526772] px-4 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-2 border border-[#cfe6f2]">
            <span className="material-symbols-outlined text-xs">
              auto_awesome
            </span>
            AI translation active for this conversation
          </div>
        </div>

        {messages.map((msg) => (
          <MessageItem
            key={msg.id}
            id={msg.id}
            text={msg.text}
            sender={msg.sender}
            time={new Date(msg.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
            status={msg.status}
            type={msg.message_type as any}
            mediaUrl={msg.media_url}
            mimeType={msg.mime_type}
            caption={msg.caption}
            onMediaClick={(url) => {
              const i = chatMedia.findIndex((m) => m.media_url === url);
              if (i >= 0) setGalleryMediaIndex(i);
            }}
          />
        ))}

        {loading && messages.length === 0 && (
          <div className="text-center p-8 text-[#727780] text-xs font-medium">
            Fetching history...
          </div>
        )}
      </div>

      {/* Stitch Footer Input */}
      <footer className="p-6 bg-white border-t border-[#e1e3e4]">
        <div className="max-w-4xl mx-auto flex flex-col gap-3">
          <div className="flex gap-2 mb-1 overflow-x-auto no-scrollbar">
            {[
              "Quick Hello",
              "Pricing Details",
              "Meeting Link",
              "Next Steps",
            ].map((chip) => (
              <button
                key={chip}
                onClick={() => setMessageText(chip)}
                className="px-3 py-1.5 rounded-full bg-[#f3f4f5] hover:bg-[#e7e8e9] transition-colors text-[11px] font-bold text-[#42474f] whitespace-nowrap"
              >
                {chip}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-2 flex flex-col gap-2 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-[#e1e3e4] focus-within:border-[#003752]/30 transition-all relative">
            {/* MEDIA PREVIEW SECTION */}
            {selectedFilePreview && (
              <div className="relative self-start mt-2 ml-2 mb-1 group">
                {selectedFile?.type.startsWith("image/") ? (
                  <img
                    src={selectedFilePreview}
                    alt="Preview"
                    className="h-32 rounded-lg object-cover border border-[#e1e3e4] shadow-sm bg-[#f8f9fa]"
                  />
                ) : selectedFile?.type.startsWith("video/") ? (
                  <video
                    src={selectedFilePreview}
                    className="h-32 rounded-lg object-cover border border-[#e1e3e4] shadow-sm bg-[#f8f9fa]"
                    controls
                  />
                ) : (
                  <div className="h-32 w-32 rounded-lg bg-[#f8f9fa] border border-[#e1e3e4] flex flex-col items-center justify-center text-[#727780]">
                    <span className="material-symbols-outlined text-4xl">
                      draft
                    </span>
                    <span className="text-xs font-bold mt-2 max-w-full truncate px-2">
                      {selectedFile?.name}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setSelectedFilePreview(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full p-1 shadow-md hover:bg-red-50 transition-colors border border-[#e1e3e4] z-10 flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-sm block">
                    close
                  </span>
                </button>
              </div>
            )}

            <div className="flex items-end gap-3 w-full">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileUpload}
                accept="image/*,video/*,audio/*,application/pdf"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isSending}
                className="w-10 h-10 flex items-center justify-center text-[#727780] hover:text-[#003752] transition-colors shrink-0 mb-1"
              >
                <span className="material-symbols-outlined">add</span>
              </button>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSending}
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-body py-2.5 resize-none max-h-32 min-h-[44px]"
                placeholder="Type your message here..."
                rows={1}
              />
              <div className="flex items-center gap-2 pb-1 pr-1 shrink-0 mb-1">
                <button
                  onClick={() => setMessageText((prev) => prev + "😊")}
                  className="w-10 h-10 flex items-center justify-center text-[#727780] hover:text-[#003752] transition-colors"
                  title="Add Emoji"
                >
                  <span className="material-symbols-outlined">mood</span>
                </button>
                <button
                  onClick={handleSend}
                  disabled={(!messageText.trim() && !selectedFile) || isSending}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-all active:scale-95 ${
                    (messageText.trim() || selectedFile) && !isSending
                      ? "bg-gradient-to-br from-[#003752] to-[#1d4e6c] text-white shadow-[#003752]/20"
                      : "bg-[#edeeef] text-[#727780] cursor-not-allowed"
                  }`}
                >
                  <span className="material-symbols-outlined">
                    {isSending ? "sync" : "send"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Media Overlay Modal (WhatsApp Gallery Style) */}
      {galleryMediaIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col animate-in fade-in duration-200"
          onClick={() => setGalleryMediaIndex(null)}
        >
          {/* Top Bar */}
          <div className="h-16 flex items-center justify-between px-6 bg-gradient-to-b from-black/80 to-transparent">
            {/* Download/Open Button */}
            <a
              href={chatMedia[galleryMediaIndex]?.media_url || "#"}
              target="_blank"
              rel="noreferrer"
              className="text-white/80 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
              onClick={(e) => e.stopPropagation()}
              title="Open Original"
            >
              <span className="material-symbols-outlined text-xl">
                open_in_new
              </span>
            </a>

            <button
              className="text-white/80 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
              onClick={() => setGalleryMediaIndex(null)}
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>

          {/* Main View Area */}
          <div
            className="flex-1 relative flex items-center justify-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Prev Button */}
            {galleryMediaIndex > 0 && (
              <button
                className="absolute left-4 md:left-12 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-10"
                onClick={() => setGalleryMediaIndex((prev) => prev! - 1)}
              >
                <span className="material-symbols-outlined text-2xl">
                  chevron_left
                </span>
              </button>
            )}

            {/* Current Media */}
            <div className="w-full h-full max-w-5xl max-h-[75vh] flex items-center justify-center p-4">
              {chatMedia[galleryMediaIndex]?.message_type === "video" ? (
                <video
                  src={chatMedia[galleryMediaIndex]?.media_url || ""}
                  controls
                  autoPlay
                  className="max-w-full max-h-full object-contain rounded-sm"
                />
              ) : (
                <img
                  src={chatMedia[galleryMediaIndex]?.media_url || ""}
                  alt="Gallery content"
                  className="max-w-full max-h-full object-contain rounded-sm"
                />
              )}
            </div>

            {/* Next Button */}
            {galleryMediaIndex < chatMedia.length - 1 && (
              <button
                className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-10"
                onClick={() => setGalleryMediaIndex((prev) => prev! + 1)}
              >
                <span className="material-symbols-outlined text-2xl">
                  chevron_right
                </span>
              </button>
            )}
          </div>

          {/* Bottom Thumbnails Strip */}
          <div
            className="h-32 bg-black flex items-center overflow-x-auto px-4 py-4 gap-2 no-scrollbar scroll-smooth"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex mx-auto gap-2 min-w-min">
              {chatMedia.map((media, i) => (
                <button
                  key={i}
                  onClick={() => setGalleryMediaIndex(i)}
                  className={`relative shrink-0 h-16 md:h-20 aspect-square overflow-hidden rounded-sm transition-all ${
                    galleryMediaIndex === i
                      ? "ring-2 ring-white scale-100 opacity-100"
                      : "opacity-40 hover:opacity-100 scale-95"
                  }`}
                >
                  {media.message_type === "video" ? (
                    <>
                      <video
                        src={media.media_url || ""}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <span className="material-symbols-outlined text-white text-lg drop-shadow-md">
                          play_circle
                        </span>
                      </div>
                    </>
                  ) : (
                    <img
                      src={media.media_url || ""}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ChatWindow;
