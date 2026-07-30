"use client";

import { Home, Compass, Clock, Star, Settings, LogOut, Shield, Menu, X, PlayCircle } from "lucide-react";
import { MufuLogo } from "@/components/mufu-logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const links = [
    { name: "Home", href: "/", icon: Home },
    { name: "Categories", href: "/categories", icon: Compass },
    { name: "History", href: "/history", icon: Clock },
    { name: "Continue Watching", href: "/continue-watching", icon: PlayCircle },
    { name: "Favorites", href: "/favorites", icon: Star },
  ];

  if (session?.user?.role === "ADMIN") {
    links.push({ name: "Admin Dashboard", href: "/admin", icon: Shield });
  }

  const sidebarContent = (
    <>
      <div className="p-6">
        <div className="text-2xl font-bold text-white tracking-tighter flex items-center gap-2.5">
          <MufuLogo size={34} />
          Mufu
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link key={link.href} href={link.href}>
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative group ${
                  isActive ? "text-white" : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-accent/20 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <link.icon size={20} className="relative z-10 shrink-0" />
                <span className="font-medium relative z-10 truncate">{link.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-white/5">
        <Link href="/settings">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-colors cursor-pointer mb-1">
            <Settings size={20} className="shrink-0" />
            <span className="font-medium">Settings</span>
          </div>
        </Link>
        <div
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-error/70 hover:text-error hover:bg-error/10 transition-colors cursor-pointer"
        >
          <LogOut size={20} className="shrink-0" />
          <span className="font-medium">Log out</span>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-5 left-4 z-50 md:hidden w-10 h-10 bg-card/80 backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center text-white/70 hover:text-white transition-colors"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Desktop sidebar */}
      <div className="hidden md:flex w-64 h-full flex-col glass-panel border-r border-white/5 relative z-10 shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="fixed top-0 left-0 bottom-0 w-72 flex flex-col glass-panel border-r border-white/5 z-50 md:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-5 right-4 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                aria-label="Close menu"
              >
                <X size={16} />
              </button>
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
