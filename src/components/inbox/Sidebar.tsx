import React from 'react';
import { LayoutDashboard, User, Flag, CheckCircle2, Archive, Settings, Cpu } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { icon: LayoutDashboard, label: 'All', active: true },
    { icon: User, label: 'Unassigned', active: false },
    { icon: Flag, label: 'Flagged', active: false },
    { icon: CheckCircle2, label: 'Resolved', active: false },
    { icon: Archive, label: 'Archived', active: false },
  ];

  return (
    <aside className="flex h-full w-[var(--sidebar-width)] flex-col items-center py-4 bg-[#15191d] border-r border-[#24292e] z-50 shadow-lg">
      <div className="w-10 h-10 rounded-xl bg-[#ff9900] flex items-center justify-center text-[#15191d] font-bold shrink-0 shadow-lg shadow-black/20 mb-8 border border-white/10">
        <Cpu className="w-6 h-6 fill-current" />
      </div>
      
      <nav className="flex flex-1 flex-col gap-2 w-full px-2">
        {navItems.map((Item, i) => (
          <button
            key={i}
            title={Item.label}
            className={`flex h-11 w-full items-center justify-center rounded-xl transition-all duration-150 relative ${
              Item.active 
                ? 'bg-[#24292e] text-[#ff9900]' 
                : 'text-slate-400 hover:bg-[#24292e] hover:text-white'
            }`}
          >
            <Item.icon size={18} strokeWidth={2} />
            {Item.active && (
              <div className="absolute left-0 w-1 h-full bg-[#ff9900]" />
            )}
          </button>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-4 w-full px-2 pb-6">
        <button className="flex h-11 w-full items-center justify-center rounded-xl text-slate-400 hover:bg-[#24292e] hover:text-white transition-all">
          <Settings size={18} />
        </button>
        <div className="flex h-11 w-full items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-black text-white border border-white/5 shadow-md">
            JD
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
