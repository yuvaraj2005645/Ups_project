import React, { useState } from 'react';
import { User, Lock, Mail, Shield, CheckCircle2, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/userService';
import { authService } from '../../services/authService';
import { useToast } from '../../components/Toast';

export const ProfilePage: React.FC = () => {
  const { user, login } = useAuth();
  const { success, error } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsUpdatingProfile(true);
    try {
      await userService.update(user.id, { name, email });
      success('Profile Updated', 'Your identity details have been updated.');
    } catch (err: any) {
      error('Update failed', err.response?.data?.message || 'Could not update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      error('Password Mismatch', 'New password and confirmation do not match.');
      return;
    }
    if (newPassword.length < 6) {
      error('Too Short', 'Password must be at least 6 characters.');
      return;
    }

    setIsChangingPassword(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      success('Password Updated', 'Your login password has been changed.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      error('Password change failed', err.response?.data?.message || 'Invalid current password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">User Account Profile</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your personal identity credentials, authorization roles, and account security.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Info Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm pb-3 border-b border-slate-100">
            <User className="w-4 h-4 text-primary" />
            <span>Personal Information</span>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">System Role</label>
              <div className="px-3.5 py-2.5 bg-slate-100 rounded-xl font-mono font-bold text-slate-700 flex items-center justify-between">
                <span>{user?.role}</span>
                <Shield className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Roles are managed by system administrators.
              </p>
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isUpdatingProfile ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Update Profile</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm pb-3 border-b border-slate-100">
            <Lock className="w-4 h-4 text-primary" />
            <span>Security & Password</span>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <button
              type="submit"
              disabled={isChangingPassword}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isChangingPassword ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
