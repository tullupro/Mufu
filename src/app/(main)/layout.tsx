import { Sidebar } from "@/components/sidebar";
import { Search, Bell } from "lucide-react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#09090b]">
      <Sidebar />
      <div className="flex-1 flex flex-col relative overflow-hidden min-w-0">
        {/* Top Navigation */}
        <header className="h-16 md:h-20 flex items-center justify-between px-4 md:px-8 bg-background/50 backdrop-blur-md border-b border-white/5 z-20 shrink-0">
          {/* Spacer for mobile hamburger */}
          <div className="w-10 md:hidden" />
          <div className="flex-1 max-w-2xl relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <input
              type="text"
              placeholder="Search videos..."
              className="w-full bg-card/50 border border-white/10 rounded-full py-2.5 md:py-3 pl-11 pr-4 text-sm md:text-base text-white placeholder:text-white/40 focus:outline-none focus:border-accent/50 focus:bg-card transition-all"
            />
          </div>
          <div className="flex items-center gap-4 ml-4 md:ml-8">
            <button className="relative text-white/70 hover:text-white transition-colors">
              <Bell size={22} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-accent rounded-full border border-background"></span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        {children}
      </div>
    </div>
  );
}
