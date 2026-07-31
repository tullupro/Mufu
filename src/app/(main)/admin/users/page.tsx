"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, UserPlus, Trash2, Shield, User } from "lucide-react";
import { DeleteConfirmModal, Toast } from "@/components/premium-ui";

interface UserData {
  id: string;
  username: string;
  role: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserData | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load users on mount — proper useEffect instead of render-loop fetch
  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => {
        setUsers(data.users || []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername, password: newPassword }),
      });
      if (res.ok) {
        const data = await res.json();
        setUsers((prev) => [...prev, data.user]);
        setNewUsername("");
        setNewPassword("");
        setShowCreate(false);
        showToast(`User "${data.user.username}" created`);
      } else {
        showToast("Failed to create user", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    // Optimistic removal
    const removedUser = deleteTarget;
    const previousUsers = [...users];
    setUsers((prev) => prev.filter((u) => u.id !== removedUser.id));
    setDeleteTarget(null);
    setDeleting(false);
    showToast(`User "${removedUser.username}" deleted`);

    try {
      const res = await fetch(`/api/admin/users?id=${removedUser.id}`, { method: "DELETE" });
      if (!res.ok) {
        setUsers(previousUsers);
        showToast("Failed to delete user", "error");
      }
    } catch {
      setUsers(previousUsers);
      showToast("Network error — user restored", "error");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 md:mb-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-1">Manage Users</h1>
          <p className="text-white/50 text-sm">Create and manage platform accounts</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreate(!showCreate)}
          className="bg-accent hover:bg-accent/90 text-white px-5 py-3 rounded-xl font-medium transition-colors duration-100 flex items-center gap-2 shadow-[0_0_20px_rgba(255,61,113,0.3)] text-sm"
        >
          <UserPlus size={18} /> Create User
        </motion.button>
      </div>

      {/* Create User Form */}
      {showCreate && (
        <motion.form
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          transition={{ duration: 0.18 }}
          onSubmit={handleCreateUser}
          className="glass-panel p-5 md:p-6 rounded-2xl mb-6 md:mb-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Username</label>
              <input
                type="text"
                required
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 transition-colors duration-150 text-sm"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 transition-colors duration-150 text-sm"
                placeholder="Enter password"
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreate(false)}
              className="px-4 py-2.5 rounded-xl text-white/50 hover:bg-white/5 text-sm transition-colors duration-100"
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              disabled={creating}
              whileTap={{ scale: 0.95 }}
              className="bg-accent hover:bg-accent/90 text-white px-5 py-2.5 rounded-xl font-medium text-sm disabled:opacity-50 transition-colors duration-100"
            >
              {creating ? "Creating..." : "Create Account"}
            </motion.button>
          </div>
        </motion.form>
      )}

      {/* User List */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="p-5 md:p-6 border-b border-white/5 bg-white/5">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Users size={18} /> All Users ({users.length})
          </h2>
        </div>
        {!loaded ? (
          <div className="p-8 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white/20 border-t-accent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-white/40">No users found</div>
        ) : (
          <div className="divide-y divide-white/5">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 md:p-5 hover:bg-white/5 transition-colors duration-100">
                <div className="flex items-center gap-3 md:gap-4 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${user.role === "ADMIN" ? "bg-accent/20 text-accent" : "bg-secondary/20 text-secondary"}`}>
                    {user.role === "ADMIN" ? <Shield size={18} /> : <User size={18} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-medium truncate">{user.username}</p>
                    <p className="text-xs text-white/40">{user.role} • Joined {new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                {user.role !== "ADMIN" && (
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => setDeleteTarget(user)}
                    className="text-white/30 hover:text-error transition-colors duration-100 p-2 shrink-0"
                    aria-label="Delete user"
                  >
                    <Trash2 size={18} />
                  </motion.button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteTarget?.username}"? This action cannot be undone.`}
        onConfirm={handleDeleteUser}
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
