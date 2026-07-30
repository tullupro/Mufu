"use client";

import { useSession } from "next-auth/react";
import { Settings as SettingsIcon, User, Shield, Palette } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <header className="mb-8 md:mb-12">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Settings</h1>
        <p className="text-white/40 mt-2 text-sm md:text-base">Manage your account and preferences</p>
      </header>

      <div className="max-w-2xl space-y-6">
        {/* Profile Section */}
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="p-5 md:p-6 border-b border-white/5 flex items-center gap-3">
            <User size={20} className="text-accent" />
            <h2 className="font-semibold text-white">Profile</h2>
          </div>
          <div className="p-5 md:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/50">Username</p>
                <p className="text-white font-medium">{session?.user?.username || "—"}</p>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-xs font-bold uppercase tracking-wide">
                {session?.user?.role || "USER"}
              </div>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="p-5 md:p-6 border-b border-white/5 flex items-center gap-3">
            <Palette size={20} className="text-secondary" />
            <h2 className="font-semibold text-white">Appearance</h2>
          </div>
          <div className="p-5 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Theme</p>
                <p className="text-sm text-white/40 mt-0.5">Choose your preferred theme</p>
              </div>
              <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm font-medium">
                Dark
              </div>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="p-5 md:p-6 border-b border-white/5 flex items-center gap-3">
            <Shield size={20} className="text-success" />
            <h2 className="font-semibold text-white">About</h2>
          </div>
          <div className="p-5 md:p-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Platform</span>
              <span className="text-white font-medium">Mufu v1.0</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Access</span>
              <span className="text-white font-medium">Invite Only</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
