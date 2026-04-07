"use client";

import React, { useState } from "react";
import { User, Bell, Key, Smartphone, Palette, Shield } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("api");

  return (
    <div className="flex-1 p-8 bg-[#f8f9fa] h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-[#003752] mb-2">Settings</h1>
        <p className="text-[#727780] mb-8">Manage your account, configurations, and application preferences.</p>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Settings Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <nav className="flex flex-col gap-2">
              <button 
                onClick={() => setActiveTab('api')} 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${activeTab === 'api' ? 'bg-[#003752] text-white shadow-md' : 'text-[#727780] hover:bg-[#edeeef] hover:text-[#191c1d]'}`}
              >
                <Key size={18} />
                <span className="font-medium">WhatsApp API</span>
              </button>
              
              <button 
                onClick={() => setActiveTab('profile')} 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${activeTab === 'profile' ? 'bg-[#003752] text-white shadow-md' : 'text-[#727780] hover:bg-[#edeeef] hover:text-[#191c1d]'}`}
              >
                <User size={18} />
                <span className="font-medium">Profile</span>
              </button>
              
              <button 
                onClick={() => setActiveTab('appearance')} 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${activeTab === 'appearance' ? 'bg-[#003752] text-white shadow-md' : 'text-[#727780] hover:bg-[#edeeef] hover:text-[#191c1d]'}`}
              >
                <Palette size={18} />
                <span className="font-medium">Appearance</span>
              </button>
              
              <button 
                onClick={() => setActiveTab('notifications')} 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${activeTab === 'notifications' ? 'bg-[#003752] text-white shadow-md' : 'text-[#727780] hover:bg-[#edeeef] hover:text-[#191c1d]'}`}
              >
                <Bell size={18} />
                <span className="font-medium">Notifications</span>
              </button>
            </nav>
          </div>

          {/* Settings Content */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-[#edeeef] p-8 md:min-h-[500px]">
            {activeTab === 'api' && (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-xl font-bold text-[#191c1d] mb-6 flex items-center gap-2">
                  <Smartphone className="text-[#00a884]" />
                  WhatsApp Business API Configuration
                </h2>
                
                <div className="bg-[#f0f9ff] border border-[#b2dfdb] text-[#00695c] px-4 py-3 rounded-lg mb-6 text-sm">
                  These settings map directly to your Meta App dashboard. Update them if you regenerate your tokens.
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[#4a4e53]">Phone Number ID</label>
                    <input 
                      type="text" 
                      className="w-full border border-[#edeeef] rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#00a884] bg-[#f8f9fa] focus:bg-white transition-colors" 
                      placeholder="e.g. 104561234567890" 
                    />
                    <p className="text-xs text-[#727780] mt-1">The unique ID for your registered WhatsApp number.</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[#4a4e53]">WhatsApp Business Account ID</label>
                    <input 
                      type="text" 
                      className="w-full border border-[#edeeef] rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#00a884] bg-[#f8f9fa] focus:bg-white transition-colors" 
                      placeholder="e.g. 104561234567890" 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[#4a4e53]">Permanent Access Token</label>
                    <input 
                      type="password" 
                      className="w-full border border-[#edeeef] rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#00a884] bg-[#f8f9fa] focus:bg-white transition-colors" 
                      placeholder="EAAG..." 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-[#4a4e53]">Webhook Verify Token</label>
                    <input 
                      type="password" 
                      className="w-full border border-[#edeeef] rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#00a884] bg-[#f8f9fa] focus:bg-white transition-colors" 
                      placeholder="Enter your secret webhook validation token" 
                    />
                    <p className="text-xs text-[#727780] mt-1">Used to verify the webhook connection during setup in the Meta Dashboard.</p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-[#edeeef] flex justify-end">
                    <button className="bg-[#00a884] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#008f6f] transition-colors shadow-sm">
                      Save API Credentials
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-xl font-bold text-[#191c1d] mb-6 flex items-center gap-2">
                  <User className="text-[#00a884]" />
                  User Profile
                </h2>
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-24 h-24 bg-[#e0f2f1] text-[#00796b] rounded-full flex items-center justify-center text-3xl font-bold mb-4 shadow-sm">
                    SR
                  </div>
                  <h3 className="font-medium text-lg text-[#191c1d]">Senidu Ravihara</h3>
                  <p className="text-[#727780] text-sm">Administrator</p>
                  
                  <div className="text-[#a0a5ab] mt-8 text-sm border border-[#edeeef] px-4 py-2 rounded-full border-dashed">
                    Profile editor fields coming soon...
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-xl font-bold text-[#191c1d] mb-6 flex items-center gap-2">
                  <Palette className="text-[#00a884]" />
                  Appearance & Theme
                </h2>
                <div className="space-y-4">
                  <p className="text-sm text-[#727780]">Select your preferred interface theme.</p>
                  <div className="grid grid-cols-2 max-w-md gap-4">
                    <div className="border-2 border-[#00a884] rounded-xl p-4 cursor-pointer bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-[#191c1d]">Light Mode</span>
                        <div className="w-4 h-4 rounded-full bg-[#00a884]"></div>
                      </div>
                      <div className="h-16 bg-[#f8f9fa] rounded border border-[#edeeef]"></div>
                    </div>
                    <div className="border-2 border-transparent hover:border-[#edeeef] rounded-xl p-4 cursor-not-allowed bg-white opacity-60">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-[#191c1d]">Dark Mode</span>
                        <div className="w-4 h-4 rounded-full border border-[#727780]"></div>
                      </div>
                      <div className="h-16 bg-[#1a1a1a] rounded border border-[#333]"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-xl font-bold text-[#191c1d] mb-6 flex items-center gap-2">
                  <Bell className="text-[#00a884]" />
                  Notification Preferences
                </h2>
                
                <div className="space-y-4 max-w-lg">
                  <div className="flex items-center justify-between p-4 bg-[#f8f9fa] rounded-xl border border-[#edeeef]">
                    <div>
                      <h4 className="font-medium text-[#191c1d]">Desktop Alerts</h4>
                      <p className="text-sm text-[#727780]">Receive pop-up alerts for new messages</p>
                    </div>
                    <div className="w-12 h-6 bg-[#00a884] rounded-full relative cursor-pointer shadow-inner">
                      <div className="w-5 h-5 bg-white absolute right-1 top-0.5 rounded-full shadow-sm"></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-[#f8f9fa] rounded-xl border border-[#edeeef]">
                    <div>
                      <h4 className="font-medium text-[#191c1d]">Sound Notifications</h4>
                      <p className="text-sm text-[#727780]">Play a sound when a message arrives</p>
                    </div>
                    <div className="w-12 h-6 bg-[#00a884] rounded-full relative cursor-pointer shadow-inner">
                      <div className="w-5 h-5 bg-white absolute right-1 top-0.5 rounded-full shadow-sm"></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-[#f8f9fa] rounded-xl border border-[#edeeef]">
                    <div>
                      <h4 className="font-medium text-[#191c1d]">Email Digest</h4>
                      <p className="text-sm text-[#727780]">Daily summary of unread messages</p>
                    </div>
                    <div className="w-12 h-6 bg-[#e0e0e0] rounded-full relative cursor-pointer shadow-inner">
                      <div className="w-5 h-5 bg-white absolute left-1 top-0.5 rounded-full shadow-sm"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
