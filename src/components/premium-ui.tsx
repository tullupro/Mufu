"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { MufuLogo } from "./mufu-logo";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2.5 + 0.5,
    duration: Math.random() * 10 + 8,
    delay: Math.random() * 4,
    opacity: Math.random() * 0.25 + 0.03,
  }));
}

// ——— Cinematic Loading / Welcome Screen ———

export function LoadingScreen({ onComplete }: { onComplete?: () => void }) {
  const [particles] = useState(() => generateParticles(20));
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState(0); // 0=hidden, 1=glow, 2=logo, 3=text, 4=breathe, 5=exit

  useEffect(() => {
    setMounted(true);

    // Phase timeline
    const t1 = setTimeout(() => setPhase(1), 100);      // Glow appears
    const t2 = setTimeout(() => setPhase(2), 800);       // Logo materializes
    const t3 = setTimeout(() => setPhase(3), 2600);      // "Welcome" text
    const t4 = setTimeout(() => setPhase(4), 4200);      // Breathing + float
    const t5 = setTimeout(() => setPhase(5), 5800);      // Begin exit
    const t6 = setTimeout(() => onComplete?.(), 6800);    // Fully done

    return () => {
      [t1, t2, t3, t4, t5, t6].forEach(clearTimeout);
    };
  }, [onComplete]);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {phase < 5 && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#030305] overflow-hidden"
        >
          {/* Deep atmospheric gradient haze */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 1 ? 1 : 0 }}
            transition={{ duration: 2.5, ease: "easeOut" }}
          >
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(255, 61, 113, 0.06) 0%, rgba(108, 99, 255, 0.04) 35%, transparent 65%)",
              }}
            />
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(255, 61, 113, 0.1) 0%, transparent 60%)",
              }}
              animate={{
                scale: [1, 1.2, 1.05, 1.15, 1],
                opacity: [0.3, 0.7, 0.5, 0.6, 0.4],
              }}
              transition={{ duration: 6, ease: "easeInOut" }}
            />
          </motion.div>

          {/* Floating atmospheric particles */}
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full bg-white"
              style={{
                width: p.size,
                height: p.size,
                left: `${p.x}%`,
                top: `${p.y}%`,
              }}
              initial={{ opacity: 0 }}
              animate={phase >= 1 ? {
                opacity: [0, p.opacity, 0],
                y: [0, -40, -80],
              } : {}}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}

          {/* Central content container */}
          <div className="relative flex flex-col items-center">

            {/* Soft ambient glow behind logo */}
            <motion.div
              className="absolute -inset-32 rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(255, 61, 113, 0.15) 0%, rgba(108, 99, 255, 0.05) 40%, transparent 65%)",
              }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={phase >= 2 ? {
                opacity: [0, 0.8, 0.5],
                scale: [0.6, 1.1, 1],
              } : {}}
              transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
            />

            {/* Logo — materializes from blur, then floats gently */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, filter: "blur(20px)", y: 20 }}
              animate={
                phase >= 4
                  ? { opacity: 1, scale: 1, filter: "blur(0px)", y: -8 }
                  : phase >= 2
                    ? { opacity: 1, scale: 1, filter: "blur(0px)", y: 0 }
                    : {}
              }
              transition={
                phase >= 4
                  ? { duration: 1.5, ease: "easeInOut" }
                  : { duration: 1.8, ease: [0.16, 1, 0.3, 1] }
              }
            >
              <motion.div
                animate={phase >= 4 ? {
                  y: [0, -6, 0, -4, 0],
                  rotate: [0, 0.8, -0.5, 0.3, 0],
                } : {}}
                transition={{ duration: 3, ease: "easeInOut" }}
              >
                <MufuLogo size={90} animate />
              </motion.div>
            </motion.div>

            {/* Brand name "MUFU" — appears after logo */}
            <motion.h1
              className="text-[22px] font-semibold text-white/80 tracking-[0.25em] uppercase mt-10 select-none"
              initial={{ opacity: 0, y: 12 }}
              animate={phase >= 2 ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              Mufu
            </motion.h1>

            {/* Elegant divider line */}
            <motion.div
              className="h-[1.5px] rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent mt-6"
              initial={{ width: 0, opacity: 0 }}
              animate={phase >= 3 ? { width: 120, opacity: 1 } : {}}
              transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            />

            {/* "Welcome" text — graceful reveal */}
            <motion.div
              className="flex flex-col items-center mt-7 gap-2"
              initial={{ opacity: 0, y: 15 }}
              animate={phase >= 3 ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 className="text-white text-2xl md:text-3xl font-bold tracking-tight">
                Welcome
              </h2>
              <p className="text-white/30 text-sm tracking-wide">
                Your private streaming awaits
              </p>
            </motion.div>
          </div>

          {/* Subtle film grain texture overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.015]"
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ——— Delete Confirmation Modal ———

interface DeleteModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function DeleteConfirmModal({ isOpen, title, message, onConfirm, onCancel, loading }: DeleteModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={onCancel}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Modal card */}
          <motion.div
            initial={{ scale: 0.97, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.97, opacity: 0 }}
            transition={{ type: "spring" as const, stiffness: 500, damping: 30, mass: 0.5 }}
            className="relative bg-[#141416] border border-white/10 rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning glow */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-error/20 rounded-full blur-[60px] pointer-events-none" />

            {/* Icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring" as const, stiffness: 500, damping: 25 }}
              className="w-14 h-14 rounded-full bg-error/10 border border-error/20 flex items-center justify-center mx-auto mb-5"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-error">
                <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>

            <h3 className="text-lg font-semibold text-white text-center mb-2">
              {title}
            </h3>
            <p className="text-white/50 text-sm text-center mb-6 leading-relaxed">
              {message}
            </p>

            <div className="flex gap-3">
              <button
                onClick={onCancel}
                disabled={loading}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-medium py-3 rounded-xl transition-colors duration-150 text-sm border border-white/5 active:scale-[0.97]"
              >
                Cancel
              </button>
              <motion.button
                onClick={onConfirm}
                disabled={loading}
                whileTap={{ scale: 0.95 }}
                className="flex-1 bg-error/90 hover:bg-error text-white font-medium py-3 rounded-xl transition-colors duration-150 text-sm relative overflow-hidden shadow-[0_0_20px_rgba(255,82,82,0.3)]"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                ) : (
                  "Delete"
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ——— Toast Notification ———

interface ToastProps {
  message: string;
  type?: "success" | "error";
  isVisible: boolean;
}

export function Toast({ message, type = "success", isVisible }: ToastProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring" as const, stiffness: 500, damping: 30 }}
          className={`fixed bottom-6 right-6 z-[200] px-5 py-3 rounded-xl text-sm font-medium shadow-2xl border backdrop-blur-xl flex items-center gap-2 ${
            type === "success"
              ? "bg-success/10 border-success/20 text-success"
              : "bg-error/10 border-error/20 text-error"
          }`}
        >
          {type === "success" ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 12L12 4M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
