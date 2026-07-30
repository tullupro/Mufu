"use client";

import { motion } from "framer-motion";

interface MufuLogoProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

export function MufuLogo({ size = 56, className = "", animate = false }: MufuLogoProps) {
  const iconSize = size * 0.4;
  const playSize = iconSize * 0.5;
  const offset = (size - iconSize) / 2;
  const radius = size * 0.22;

  // Play triangle points (centered within the icon area)
  const cx = offset + iconSize / 2 + playSize * 0.08;
  const cy = offset + iconSize / 2;
  const playPath = `M ${cx - playSize * 0.35} ${cy - playSize * 0.45} L ${cx + playSize * 0.45} ${cy} L ${cx - playSize * 0.35} ${cy + playSize * 0.45} Z`;

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      className={className}
      initial={animate ? { scale: 0.92, opacity: 0, filter: "blur(8px)" } : undefined}
      animate={animate ? { scale: 1, opacity: 1, filter: "blur(0px)" } : undefined}
      transition={animate ? { type: "spring", stiffness: 120, damping: 18, duration: 0.8 } : undefined}
    >
      <defs>
        {/* Gradient for the rounded square */}
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0.95)" />
          <stop offset="100%" stopColor="rgba(255, 255, 255, 0.8)" />
        </linearGradient>
        {/* Shimmer sweep gradient */}
        <linearGradient id="shimmer-sweep" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0)" />
          <stop offset="45%" stopColor="rgba(255, 255, 255, 0)" />
          <stop offset="50%" stopColor="rgba(255, 255, 255, 0.25)" />
          <stop offset="55%" stopColor="rgba(255, 255, 255, 0)" />
          <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
        </linearGradient>
        {/* Clip to cut the play button out */}
        <mask id={`play-cutout-${size}`}>
          <rect width={size} height={size} fill="white" rx={radius} />
          <path d={playPath} fill="black" />
        </mask>
        {/* Glow filter */}
        <filter id="logo-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer glow */}
      {animate && (
        <motion.rect
          x={offset * 0.8}
          y={offset * 0.8}
          width={iconSize * 1.2}
          height={iconSize * 1.2}
          rx={radius * 1.2}
          fill="rgba(255, 61, 113, 0.15)"
          filter="url(#logo-glow)"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Main shape with cutout */}
      <rect
        x={offset}
        y={offset}
        width={iconSize}
        height={iconSize}
        rx={radius}
        fill="url(#logo-gradient)"
        mask={`url(#play-cutout-${size})`}
      />

      {/* Shimmer overlay */}
      {animate && (
        <motion.rect
          x={offset}
          y={offset}
          width={iconSize}
          height={iconSize}
          rx={radius}
          fill="url(#shimmer-sweep)"
          mask={`url(#play-cutout-${size})`}
          initial={{ x: -size }}
          animate={{ x: size }}
          transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
        />
      )}
    </motion.svg>
  );
}
