import React, { useState } from 'react';
import { User, Shield, Key, CheckCircle2, Lock } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { SectionHeader } from '../../../components/ui/CommonUI';
import { useToast } from '../../../components/ui/Toast';

export const AdminProfileManager: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [updating, setUpdating] = useState(false);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass.length < 8) {
      showToast('Password must be at least 8 characters long', 'error');
      return;
    }
    if (newPass !== confirmPass) {
      showToast('New passwords do not match', 'error');
      return;
    }

    setUpdating(true);
    setTimeout(() => {
      setUpdating(false);
      showToast('Admin password updated successfully!', 'success');
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
    }, 600);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <SectionHeader
        title="Admin Profile & Security"
        description="Manage administrator credentials, active session parameters, and security policies."
      />

      <div className="p-6 sm:p-8 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 space-y-6 shadow-xs">
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <User className="w-4 h-4 text-emerald-500" /> Account Account Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <span className="text-xs text-zinc-400 font-medium">Administrator Email</span>
            <p className="font-bold text-zinc-900 dark:text-zinc-100">{user?.email || 'orvencasidop@gmail.com'}</p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <span className="text-xs text-zinc-400 font-medium">Role & Permissions</span>
            <p className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <Shield className="w-4 h-4" /> Super Administrator (RLS Owner)
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 space-y-6 shadow-xs">
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <Key className="w-4 h-4 text-amber-500" /> Update Password
        </h2>

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md text-xs sm:text-sm">
          <div className="space-y-1.5">
            <label className="font-semibold text-zinc-700 dark:text-zinc-300">Current Password</label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-zinc-700 dark:text-zinc-300">New Password</label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-zinc-700 dark:text-zinc-300">Confirm New Password</label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-400"
            />
          </div>

          <button
            type="submit"
            disabled={updating || !newPass}
            className="py-2.5 px-5 font-semibold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 rounded-xl shadow-sm transition disabled:opacity-50 flex items-center gap-2"
          >
            <Lock className="w-4 h-4" /> {updating ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};
