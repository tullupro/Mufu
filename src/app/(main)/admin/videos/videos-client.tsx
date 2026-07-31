"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Video, Trash2, Eye, Plus, Calendar } from "lucide-react";
import { DeleteConfirmModal, Toast } from "@/components/premium-ui";

interface VideoItem {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  views: number;
  createdAt: string;
  category: { name: string } | null;
}

export function VideosClient({ videos: initialVideos }: { videos: VideoItem[] }) {
  const router = useRouter();
  const [videos, setVideos] = useState(initialVideos);
  const [deleteTarget, setDeleteTarget] = useState<VideoItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    // Optimistic: immediately remove from UI
    const removedVideo = deleteTarget;
    const previousVideos = [...videos];
    setVideos((prev) => prev.filter((v) => v.id !== removedVideo.id));
    setDeleteTarget(null);
    setDeleting(false);
    showToast(`"${removedVideo.title}" has been deleted`);

    try {
      const res = await fetch(`/api/admin/videos?id=${removedVideo.id}`, {
        method: "POST",
        redirect: "follow",
      });

      if (!res.ok && !res.redirected) {
        // Rollback on failure
        setVideos(previousVideos);
        showToast("Failed to delete video", "error");
      }
    } catch {
      // Rollback on network error
      setVideos(previousVideos);
      showToast("Network error — video restored", "error");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 md:mb-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-1">All Videos</h1>
          <p className="text-white/50 text-sm">
            {videos.length} video{videos.length !== 1 ? "s" : ""} uploaded
          </p>
        </div>
        <Link
          href="/admin/upload"
          className="bg-accent hover:bg-accent/90 text-white px-5 py-2.5 rounded-xl font-medium transition-colors duration-100 flex items-center gap-2 shadow-[0_0_20px_rgba(255,61,113,0.3)] text-sm active:scale-[0.97]"
        >
          <Plus size={18} /> Upload Video
        </Link>
      </div>

      {videos.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="glass p-8 md:p-16 rounded-3xl flex flex-col items-center justify-center text-center"
        >
          <Video size={48} className="text-white/20 mb-4" />
          <p className="text-white/50 text-lg mb-2">No videos uploaded</p>
          <p className="text-white/30 text-sm">Upload your first video to get started.</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {videos.map((video) => (
              <motion.div
                key={video.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95, x: 60 }}
                transition={{
                  type: "spring" as const,
                  stiffness: 500,
                  damping: 30,
                }}
                className="glass-panel rounded-xl md:rounded-2xl overflow-hidden flex items-center gap-3 md:gap-5 p-2 md:p-4 hover:bg-white/5 transition-colors duration-100 border border-white/5"
              >
                <Link
                  href={`/watch/${video.id}`}
                  className="w-24 md:w-40 aspect-video bg-[#1a1a1a] rounded-lg md:rounded-xl overflow-hidden shrink-0 block"
                >
                  {video.thumbnailUrl && (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/watch/${video.id}`} className="hover:text-accent transition-colors duration-100">
                    <h3 className="font-medium text-white truncate text-sm md:text-base">
                      {video.title}
                    </h3>
                  </Link>
                  <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-1 md:mt-2 text-xs text-white/40">
                    <span className="flex items-center gap-1">
                      <Eye size={12} /> {video.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />{" "}
                      {new Date(video.createdAt).toLocaleDateString()}
                    </span>
                    {video.category && (
                      <span className="px-2 py-0.5 rounded-md bg-secondary/10 text-secondary text-xs">
                        {video.category.name}
                      </span>
                    )}
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setDeleteTarget(video)}
                  className="text-white/20 hover:text-error transition-colors duration-100 p-2 shrink-0"
                  aria-label="Delete video"
                >
                  <Trash2 size={18} />
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Delete confirmation modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Video"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This will also remove it from Google Drive. This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => { setDeleteTarget(null); setDeleting(false); }}
        loading={deleting}
      />

      {/* Toast */}
      <Toast
        message={toast?.message || ""}
        type={toast?.type}
        isVisible={!!toast}
      />
    </div>
  );
}
