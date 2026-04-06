"use client";

import React from 'react';
import { Contact } from '@/types';

interface ContactDetailsProps {
  contact: Contact | null;
  onClose?: () => void;
}

const ContactDetails = ({ contact, onClose }: ContactDetailsProps) => {
  if (!contact) return null;

  return (
    <aside className="w-full bg-[#f3f4f5] hidden xl:flex flex-col border-l border-[#e1e3e4] animate-in slide-in-from-right duration-300">
      <div className="h-16 flex items-center justify-between px-6 border-b border-[#e1e3e4]">
        <h3 className="font-headline font-bold text-[10px] tracking-widest uppercase text-[#727780]">Contact Details</h3>
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
                <img src={contact.avatar_url} alt={contact.name} className="w-full h-full object-cover" />
              ) : (
                contact.name?.charAt(0) || contact.phone.charAt(0)
              )}
            </div>
          </div>
          <h4 className="font-headline font-bold text-lg text-[#191c1d]">{contact.name || contact.phone}</h4>
          <p className="text-xs text-[#727780] font-medium font-body mt-1">{contact.description || 'Verified Contact'}</p>
        </div>

        {/* Info List */}
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#727780]">Phone</span>
            <span className="text-sm font-semibold text-[#191c1d]">{contact.phone}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#727780]">Last Activity</span>
            <span className="text-sm font-semibold text-[#191c1d]">
              {new Date(contact.last_message_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Shared Media Placeholder */}
        <div className="space-y-4">
          <h5 className="text-[10px] font-bold uppercase tracking-widest text-[#727780]">Shared Media</h5>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2].map((i) => (
              <div key={i} className="w-full aspect-square rounded-lg bg-[#e1e3e4] animate-pulse"></div>
            ))}
            <div className="w-full aspect-square rounded-lg bg-[#edeeef] flex flex-col items-center justify-center text-[#727780] cursor-pointer hover:bg-[#e7e8e9] transition-colors">
              <span className="material-symbols-outlined text-lg">image</span>
              <span className="text-[8px] font-bold mt-1">+0</span>
            </div>
          </div>
        </div>

        {/* Project Tags Placeholder */}
        <div className="space-y-4">
          <h5 className="text-[10px] font-bold uppercase tracking-widest text-[#727780]">Project Tags</h5>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full bg-[#cfe6f2] text-[#526772] text-[10px] font-bold">CLIENT</span>
            <span className="px-3 py-1 rounded-full bg-[#005624]/10 text-[#005624] text-[10px] font-bold">WHATSAPP</span>
            <button className="w-6 h-6 rounded-full border border-dashed border-[#727780] flex items-center justify-center text-[#727780] hover:border-[#003752] hover:text-[#003752]">
               <span className="material-symbols-outlined text-sm">add</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default ContactDetails;
