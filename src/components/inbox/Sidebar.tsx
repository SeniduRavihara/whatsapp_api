"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const Sidebar = () => {
  const pathname = usePathname();

  const navItems = [
    { icon: "chat", label: "Chat", path: "/" },
    { icon: "contacts", label: "Contacts", path: "/contacts" },
    { icon: "insights", label: "Analytics", path: "/analytics" },
    { icon: "smart_toy", label: "AI Automations", path: "/automations" },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full z-50 bg-[#e7e8e9] text-[#003752] font-headline font-semibold tracking-tight w-20 flex flex-col items-center py-6">
      {/* Brand Logo */}
      <div className="mb-8">
        <span className="text-lg font-bold text-[#003752]">EW</span>
      </div>

      <nav className="flex flex-col gap-6 w-full items-center h-full">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              href={item.path}
              key={item.label}
              className={`transition-all duration-200 p-3 rounded-xl cursor-pointer group flex items-center justify-center ${
                isActive
                  ? "text-[#003752] bg-white shadow-sm scale-110"
                  : "text-[#727780] hover:bg-slate-200 hover:text-[#003752]"
              }`}
              title={item.label}
            >
              <span
                className="material-symbols-outlined transition-transform duration-200 group-active:scale-90"
                style={{
                  fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                {item.icon}
              </span>
            </Link>
          );
        })}

        {/* Bottom Settings */}
        <Link
          href="/settings"
          className={`mt-auto transition-all duration-200 p-3 rounded-xl cursor-pointer group flex items-center justify-center ${
            pathname === "/settings"
              ? "text-[#003752] bg-white shadow-sm scale-110"
              : "text-[#727780] hover:bg-slate-200 hover:text-[#003752]"
          }`}
          title="Settings"
        >
          <span
            className="material-symbols-outlined group-hover:text-[#003752] transition-transform duration-200 group-active:scale-90"
            style={{
              fontVariationSettings: pathname === "/settings" ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            settings
          </span>
        </Link>

        {/* User Profile 1 (With Fallback) */}
        <div className="mt-4 w-10 h-10 shrink-0 rounded-full border-2 border-white shadow-sm bg-[#cfe6f2] flex items-center justify-center text-[#526772] font-headline font-bold text-sm overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#003752]/20 transition-all">
          S
        </div>

        {/* User Profile 2 (N) */}
        <div className="mt-2 mb-2 w-10 h-10 shrink-0 rounded-full bg-[#191c1d] flex items-center justify-center text-white font-headline font-bold text-sm border-2 border-white shadow-sm cursor-pointer hover:scale-105 transition-all">
          N
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
