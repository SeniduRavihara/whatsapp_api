"use client";

import React from 'react';

const Sidebar = () => {
  const navItems = [
    { icon: 'chat', label: 'Chat', active: true },
    { icon: 'contacts', label: 'Contacts' },
    { icon: 'insights', label: 'Analytics' },
    { icon: 'smart_toy', label: 'AI Automations' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full z-50 bg-[#e7e8e9] text-[#003752] font-headline font-semibold tracking-tight w-20 flex flex-col items-center py-6">
      {/* Brand Logo */}
      <div className="mb-8">
        <span className="text-lg font-bold text-[#003752]">EW</span>
      </div>

      <nav className="flex flex-col gap-6 w-full items-center">
        {navItems.map((item) => (
          <div
            key={item.label}
            className={`transition-all duration-200 p-3 rounded-xl cursor-pointer group flex items-center justify-center ${
              item.active 
                ? 'text-[#003752] bg-white shadow-sm scale-110' 
                : 'text-slate-400 hover:bg-slate-200 hover:text-[#003752]'
            }`}
            title={item.label}
          >
            <span 
              className="material-symbols-outlined transition-transform duration-200 group-active:scale-90"
              style={{ fontVariationSettings: item.active ? "'FILL' 1" : "'FILL' 0" }}
            >
              {item.icon}
            </span>
          </div>
        ))}

        {/* Bottom Settings */}
        <div className="mt-auto text-slate-400 p-3 hover:bg-slate-200 transition-colors rounded-xl cursor-pointer group" title="Settings">
          <span className="material-symbols-outlined group-hover:text-[#003752]">settings</span>
        </div>
        
        {/* User Profile 1 (With Fallback) */}
        <div className="mt-4 w-10 h-10 rounded-full border-2 border-white shadow-sm bg-[#cfe6f2] flex items-center justify-center text-[#526772] font-headline font-bold text-sm overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#003752]/20 transition-all">
          S
        </div>

        {/* User Profile 2 (N) */}
        <div className="mt-2 w-10 h-10 rounded-full bg-[#191c1d] flex items-center justify-center text-white font-headline font-bold text-sm border-2 border-white shadow-sm cursor-pointer hover:scale-105 transition-all">
          N
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
