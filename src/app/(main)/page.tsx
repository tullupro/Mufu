import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PlaySquare } from "lucide-react";

export default async function Home() {
  const session = await getServerSession(authOptions);

  const [videos, continueWatching] = await Promise.all([
    prisma.video.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    prisma.watchHistory.findMany({
      where: {
        userId: session.user?.id,
        completed: false,
        timestamp: { gt: 0 },
      },
      include: { video: true },
      orderBy: { lastWatched: "desc" },
      take: 6,
    }),
  ]);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <header className="flex justify-between items-center mb-8 md:mb-12">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Home</h1>
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-card border border-white/10 flex items-center justify-center font-bold text-accent text-sm">
            {session.user?.username?.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Continue Watching Section */}
      {continueWatching.length > 0 && (
        <section className="mb-8 md:mb-12">
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-semibold text-white/90">Continue Watching</h2>
            <Link href="/continue-watching" className="text-sm text-accent hover:underline">View All</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
            {continueWatching.map((entry) => {
              const pct = entry.video.duration > 0 ? Math.min((entry.timestamp / entry.video.duration) * 100, 100) : 0;
              return (
                <Link
                  key={entry.id}
                  href={`/watch/${entry.video.id}?t=${Math.floor(entry.timestamp)}`}
                  className="glass rounded-xl overflow-hidden group hover:-translate-y-1 transition-all duration-200 border border-white/5 hover:border-accent/30 block"
                >
                  <div className="aspect-video bg-[#1a1a1a] relative overflow-hidden">
                    {entry.video.thumbnailUrl && (
                      <img src={entry.video.thumbnailUrl} alt={entry.video.title} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="w-10 h-10 bg-accent/90 rounded-full flex items-center justify-center">
                        <PlaySquare size={18} className="text-white ml-0.5" fill="currentColor" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                      <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-white truncate text-xs md:text-sm group-hover:text-accent transition-colors">{entry.video.title}</h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Recently Added */}
      <section className="mb-8 md:mb-12">
        <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 text-white/90">Recently Added</h2>
        {videos.length === 0 ? (
          <div className="glass p-8 md:p-12 rounded-3xl flex flex-col items-center justify-center text-center">
            <PlaySquare size={48} className="text-white/20 mb-4" />
            <p className="text-white/50 text-lg mb-1">No videos available yet</p>
            <p className="text-white/30 text-sm">Videos uploaded by the admin will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
            {videos.map((video) => (
              <Link href={`/watch/${video.id}`} key={video.id} className="glass rounded-xl md:rounded-2xl overflow-hidden group hover:-translate-y-1 md:hover:-translate-y-2 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,61,113,0.15)] border border-white/5 hover:border-accent/30 block">
                <div className="aspect-video bg-[#1a1a1a] relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                  {video.thumbnailUrl && <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" loading="lazy" />}
                </div>
                <div className="p-3 md:p-5">
                  <h3 className="font-medium text-white truncate text-sm md:text-lg group-hover:text-accent transition-colors">{video.title}</h3>
                  <p className="text-xs md:text-sm text-white/50 mt-1">{video.views} views</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
