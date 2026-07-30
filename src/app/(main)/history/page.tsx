import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Clock, Trash2 } from "lucide-react";

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const history = await prisma.watchHistory.findMany({
    where: { userId: session.user?.id },
    include: { video: true },
    orderBy: { lastWatched: "desc" },
    take: 50,
  });

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <header className="flex justify-between items-center mb-8 md:mb-12">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Watch History</h1>
      </header>

      {history.length === 0 ? (
        <div className="glass p-8 md:p-16 rounded-3xl flex flex-col items-center justify-center text-center">
          <Clock size={48} className="text-white/20 mb-4" />
          <p className="text-white/50 text-lg mb-2">No watch history</p>
          <p className="text-white/30 text-sm">Videos you watch will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((entry) => (
            <Link
              key={entry.id}
              href={`/watch/${entry.video.id}`}
              className="glass rounded-xl md:rounded-2xl overflow-hidden group hover:bg-white/5 transition-all duration-200 flex items-center gap-3 md:gap-5 p-2 md:p-3 border border-white/5 hover:border-white/10 block"
            >
              <div className="w-28 md:w-44 aspect-video bg-[#1a1a1a] rounded-lg md:rounded-xl overflow-hidden relative shrink-0">
                {entry.video.thumbnailUrl && (
                  <img src={entry.video.thumbnailUrl} alt={entry.video.title} className="w-full h-full object-cover" />
                )}
                {/* Progress bar overlay */}
                {entry.video.duration > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                    <div
                      className="h-full bg-accent"
                      style={{ width: `${Math.min((entry.timestamp / entry.video.duration) * 100, 100)}%` }}
                    />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white truncate text-sm md:text-base group-hover:text-accent transition-colors">{entry.video.title}</h3>
                <p className="text-xs md:text-sm text-white/40 mt-1">{entry.video.views} views</p>
                <p className="text-xs text-white/30 mt-1">{formatDate(entry.lastWatched)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
