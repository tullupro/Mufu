import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PlaySquare } from "lucide-react";

export default async function ContinueWatchingPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const continueWatching = await prisma.watchHistory.findMany({
    where: {
      userId: session.user?.id,
      completed: false,
      timestamp: { gt: 0 },
    },
    include: { video: true },
    orderBy: { lastWatched: "desc" },
    take: 20,
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      <header className="mb-8 md:mb-12">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Continue Watching</h1>
        <p className="text-white/40 mt-2 text-sm md:text-base">Pick up where you left off</p>
      </header>

      {continueWatching.length === 0 ? (
        <div className="glass p-8 md:p-16 rounded-3xl flex flex-col items-center justify-center text-center">
          <PlaySquare size={48} className="text-white/20 mb-4" />
          <p className="text-white/50 text-lg mb-2">Nothing to continue</p>
          <p className="text-white/30 text-sm">Start watching a video and it will appear here if you don&apos;t finish it.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {continueWatching.map((entry) => {
            const progressPct = entry.video.duration > 0
              ? Math.min((entry.timestamp / entry.video.duration) * 100, 100)
              : 0;

            return (
              <Link
                key={entry.id}
                href={`/watch/${entry.video.id}?t=${Math.floor(entry.timestamp)}`}
                className="glass rounded-2xl overflow-hidden group hover:-translate-y-1 transition-all duration-300 border border-white/5 hover:border-accent/30 block"
              >
                <div className="aspect-video bg-[#1a1a1a] relative overflow-hidden">
                  {entry.video.thumbnailUrl && (
                    <img src={entry.video.thumbnailUrl} alt={entry.video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  )}
                  {/* Play icon overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 bg-accent/90 rounded-full flex items-center justify-center">
                      <PlaySquare size={22} className="text-white ml-0.5" fill="currentColor" />
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                    <div className="h-full bg-accent" style={{ width: `${progressPct}%` }} />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-white truncate group-hover:text-accent transition-colors">{entry.video.title}</h3>
                  <p className="text-xs text-white/40 mt-1">{Math.round(progressPct)}% watched</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
