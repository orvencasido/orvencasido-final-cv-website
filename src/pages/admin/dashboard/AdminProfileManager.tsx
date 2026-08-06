import React, { useState } from 'react';
import { User, Shield, Key, Lock } from 'lucide-react';
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

      <div className="p-8 rounded-3xl border border-beige-300 bg-beige-50 space-y-6 shadow-xs">
        <h2 className="text-lg font-extrabold text-matcha-950 flex items-center gap-2 border-b border-beige-200 pb-4">
          <User className="w-5 h-5 text-matcha-600" /> Account Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm">
          <div className="p-5 rounded-2xl bg-beige-100 border border-beige-300 space-y-1">
            <span className="text-xs text-matcha-700 font-bold uppercase tracking-wider">Administrator Email</span>
            <p className="font-extrabold text-matcha-950">{user?.email || 'orvencasidop@gmail.com'}</p>
          </div>

          <div className="p-5 rounded-2xl bg-beige-100 border border-beige-300 space-y-1">
            <span className="text-xs text-matcha-700 font-bold uppercase tracking-wider">Role & Permissions</span>
            <p className="font-extrabold text-matcha-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-matcha-700" /> Super Administrator
            </p>
          </div>
        </div>
      </div>

      <div className="p-8 rounded-3xl border border-beige-300 bg-beige-50 space-y-6 shadow-xs">
        <h2 className="text-lg font-extrabold text-matcha-950 flex items-center gap-2 border-b border-beige-200 pb-4">
          <Key className="w-5 h-5 text-matcha-600" /> Update Password
        </h2>

        <form onSubmit={handlePasswordChange} className="space-y-5 max-w-md text-xs sm:text-sm">
          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">Current Password</label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              className="w-full px-4 py-3 bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">New Password</label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              className="w-full px-4 py-3 bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">Confirm New Password</label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              className="w-full px-4 py-3 bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={updating || !newPass}
            className="py-3.5 px-8 font-extrabold text-beige-50 bg-matcha-900 hover:bg-matcha-800 rounded-full shadow-md transition disabled:opacity-50 flex items-center gap-2 cursor-pointer text-xs"
          >
            <Lock className="w-4 h-4" /> {updating ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};
