"use client";

import { supabase } from "@/lib/supabase";
import { Contact } from "@/types";
import { useCallback, useEffect, useState } from "react";

interface ContactDetailsProps {
  contact: Contact | null;
  onClose?: () => void;
}

const ContactDetails = ({ contact, onClose }: ContactDetailsProps) => {
  const [sharedMedia, setSharedMedia] = useState<string[]>([]);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagText, setNewTagText] = useState("");
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  const fetchSharedMedia = useCallback(async () => {
    if (!contact?.phone) return;
    const { data } = await supabase
      .from("messages")
      .select("media_url")
      .eq("contact_phone", contact.phone)
      .eq("message_type", "image")
      .not("media_url", "is", null)
      .order("created_at", { ascending: false });

    if (data) {
      setSharedMedia(data.map((m) => m.media_url).filter(Boolean) as string[]);
    }
  }, [contact?.phone]);

  useEffect(() => {
    if (contact?.phone) {
      fetchSharedMedia();
      setNoteText(contact.internal_notes || "");
    }
  }, [contact?.phone, contact?.internal_notes, fetchSharedMedia]);

  const saveNote = async () => {
    if (!contact) return;
    await fetch("/api/whatsapp/contact", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: contact.phone,
        internal_notes: noteText.trim() || null,
      }),
    });
    setIsEditingNote(false);
  };

  const addTag = async () => {
    if (!contact || !newTagText.trim()) {
      setIsAddingTag(false);
      return;
    }
    const newTags = [...(contact.tags || []), newTagText.trim()];
    await fetch("/api/whatsapp/contact", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: contact.phone,
        tags: newTags,
      }),
    });
    setNewTagText("");
    setIsAddingTag(false);
  };

  if (!contact) return null;

  return (
    <aside className="w-full bg-[#f3f4f5] hidden xl:flex flex-col border-l border-[#e1e3e4] animate-in slide-in-from-right duration-300">
      <div className="h-16 flex items-center justify-between px-6 border-b border-[#e1e3e4]">
        <h3 className="font-headline font-bold text-[10px] tracking-widest uppercase text-[#727780]">
          Contact Details
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#e7e8e9] transition-colors text-[#727780]"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        )}
      </div>

      <div className="p-6 space-y-8 overflow-y-auto no-scrollbar">
        {/* Profile Card */}
        <div className="text-center">
          <div className="relative inline-block mb-4">
            <div className="w-24 h-24 rounded-full mx-auto bg-[#cfe6f2] flex items-center justify-center text-[#526772] font-headline font-bold text-2xl overflow-hidden ring-4 ring-white shadow-lg">
              {contact.avatar_url ? (
                <img
                  src={contact.avatar_url}
                  alt={contact.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                contact.name?.charAt(0) || contact.phone.charAt(0)
              )}
            </div>
          </div>
          <h4 className="font-headline font-bold text-lg text-[#191c1d]">
            {contact.name || contact.phone}
          </h4>
          <p className="text-xs text-[#727780] font-medium font-body mt-1">
            {contact.description || "Verified Contact"}
          </p>
        </div>

        {/* Info List */}
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#727780]">
              Phone
            </span>
            <span className="text-sm font-semibold text-[#191c1d]">
              {contact.phone}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#727780]">
              Last Activity
            </span>
            <span className="text-sm font-semibold text-[#191c1d]">
              {new Date(contact.last_message_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Shared Media */}
        <div className="space-y-4">
          <h5 className="text-[10px] font-bold uppercase tracking-widest text-[#727780]">
            Shared Media
          </h5>
          <div className="grid grid-cols-3 gap-2">
            {sharedMedia.length > 0 ? (
              sharedMedia.slice(0, 5).map((url, i) => (
                <div
                  key={i}
                  onClick={() => setIsMediaModalOpen(true)}
                  className="w-full aspect-square rounded-lg bg-[#e1e3e4] overflow-hidden border border-[#e1e3e4] cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <img
                    src={url}
                    alt="Shared media"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))
            ) : (
              <p className="text-xs text-[#727780] italic col-span-3">
                No shared media yet.
              </p>
            )}
            {sharedMedia.length > 5 && (
              <div
                onClick={() => setIsMediaModalOpen(true)}
                className="w-full aspect-square rounded-lg bg-[#edeeef] flex flex-col items-center justify-center text-[#727780] cursor-pointer hover:bg-[#e7e8e9] transition-colors"
              >
                <span className="material-symbols-outlined text-lg">image</span>
                <span className="text-[8px] font-bold mt-1">
                  +{sharedMedia.length - 5}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Project Tags Placeholder */}
        <div className="space-y-4">
          <h5 className="text-[10px] font-bold uppercase tracking-widest text-[#727780]">
            Project Tags
          </h5>
          <div className="flex flex-wrap gap-2 items-center">
            {(contact.tags || []).map((tag: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full bg-[#cfe6f2] text-[#526772] text-[10px] font-bold flex items-center gap-1 group"
              >
                {tag}
                <button
                  onClick={async () => {
                    if (!confirm(`Remove tag "${tag}"?`)) return;
                    const newTags = (contact.tags || []).filter(
                      (_: unknown, i: number) => i !== index
                    );
                    await fetch("/api/whatsapp/contact", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        phone: contact.phone,
                        tags: newTags,
                      }),
                    });
                  }}
                  className="hidden group-hover:flex items-center justify-center w-3 h-3 rounded-full hover:bg-[#003752] hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-[10px]">
                    close
                  </span>
                </button>
              </span>
            ))}

            {isAddingTag ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  autoFocus
                  value={newTagText}
                  onChange={(e) => setNewTagText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTag()}
                  onBlur={() => {
                    if (newTagText.trim()) addTag();
                    else setIsAddingTag(false);
                  }}
                  className="px-3 py-1 w-24 rounded-full bg-white text-xs border border-[#e1e3e4] focus:outline-none focus:border-[#003752]"
                  placeholder="New tag..."
                />
              </div>
            ) : (
              <button
                onClick={() => setIsAddingTag(true)}
                className="w-6 h-6 rounded-full border border-dashed border-[#727780] flex items-center justify-center text-[#727780] hover:border-[#003752] hover:text-[#003752]"
              >
                <span className="material-symbols-outlined text-sm">add</span>
              </button>
            )}
          </div>
        </div>

        {/* Internal Notes Placeholder */}
        <div className="space-y-4 pt-4 border-t border-[#e1e3e4]">
          <div className="flex items-center justify-between">
            <h5 className="text-[10px] font-bold uppercase tracking-widest text-[#727780]">
              Internal Notes
            </h5>
            {!isEditingNote && (
              <button
                onClick={() => setIsEditingNote(true)}
                className="text-[10px] font-bold text-[#003752] hover:underline cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[12px]">
                  edit
                </span>{" "}
                Edit
              </button>
            )}
          </div>

          {isEditingNote ? (
            <div className="space-y-2">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={3}
                placeholder="Type your note here..."
                className="w-full bg-white border border-[#e1e3e4] rounded-lg p-2 text-xs font-body text-[#191c1d] focus:outline-none focus:border-[#003752] resize-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditingNote(false)}
                  className="px-3 py-1 text-xs text-[#727780] hover:bg-[#e1e3e4] rounded-full transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveNote}
                  className="px-3 py-1 text-xs bg-[#003752] text-white rounded-full hover:bg-[#00283c] transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          ) : contact.internal_notes ? (
            <p className="text-xs font-body text-[#191c1d] leading-relaxed wrap-break-word whitespace-pre-wrap">
              {contact.internal_notes}
            </p>
          ) : (
            <p className="text-xs font-body text-[#727780] italic">
              No internal notes yet.
            </p>
          )}
        </div>

        {/* AI Summary Placeholder */}
        <div className="space-y-4 pt-4 border-t border-[#e1e3e4]">
          <div className="flex items-center justify-between">
            <h5 className="text-[10px] font-bold uppercase tracking-widest text-[#727780]">
              AI Summary
            </h5>
            <button
              onClick={async () => {
                try {
                  const res = await fetch("/api/whatsapp/summary", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ phone: contact.phone }),
                  });
                  if (!res.ok) throw new Error("Failed to generate summary");
                  // The webhook handles the response and realtime DB updates the UI automatically
                } catch (e) {
                  console.error(e);
                  alert("Failed to generate AI summary.");
                }
              }}
              className="text-[10px] font-bold text-[#003752] hover:underline cursor-pointer flex items-center gap-1"
              title="Generate New Summary"
            >
              <span className="material-symbols-outlined text-[12px]">
                auto_awesome
              </span>{" "}
              Update
            </button>
          </div>
          {contact.ai_summary ? (
            <p className="text-xs font-body text-[#191c1d] leading-relaxed">
              {contact.ai_summary}
            </p>
          ) : (
            <p className="text-xs font-body text-[#727780] italic">
              Click &quot;Update&quot; to generate an AI Summary.
            </p>
          )}
        </div>
      </div>

      {/* Media Overlay Modal */}
      {isMediaModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-200"
          onClick={() => setIsMediaModalOpen(false)}
        >
          <button
            className="fixed top-6 right-6 text-white hover:text-gray-300 bg-black/50 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
            onClick={() => setIsMediaModalOpen(false)}
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>

          <div
            className="w-full h-full max-w-5xl max-h-screen bg-[#191c1d] rounded-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()} // Prevent click from closing when clicking inside
          >
            <div className="p-4 border-b border-[#2d3133] flex justify-between items-center bg-[#191c1d]">
              <h3 className="text-white font-headline font-semibold">
                Shared Media ({sharedMedia.length})
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {sharedMedia.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="aspect-square rounded-xl overflow-hidden bg-[#2d3133] hover:opacity-80 transition-opacity relative group"
                >
                  <img
                    src={url}
                    alt="Shared media"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <span className="material-symbols-outlined text-white opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full p-2">
                      open_in_new
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default ContactDetails;
