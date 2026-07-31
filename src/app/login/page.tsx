"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { MufuLogo } from "@/components/mufu-logo";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      username,
      password,
    });

    if (res?.error) {
      setError("Invalid username or password");
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 300);
    }
  };

  // Spring configs — fast and responsive
  const cardSpring = { type: "spring" as const, stiffness: 380, damping: 28, mass: 0.7 };
  const stagger = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.15 },
    },
  };
  const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 500, damping: 30 } },
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#050507] px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Static gradient background — no animation overhead */}
      <div className="absolute inset-0">
        <div
          className="absolute top-1/3 left-1/3 w-[400px] md:w-[600px] h-[400px] md:h-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(108, 99, 255, 0.12) 0%, transparent 70%)",
            opacity: 0.7,
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(255, 61, 113, 0.08) 0%, transparent 70%)",
            opacity: 0.5,
          }}
        />
      </div>

      {/* Login card with spring entrance */}
      <AnimatePresence mode="wait">
        {!success ? (
          <motion.div
            key="login-card"
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 1.03, filter: "blur(8px)" }}
            transition={cardSpring}
            className="w-full max-w-[420px] relative z-10"
          >
            {/* Card glow */}
            <div className="absolute -inset-4 bg-gradient-to-b from-accent/5 via-transparent to-secondary/5 rounded-[2rem] blur-2xl pointer-events-none" />

            <div className="relative bg-[#0c0c0f]/80 backdrop-blur-2xl border border-white/[0.06] rounded-2xl md:rounded-3xl p-7 sm:p-8 md:p-10 shadow-[0_0_80px_rgba(0,0,0,0.5)]">
              {/* Subtle border glow */}
              <div className="absolute inset-0 rounded-2xl md:rounded-3xl border border-white/[0.04] pointer-events-none" />

              {/* Logo */}
              <motion.div
                className="flex flex-col items-center mb-7 md:mb-9"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...cardSpring, delay: 0.05 }}
              >
                <MufuLogo size={52} animate />
                <motion.h1
                  className="text-[22px] md:text-2xl font-bold tracking-tight text-white mt-5 mb-1.5"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12, duration: 0.3 }}
                >
                  Welcome back
                </motion.h1>
                <motion.p
                  className="text-white/40 text-xs md:text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.18, duration: 0.3 }}
                >
                  Sign in to your private streaming platform
                </motion.p>
              </motion.div>

              {/* Error shake animation */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -5 }}
                    animate={{
                      opacity: 1,
                      height: "auto",
                      y: 0,
                      x: [0, -6, 6, -4, 4, -2, 2, 0],
                    }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-error/8 border border-error/15 text-error/90 text-sm p-3.5 rounded-xl mb-5 flex items-center gap-2.5 overflow-hidden"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-error animate-pulse shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form with staggered fields */}
              <motion.form
                onSubmit={handleSubmit}
                variants={stagger}
                initial="hidden"
                animate={mounted ? "show" : "hidden"}
                className="space-y-4 md:space-y-5"
              >
                {/* Username field */}
                <motion.div variants={fadeUp}>
                  <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
                    Username
                  </label>
                  <div className="relative group">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 group-focus-within:text-accent/70 transition-colors duration-150" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-accent/30 focus:bg-white/[0.05] focus:shadow-[0_0_0_3px_rgba(255,61,113,0.08),inset_0_0_20px_rgba(255,61,113,0.03)] transition-colors duration-150 text-sm"
                      placeholder="Enter your username"
                      autoComplete="username"
                    />
                  </div>
                </motion.div>

                {/* Password field */}
                <motion.div variants={fadeUp}>
                  <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 group-focus-within:text-accent/70 transition-colors duration-150" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl py-3.5 pl-11 pr-12 text-white placeholder:text-white/20 focus:outline-none focus:border-accent/30 focus:bg-white/[0.05] focus:shadow-[0_0_0_3px_rgba(255,61,113,0.08),inset_0_0_20px_rgba(255,61,113,0.03)] transition-colors duration-150 text-sm"
                      placeholder="Enter your password"
                      autoComplete="current-password"
                    />
                    <motion.button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      whileTap={{ scale: 0.85 }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </motion.button>
                  </div>
                </motion.div>

                {/* Login button */}
                <motion.div variants={fadeUp} className="pt-1 md:pt-2">
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: 1.01 }}
                    className="w-full relative overflow-hidden bg-accent hover:bg-accent/90 disabled:bg-accent/50 text-white font-semibold py-3.5 md:py-4 rounded-xl transition-colors duration-150 text-sm shadow-[0_0_30px_rgba(255,61,113,0.2)] hover:shadow-[0_0_40px_rgba(255,61,113,0.35)] disabled:shadow-none group"
                  >
                    {/* Shine sweep on hover */}
                    <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                    </span>

                    <span className="relative z-10">
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <motion.span
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                          />
                          <span className="text-white/70">Signing in…</span>
                        </span>
                      ) : (
                        "Sign In"
                      )}
                    </span>
                  </motion.button>
                </motion.div>
              </motion.form>

              {/* Footer */}
              <motion.p
                className="text-center text-white/15 text-[11px] mt-7 tracking-wide"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >
                Invite-only platform • Secure & Private
              </motion.p>
            </div>
          </motion.div>
        ) : (
          /* Success transition — zoom forward */
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center z-50 absolute inset-0"
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1.1] }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              <MufuLogo size={100} animate />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, type: "spring" as const, stiffness: 300, damping: 22 }}
              className="text-white text-2xl md:text-3xl font-bold mt-8 tracking-tight"
            >
              Welcome back
            </motion.h2>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
