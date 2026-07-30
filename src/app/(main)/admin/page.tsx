import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Users, Video, HardDrive, Plus, PlayCircle } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/");
  }

  const [userCount, videoCount, driveToken, recentVideos, recentUsers] = await Promise.all([
    prisma.user.count(),
    prisma.video.count(),
    prisma.setting.findUnique({ where: { key: "google_refresh_token" } }),
    prisma.video.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.user.findMany({
      where: { lastLogin: { not: null } },
      orderBy: { lastLogin: 'desc' },
      take: 5,
    }),
  ]);
  
  const isDriveConnected = !!driveToken;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 md:mb-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-1">Admin Dashboard</h1>
          <p className="text-white/50 text-sm">Manage your private platform, users, and content.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Link href="/admin/users" className="bg-white/10 hover:bg-white/15 text-white px-4 py-2.5 md:px-5 md:py-3 rounded-xl font-medium transition-colors flex items-center gap-2 text-sm">
            <Users size={18} /> Manage Users
          </Link>
          <Link href="/admin/upload" className="bg-accent hover:bg-accent/90 text-white px-4 py-2.5 md:px-5 md:py-3 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(255,61,113,0.3)] text-sm">
            <Plus size={18} /> Upload Video
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="glass-panel p-6 rounded-2xl flex flex-col">
          <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center mb-4 text-accent">
            <Video size={24} />
          </div>
          <h3 className="text-white/60 font-medium mb-1">Total Videos</h3>
          <p className="text-4xl font-bold text-white">{videoCount}</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl flex flex-col">
          <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center mb-4 text-secondary">
            <Users size={24} />
          </div>
          <h3 className="text-white/60 font-medium mb-1">Total Users</h3>
          <p className="text-4xl font-bold text-white">{userCount}</p>
        </div>
        <a href="/api/drive/auth" className="glass-panel p-6 rounded-2xl flex flex-col relative overflow-hidden group cursor-pointer hover:-translate-y-1 transition-all duration-300">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 relative z-10 ${isDriveConnected ? 'bg-success/20 text-success' : 'bg-warning/20 text-yellow-500'}`}>
            <HardDrive size={24} />
          </div>
          <h3 className="text-white/60 font-medium mb-1 relative z-10">Google Drive Status</h3>
          <p className="text-xl font-bold text-white relative z-10 flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${isDriveConnected ? 'bg-success shadow-[0_0_10px_rgba(0,230,118,0.5)]' : 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]'}`}></span>
            {isDriveConnected ? 'Connected' : 'Not Connected'}
          </p>
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </a>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel rounded-2xl overflow-hidden flex flex-col h-[400px]">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
            <h2 className="font-semibold text-white">Recent Uploads</h2>
            <Link href="/admin/videos" className="text-sm text-accent hover:underline">View All</Link>
          </div>
          <div className="flex-1 overflow-y-auto p-4 text-white/70">
            {recentVideos.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <PlayCircle size={40} className="mx-auto mb-4 opacity-30" />
                <p>No recent uploads</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentVideos.map((video) => (
                  <Link key={video.id} href={`/watch/${video.id}`} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                    <div className="w-16 h-10 bg-black/50 rounded overflow-hidden shrink-0">
                      {video.thumbnailUrl && <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-white">{video.title}</p>
                      <p className="text-xs text-white/40">{new Date(video.createdAt).toLocaleDateString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="glass-panel rounded-2xl overflow-hidden flex flex-col h-[400px]">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
            <h2 className="font-semibold text-white">Recent Logins</h2>
            <Link href="/admin/users" className="text-sm text-accent hover:underline">View All</Link>
          </div>
          <div className="flex-1 overflow-y-auto p-4 text-white/70">
            {recentUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Users size={40} className="mx-auto mb-4 opacity-30" />
                <p>No activity yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-xs uppercase">
                        {user.username.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-white">{user.username}</p>
                        <p className="text-xs text-white/40">{user.role}</p>
                      </div>
                    </div>
                    <div className="text-xs text-white/40">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
