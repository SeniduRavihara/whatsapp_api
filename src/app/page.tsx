"use client";

import ChatWindow from "@/components/inbox/ChatWindow";
import ContactDetails from "@/components/inbox/ContactDetails";
import ConversationList from "@/components/inbox/ConversationList";
import Resizer from "@/components/inbox/Resizer";
import Sidebar from "@/components/inbox/Sidebar";
import { supabase } from "@/lib/supabase";
import { Contact } from "@/types";
import React, { useCallback, useEffect, useRef, useState } from "react";

export default function Home() {
  const [selectedContactPhone, setSelectedContactPhone] = useState<
    string | null
  >(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // Resizing States
  const [listWidth, setListWidth] = useState(350);
  const [detailsWidth, setDetailsWidth] = useState(320);
  const [isResizingList, setIsResizingList] = useState(false);
  const [isResizingDetails, setIsResizingDetails] = useState(false);

  // Collapse States
  const [listMode, setListMode] = useState<"open" | "mini" | "closed">("open");
  const [isDetailsCollapsed, setIsDetailsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("Chat");

  const mainRef = useRef<HTMLDivElement>(null);

  const fetchSelectedContact = useCallback(async () => {
    if (!selectedContactPhone) return;
    const { data } = await supabase
      .from("contacts")
      .select("*")
      .eq("phone", selectedContactPhone)
      .single();
    setSelectedContact(data);
  }, [selectedContactPhone]);

  useEffect(() => {
    if (selectedContactPhone) {
      fetchSelectedContact();
      setIsDetailsCollapsed(false); // Auto-open details when a contact is selected
    } else {
      setSelectedContact(null);
    }
  }, [selectedContactPhone, fetchSelectedContact]);

  useEffect(() => {
    if (!selectedContactPhone) return;
    const channel = supabase
      .channel(`public:contacts:${selectedContactPhone}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "contacts",
          filter: `phone=eq.${selectedContactPhone}`,
        },
        () => {
          fetchSelectedContact();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedContactPhone, fetchSelectedContact]);

  // Dragging Logic
  const startResizingList = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (listMode !== "open") return;
      setIsResizingList(true);
    },
    [listMode]
  );

  const startResizingDetails = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (isDetailsCollapsed) return;
      setIsResizingDetails(true);
    },
    [isDetailsCollapsed]
  );

  const stopResizing = useCallback(() => {
    setIsResizingList(false);
    setIsResizingDetails(false);
  }, []);

  const resize = useCallback(
    (e: MouseEvent) => {
      if (isResizingList) {
        const newWidth = e.clientX - 80; // Offset for sidebar
        if (newWidth > 200 && newWidth < 600) {
          setListWidth(newWidth);
        }
      }
      if (isResizingDetails) {
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth > 250 && newWidth < 500) {
          setDetailsWidth(newWidth);
        }
      }
    },
    [isResizingList, isResizingDetails]
  );

  useEffect(() => {
    if (isResizingList || isResizingDetails) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
    }
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizingList, isResizingDetails, resize, stopResizing]);

  return (
    <main
      ref={mainRef}
      className={`flex h-screen w-screen overflow-hidden bg-[#f8f9fa] text-[#191c1d] antialiased font-sans ${
        isResizingList || isResizingDetails
          ? "cursor-col-resize select-none"
          : ""
      }`}
    >
      {/* 1. Shared SideNavBar (Stitch Style) */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Wrapper (ml-20 to offset the fixed sidebar) */}
      <div className="flex-1 ml-20 flex h-full overflow-hidden">
        {activeTab === "Chat" ? (
          <>
            {/* 2. Middle Pane: Conversation List */}
            {listMode !== "closed" && (
              <div
                style={{
                  width: listMode === "mini" ? "80px" : `${listWidth}px`,
                }}
                className="shrink-0 flex h-full border-r border-[#e1e3e4] transition-all duration-300"
              >
                <ConversationList
                  selectedPhone={selectedContactPhone}
                  onSelect={setSelectedContactPhone}
                  mode={listMode === "mini" ? "mini" : "open"}
                />
              </div>
            )}

            {/* Resizer for List (Only show if open) */}
            {listMode === "open" && <Resizer onMouseDown={startResizingList} />}

            {/* 3. Main Center Pane: Chat Window & 4. Right Drawer: Contact Details */}
            <div className="flex-1 flex overflow-hidden">
              {selectedContactPhone ? (
                <>
                  <ChatWindow
                    contactPhone={selectedContactPhone}
                    listMode={listMode}
                    onToggleList={() => {
                      if (listMode === "open") setListMode("mini");
                      else if (listMode === "mini") setListMode("closed");
                      else setListMode("open");
                    }}
                    isDetailsCollapsed={isDetailsCollapsed}
                    onToggleDetails={() =>
                      setIsDetailsCollapsed(!isDetailsCollapsed)
                    }
                  />

                  {!isDetailsCollapsed && (
                    <>
                      {/* Resizer for Details */}
                      <Resizer onMouseDown={startResizingDetails} />

                      <div
                        style={{ width: `${detailsWidth}px` }}
                        className="shrink-0 flex h-full"
                      >
                        <ContactDetails
                          contact={selectedContact}
                          onClose={() => setIsDetailsCollapsed(true)}
                        />
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center bg-[#f8f9fa] p-8 text-center">
                  <div className="max-w-md">
                    <h1 className="font-headline font-bold text-4xl mb-4 text-[#003752]">
                      Command Center
                    </h1>
                    <p className="font-headline font-medium text-2xl text-[#727780] mb-8">
                      Focused Productivity.
                    </p>
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#edeeef]">
                      <p className="text-sm font-bold text-[#191c1d] mb-2">
                        Select a conversation
                      </p>
                      <p className="text-xs text-[#727780]">
                        Click an active thread on the left to begin executive
                        communication.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#f8f9fa] p-8 text-center">
            <h1 className="font-headline font-bold text-4xl mb-4 text-[#003752]">
              {activeTab}
            </h1>
            <p className="text-[#727780]">Dashboard module coming soon.</p>
          </div>
        )}
      </div>
    </main>
  );
}
