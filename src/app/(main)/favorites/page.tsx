import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Star } from "lucide-react";

export default async function FavoritesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // Favorites feature placeholder — will be powered by a user-video relation
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-[100px] pointer-events-none" />

      <header className="mb-8 md:mb-12">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Favorites</h1>
        <p className="text-white/40 mt-2 text-sm md:text-base">Your bookmarked videos</p>
      </header>

      <div className="glass p-8 md:p-16 rounded-3xl flex flex-col items-center justify-center text-center">
        <Star size={48} className="text-white/20 mb-4" />
        <p className="text-white/50 text-lg mb-2">No favorites yet</p>
        <p className="text-white/30 text-sm">Click the star icon on any video to add it to your favorites.</p>
      </div>
    </div>
  );
}
