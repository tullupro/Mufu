"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Film, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Toast } from "@/components/premium-ui";

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setProgress(0);

    try {
      // 1. Get resumable upload URL
      const initRes = await fetch("/api/upload/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type,
          size: file.size,
        }),
      });

      if (!initRes.ok) {
        throw new Error(await initRes.text());
      }

      const { uploadUrl } = await initRes.json();

      // 2. Upload file chunks directly to Google Drive via XMLHttpRequest for progress
      const uploadFile = () => new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl, true);
        xhr.setRequestHeader("Content-Type", file.type);
        
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            setProgress(percentComplete);
          }
        };

        xhr.onload = function () {
          if (this.status >= 200 && this.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error("Upload to Drive failed"));
          }
        };

        xhr.onerror = function () {
          reject(new Error("Network error during upload"));
        };

        xhr.send(file);
      });

      const driveResponse: any = await uploadFile();

      // 3. Save to database
      await fetch("/api/upload/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: driveResponse.id,
          title,
          description,
        }),
      });

      setProgress(100);
      setUploadComplete(true);
      setIsUploading(false);
      
      // Navigate immediately — no artificial 2s wait
      setTimeout(() => {
        router.push("/admin");
      }, 800);
    } catch (error: any) {
      console.error(error);
      showToast(error?.message || "Upload failed. Please try again.", "error");
      setIsUploading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 relative flex flex-col items-center">
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-3xl">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-white">Upload Video</h1>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => router.back()}
            className="text-white/50 hover:text-white transition-colors duration-100"
          >
            <X size={24} />
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          {uploadComplete ? (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring" as const, stiffness: 500, damping: 30 }}
              className="glass-panel p-16 rounded-3xl flex flex-col items-center justify-center text-center"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring" as const, stiffness: 500, damping: 25 }}
                className="w-24 h-24 bg-success/20 text-success rounded-full flex items-center justify-center mb-6"
              >
                <CheckCircle2 size={48} />
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-2">Upload Complete</h2>
              <p className="text-white/50">Your video is now available in your library.</p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.18 }}
              onSubmit={handleUpload}
              className="glass-panel p-8 md:p-12 rounded-3xl"
            >
              {!file ? (
                <div className="border-2 border-dashed border-white/10 hover:border-accent/50 bg-white/5 rounded-2xl p-16 text-center cursor-pointer transition-colors duration-150 group relative overflow-hidden">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="bg-accent/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                    <Upload size={32} className="text-accent" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Drag & Drop or Click</h3>
                  <p className="text-white/40 text-sm">MP4, WebM, or MKV up to 10GB</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-start gap-6 bg-white/5 p-6 rounded-2xl border border-white/10">
                    <div className="w-16 h-16 bg-black/50 rounded-xl flex items-center justify-center text-accent shrink-0">
                      <Film size={28} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h3 className="font-semibold text-white truncate mb-1">{file.name}</h3>
                      <p className="text-sm text-white/50">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                    {!isUploading && (
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.85 }}
                        onClick={() => setFile(null)}
                        className="text-white/40 hover:text-error transition-colors duration-100 p-2"
                      >
                        <X size={20} />
                      </motion.button>
                    )}
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">Title</label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-colors duration-150"
                        placeholder="Enter video title"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">Description</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-colors duration-150 resize-none"
                        placeholder="What is this video about?"
                      />
                    </div>
                  </div>

                  {isUploading ? (
                    <div className="mt-8">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-white/70 font-medium">Uploading to Google Drive...</span>
                        <span className="text-accent font-bold">{Math.round(progress)}%</span>
                      </div>
                      <div className="h-3 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-accent to-[#ff7a9b] relative"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ type: "spring" as const, bounce: 0, duration: 0.3 }}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        </motion.div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-4 mt-8 pt-6 border-t border-white/10">
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.back()}
                        className="px-6 py-4 rounded-xl text-white/70 hover:bg-white/5 font-medium transition-colors duration-100"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        type="submit"
                        whileTap={{ scale: 0.97 }}
                        className="flex-1 bg-accent hover:bg-accent/90 text-white font-bold p-4 rounded-xl transition-colors duration-100 shadow-[0_0_20px_rgba(255,61,113,0.3)] hover:shadow-[0_0_30px_rgba(255,61,113,0.5)]"
                      >
                        Upload Video
                      </motion.button>
                    </div>
                  )}
                </div>
              )}
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* Toast for errors */}
      <Toast
        message={toast?.message || ""}
        type={toast?.type}
        isVisible={!!toast}
      />
    </div>
  );
}
