"use client";

import { supabase } from "@/lib/supabase";
import { Contact } from "@/types";
import { useEffect, useState } from "react";

interface ConversationListProps {
  selectedPhone: string | null;
  onSelect: (phone: string) => void;
  mode?: "open" | "mini";
}

const ConversationList = ({
  selectedPhone,
  onSelect,
  mode = "open",
}: ConversationListProps) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const isMini = mode === "mini";

  useEffect(() => {
    fetchContacts();

    // Subscribe to realtime updates for contacts table
    const channel = supabase
      .channel("public:contacts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contacts" },
        () => {
          fetchContacts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchContacts = async () => {
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .order("last_message_at", { ascending: false });

    if (error) {
      console.error("Error fetching contacts:", error);
    } else {
      setContacts(data || []);
    }
    setLoading(false);
  };

  return (
    <section className="w-full bg-[#f3f4f5] flex flex-col border-r border-[#e1e3e4] h-full overflow-hidden">
      {/* Header */}
      {!isMini && (
        <div className="p-6 h-16 flex items-center justify-between shrink-0">
          <h2 className="font-headline font-bold text-xl tracking-tight text-[#191c1d]">
            Messages
          </h2>
          <button
            className="material-symbols-outlined text-[#727780] cursor-pointer hover:text-[#003752]"
            title="New Conversation"
            data-icon="edit_square"
            onClick={async () => {
              const phone = prompt(
                "Enter international phone number (e.g. 1234567890):"
              );
              if (!phone) return;

              // Upsert contact
              const { error } = await supabase.from("contacts").upsert(
                {
                  phone,
                  name: "New Contact",
                },
                { onConflict: "phone" }
              );

              if (!error) {
                onSelect(phone);
              } else {
                alert("Failed to create conversation");
              }
            }}
          >
            edit_square
          </button>
        </div>
      )}

      {/* Search */}
      {!isMini && (
        <div className="px-4 py-2 shrink-0">
          <div className="bg-white rounded-full px-4 py-2 flex items-center gap-3 shadow-sm border border-[#e1e3e4]">
            <span
              className="material-symbols-outlined text-[#727780] text-sm"
              data-icon="search"
            >
              search
            </span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm w-full font-body placeholder-[#727780]"
              placeholder="Search conversations..."
              type="text"
            />
          </div>
        </div>
      )}

      {/* List */}
      <div
        className={`flex-1 overflow-y-auto no-scrollbar mt-4 space-y-1 ${
          isMini ? "px-2" : "px-2"
        }`}
      >
        {loading
          ? !isMini && (
              <div className="p-4 text-center text-[#727780] text-xs font-medium">
                Loading resources...
              </div>
            )
          : contacts.filter(
              (c) =>
                c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.phone.includes(searchQuery)
            ).length === 0
          ? !isMini && (
              <div className="p-4 text-center text-[#727780] text-xs font-medium">
                No active conversations
              </div>
            )
          : contacts
              .filter(
                (c) =>
                  c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  c.phone.includes(searchQuery)
              )
              .map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => onSelect(contact.phone)}
                  className={`rounded-xl flex items-center cursor-pointer transition-all duration-200 group relative ${
                    isMini ? "p-2 justify-center" : "p-4 gap-4"
                  } ${
                    selectedPhone === contact.phone
                      ? "bg-[#e7e8e9] shadow-sm"
                      : "hover:bg-[#edeeef]"
                  }`}
                  title={isMini ? contact.name || contact.phone : ""}
                >
                  <div className="relative flex-shrink-0">
                    <div
                      className={`${
                        isMini ? "w-10 h-10" : "w-12 h-12"
                      } rounded-full overflow-hidden border-2 ${
                        selectedPhone === contact.phone
                          ? "border-[#003752]"
                          : "border-transparent"
                      } transition-all`}
                    >
                      {contact.avatar_url ? (
                        <img
                          src={contact.avatar_url}
                          alt={contact.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#cfe6f2] flex items-center justify-center text-[#526772] font-headline font-bold text-sm uppercase">
                          {contact.name?.charAt(0) || "?"}
                        </div>
                      )}
                    </div>
                    <div
                      className={`absolute bottom-0 right-0 ${
                        isMini ? "w-2.5 h-2.5" : "w-3 h-3"
                      } bg-[#3de273] rounded-full border-2 border-white shadow-sm`}
                    ></div>
                  </div>

                  {!isMini && (
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span
                          className={`font-headline font-bold truncate text-sm tracking-tight ${
                            selectedPhone === contact.phone
                              ? "text-[#003752]"
                              : "text-[#191c1d]"
                          }`}
                        >
                          {contact.name || contact.phone}
                        </span>
                        <span className="text-[10px] text-[#727780] font-bold tabular-nums">
                          {new Date(contact.last_message_at).toLocaleTimeString(
                            [],
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </span>
                      </div>
                      <p
                        className={`text-xs truncate font-body leading-normal ${
                          contact.unread_count > 0
                            ? "text-[#191c1d] font-semibold"
                            : "text-[#42474f]"
                        }`}
                      >
                        {contact.last_message}
                      </p>
                    </div>
                  )}
                  {contact.unread_count > 0 && !isMini && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 bg-[#3de273] text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm">
                      {contact.unread_count}
                    </div>
                  )}
                </div>
              ))}
      </div>
    </section>
  );
};

export default ConversationList;
