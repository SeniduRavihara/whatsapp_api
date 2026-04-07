"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Contact } from "@/types";
import { Search, Plus, MoreVertical, Edit2, Trash2, MessagesSquare } from "lucide-react";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  
  // New Contact State
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");

  useEffect(() => {
    fetchContacts();
    
    // Subscribe to changes
    const channel = supabase
      .channel("public:contacts")
      .on("postgres_changes", { event: "*", schema: "public", table: "contacts" }, () => {
        fetchContacts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchContacts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .order("last_message_at", { ascending: false });
    
    if (!error && data) {
      setContacts(data);
    }
    setIsLoading(false);
  };

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhone || !newName) return;
    
    // Strip everything but numbers for phone
    const cleanPhone = newPhone.replace(/\D/g, "");
    
    const { error } = await supabase
      .from("contacts")
      .insert([
        { 
          phone: cleanPhone, 
          name: newName,
          last_message: "Contact added manually",
          last_message_at: new Date().toISOString()
        }
      ]);
      
    if (!error) {
      setNewName("");
      setNewPhone("");
      setIsAdding(false);
    } else {
      alert("Failed to create contact.");
    }
  };

  const handleDelete = async (phone: string) => {
    if (!window.confirm("Are you sure you want to delete this contact?")) return;
    await supabase.from("contacts").delete().eq("phone", phone);
  };

  const filteredContacts = contacts.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <div className="flex-1 p-8 bg-[#f8f9fa] h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#003752] mb-2">Contacts</h1>
            <p className="text-[#727780]">Manage your synchronized contacts and CRM data.</p>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 bg-[#00a884] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#008f6f] transition-colors"
          >
            <Plus size={18} />
            Add Contact
          </button>
        </div>
        
        {isAdding && (
          <div className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-[#edeeef]">
            <h2 className="text-lg font-bold mb-4">New Contact</h2>
            <form onSubmit={handleCreateContact} className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1 text-[#727780]">Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full border border-[#edeeef] rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#00a884]"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1 text-[#727780]">Phone Number</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full border border-[#edeeef] rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#00a884]"
                  placeholder="1234567890"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-[#003752] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#002b40] transition-colors"
              >
                Save
              </button>
            </form>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-[#edeeef] overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#edeeef] flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#727780]" size={18} />
              <input
                type="text"
                placeholder="Search contacts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#f8f9fa] border-none rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00a884]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8f9fa] text-xs uppercase tracking-wider text-[#727780]">
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium">Phone</th>
                  <th className="px-6 py-4 font-medium">Tags</th>
                  <th className="px-6 py-4 font-medium">Last Activity</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edeeef]">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-[#727780]">
                      Loading contacts...
                    </td>
                  </tr>
                ) : filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-[#727780]">
                      No contacts found.
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-[#f8f9fa] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00a884] to-[#003752] flex items-center justify-center text-white font-bold shrink-0 shadow-sm overflow-hidden">
                            {contact.avatar_url ? (
                              <img src={contact.avatar_url} alt={contact.name} className="w-full h-full object-cover" />
                            ) : (
                              (contact.name || "?")[0].toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-[#191c1d]">{contact.name || contact.phone}</div>
                            {contact.description && (
                              <div className="text-xs text-[#727780] max-w-[200px] truncate">
                                {contact.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-[#4a4e53]">
                        {contact.phone}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {contact.tags && contact.tags.length > 0 ? (
                            contact.tags.map((tag, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-[#e0f2f1] text-[#00796b] text-xs font-medium rounded-full"
                              >
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-[#a0a5ab] italic">No tags</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-[#191c1d]">
                          {new Date(contact.last_message_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-[#727780] max-w-[200px] truncate">
                          {contact.last_message}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            title="Delete Contact"
                            onClick={() => handleDelete(contact.phone)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
