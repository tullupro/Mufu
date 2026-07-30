"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PlayerClient({ video }: { video: any }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(video.duration || 0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);

  // Resume from timestamp if provided
  useEffect(() => {
    const t = searchParams.get("t");
    if (t && videoRef.current) {
      videoRef.current.currentTime = parseInt(t);
    }
  }, [searchParams]);

  // Save watch progress periodically
  const saveProgress = useCallback((currentTime: number, videoDuration: number) => {
    const completed = videoDuration > 0 && currentTime / videoDuration > 0.95;
    fetch("/api/watch-history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        videoId: video.id,
        timestamp: currentTime,
        completed,
      }),
    }).catch(() => {}); // Fail silently
  }, [video.id]);

  // Save progress every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && !videoRef.current.paused) {
        saveProgress(videoRef.current.currentTime, videoRef.current.duration);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [saveProgress]);

  // Save on pause / unmount
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        saveProgress(videoRef.current.currentTime, videoRef.current.duration);
      }
    };
  }, [saveProgress]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 2500);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        saveProgress(videoRef.current.currentTime, videoRef.current.duration);
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(currentProgress);

      // Update buffered
      if (videoRef.current.buffered.length > 0) {
        const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
        setBuffered((bufferedEnd / videoRef.current.duration) * 100);
      }
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * videoRef.current.duration;
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Keyboard controls
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "m":
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
            setIsMuted(!isMuted);
          }
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (videoRef.current) videoRef.current.currentTime -= 5;
          break;
        case "ArrowRight":
          e.preventDefault();
          if (videoRef.current) videoRef.current.currentTime += 5;
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isPlaying, isMuted]);

  return (
    <div className="flex-1 bg-black relative flex flex-col h-full overflow-y-auto">
      <div
        ref={containerRef}
        className="relative w-full aspect-video md:h-[75vh] bg-black group"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
        onTouchStart={() => setShowControls(true)}
      >
        <video
          ref={videoRef}
          src={`/api/videos/${video.id}/stream`}
          className="w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => {
            setDuration(videoRef.current?.duration || video.duration || 0);
            const t = searchParams.get("t");
            if (t && videoRef.current) {
              videoRef.current.currentTime = parseInt(t);
            }
          }}
          onClick={togglePlay}
          autoPlay
          playsInline
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        {/* Center play button on pause (mobile-friendly) */}
        <AnimatePresence>
          {!isPlaying && showControls && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              onClick={togglePlay}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-20 md:h-20 bg-accent/90 rounded-full flex items-center justify-center z-10"
            >
              <Play size={28} className="text-white ml-1" fill="currentColor" />
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-16 md:pt-24 px-3 md:px-6 pb-3 md:pb-6"
            >
              {/* Progress Bar */}
              <div
                className="w-full h-1 md:h-1.5 bg-white/20 rounded-full mb-3 md:mb-6 cursor-pointer group/progress relative"
                onClick={handleSeek}
              >
                {/* Buffered */}
                <div
                  className="absolute top-0 left-0 h-full bg-white/10 rounded-full pointer-events-none"
                  style={{ width: `${buffered}%` }}
                />
                {/* Progress */}
                <div
                  className="absolute top-0 left-0 h-full bg-accent rounded-full pointer-events-none"
                  style={{ width: `${progress}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 bg-accent rounded-full shadow-[0_0_8px_rgba(255,61,113,0.8)] opacity-0 group-hover/progress:opacity-100 transition-opacity pointer-events-none"
                  style={{ left: `calc(${progress}% - 6px)` }}
                />
              </div>

              {/* Controls Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 md:gap-6">
                  <button onClick={togglePlay} className="text-white hover:text-accent transition-colors">
                    {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                  </button>

                  <div className="hidden sm:flex items-center gap-3 group/volume">
                    <button
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.muted = !isMuted;
                          setIsMuted(!isMuted);
                        }
                      }}
                      className="text-white hover:text-accent transition-colors"
                    >
                      {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <input
                      type="range"
                      min="0" max="1" step="0.01"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setVolume(val);
                        if (videoRef.current) videoRef.current.volume = val;
                        if (val > 0 && isMuted) setIsMuted(false);
                      }}
                      className="w-0 group-hover/volume:w-20 md:group-hover/volume:w-24 opacity-0 group-hover/volume:opacity-100 transition-all duration-300"
                    />
                  </div>

                  <div className="text-white/80 text-xs md:text-sm font-medium tabular-nums">
                    {formatTime((progress / 100) * duration)} / {formatTime(duration)}
                  </div>
                </div>

                <div className="flex items-center gap-3 md:gap-6">
                  <button onClick={toggleFullscreen} className="text-white hover:text-accent transition-colors">
                    {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back button */}
        <AnimatePresence>
          {showControls && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => router.back()}
              className="absolute top-3 md:top-5 left-3 md:left-5 w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors z-20"
            >
              <ArrowLeft size={20} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Video Details */}
      <div className="p-4 md:p-8 max-w-6xl w-full mx-auto pb-20 md:pb-24">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2">{video.title}</h1>
        <div className="flex items-center gap-3 md:gap-4 text-white/50 text-xs md:text-sm mb-4 md:mb-6 pb-4 md:pb-6 border-b border-white/10">
          <span>{video.views.toLocaleString()} views</span>
          <span>•</span>
          <span>{new Date(video.createdAt).toLocaleDateString()}</span>
        </div>

        {video.description && (
          <div className="glass-panel p-4 md:p-6 rounded-xl md:rounded-2xl">
            <p className="text-white/80 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
              {video.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
