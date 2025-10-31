'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import {
  Badge,
  LoadingSpinner,
} from '@/components/ui';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: 'admin' | 'supervisor' | 'psw';
  phoneNumber?: string;
  avatar?: string;
  mfaEnabled: boolean;
  createdAt: string;
  lastLogin: string;
  preferences: {
    language: string;
    timezone: string;
    emailNotifications: boolean;
    theme: 'light' | 'dark' | 'auto';
  };
  stats: {
    totalReports: number;
    reportsThisMonth: number;
    avgResponseTime: number;
  };
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>({
    id: 2,
    username: 'sarah.johnson',
    email: 'sarah.johnson@tailoredcare.ca',
    fullName: 'Sarah Johnson',
    role: 'psw',
    phoneNumber: '+1 (555) 123-4567',
    mfaEnabled: true,
    createdAt: '2025-01-15T00:00:00Z',
    lastLogin: new Date().toISOString(),
    preferences: {
      language: 'en',
      timezone: 'America/Toronto',
      emailNotifications: true,
      theme: 'light',
    },
    stats: {
      totalReports: 87,
      reportsThisMonth: 23,
      avgResponseTime: 145,
    },
  });

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const saveProfile = async () => {
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Saving profile:', profile);
      setEditing(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 12) {
      alert('Password must be at least 12 characters');
      return;
    }

    try {
      // API call to change password
      console.log('Changing password');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setChangingPassword(false);
      alert('Password changed successfully');
    } catch (error) {
      console.error('Failed to change password:', error);
    }
  };

  const getRoleBadge = (role: string) => {
    const config: Record<
      string,
      { variant: 'danger' | 'warning' | 'info'; icon: string; label: string }
    > = {
      admin: { variant: 'danger', icon: '👑', label: 'Administrator' },
      supervisor: { variant: 'warning', icon: '👨‍💼', label: 'Supervisor' },
      psw: { variant: 'info', icon: '👨‍⚕️', label: 'Personal Support Worker' },
    };

    const { variant, icon, label } = config[role];
    return (
      <Badge variant={variant}>
        {icon} {label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-tcs-blue-primary via-tcs-blue-mid to-tcs-blue-light relative overflow-hidden">
      {/* Enhanced background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-[var(--tcs-gold)]/8 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-[var(--tcs-blue-light)]/8 rounded-full blur-3xl" />
      </div>

      <Navigation
        user={{
          name: profile.fullName,
          role: profile.role,
          email: profile.email,
        }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-white text-4xl md:text-5xl font-bold mb-3 drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]">My Profile</h1>
          <p className="text-white/70 text-lg">
            Manage your account information and preferences
          </p>
        </div>

        {/* Profile Card */}
        <div className="liquid-glass-card rounded-glass-lg mb-6 p-6 md:p-8 border border-white/20 shadow-[0_15px_40px_rgba(0,0,0,0.3)]">
          <div className="flex items-start space-x-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="rounded-full text-white flex h-32 w-32 items-center justify-center bg-gradient-to-br from-[var(--tcs-blue-primary)] to-[var(--tcs-gold)] text-5xl font-bold shadow-[0_10px_30px_rgba(212,165,116,0.4)]">
                {profile.fullName.charAt(0).toUpperCase()}
              </div>
              <button className="liquid-glass-light text-white rounded-glass-md mt-3 w-full px-4 py-2 text-sm font-semibold border border-white/20 hover:border-white/30 transition-all">
                Change Photo
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-white text-3xl md:text-4xl font-bold">
                    {profile.fullName}
                  </h2>
                  <p className="text-white/70">@{profile.username}</p>
                </div>
                {getRoleBadge(profile.role)}
              </div>

              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-white/60 text-sm">Email</p>
                  <p className="text-white font-medium">{profile.email}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Phone</p>
                  <p className="text-white font-medium">
                    {profile.phoneNumber || 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Member Since</p>
                  <p className="text-white font-medium">
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Last Login</p>
                  <p className="text-white font-medium">
                    {new Date(profile.lastLogin).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Badge variant={profile.mfaEnabled ? 'success' : 'warning'}>
                  {profile.mfaEnabled ? '🔒 MFA Enabled' : '⚠️ MFA Disabled'}
                </Badge>
                {!profile.mfaEnabled && (
                  <Link href="/settings/mfa">
                    <button className="touch-target liquid-glass-gold text-[var(--tcs-blue-deep)] rounded-glass-md px-4 py-2 text-sm font-semibold shadow-[0_8px_20px_rgba(212,165,116,0.4)] hover:shadow-[0_12px_30px_rgba(212,165,116,0.5)] transition-all">
                      Enable MFA
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="liquid-glass-card rounded-glass-lg p-6 border border-white/20 shadow-[0_15px_40px_rgba(0,0,0,0.3)]">
            <div className="text-center">
              <p className="mb-2 text-4xl font-bold text-white">
                {profile.stats.totalReports}
              </p>
              <p className="text-white/70 text-sm">Total Reports</p>
            </div>
          </div>
          <div className="liquid-glass-card rounded-glass-lg p-6 border border-white/20 shadow-[0_15px_40px_rgba(0,0,0,0.3)]">
            <div className="text-center">
              <p className="mb-2 text-4xl font-bold text-[var(--tcs-gold)]">
                {profile.stats.reportsThisMonth}
              </p>
              <p className="text-white/70 text-sm">This Month</p>
            </div>
          </div>
          <div className="liquid-glass-card rounded-glass-lg p-6 border border-white/20 shadow-[0_15px_40px_rgba(0,0,0,0.3)]">
            <div className="text-center">
              <p className="text-purple-300 mb-2 text-4xl font-bold">
                {profile.stats.avgResponseTime}ms
              </p>
              <p className="text-white/70 text-sm">Avg Response Time</p>
            </div>
          </div>
        </div>

        {/* Edit Profile */}
        <div className="liquid-glass-card rounded-glass-lg mb-6 p-6 md:p-8 border border-white/20 shadow-[0_15px_40px_rgba(0,0,0,0.3)]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✏️</span>
              <h2 className="text-2xl font-bold text-white">Profile Information</h2>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="touch-target liquid-glass-gold text-[var(--tcs-blue-deep)] rounded-glass-lg px-6 py-2 text-sm font-semibold shadow-[0_8px_20px_rgba(212,165,116,0.4)] hover:shadow-[0_12px_30px_rgba(212,165,116,0.5)] transition-all"
              >
                Edit Profile
              </button>
            )}
          </div>
          {editing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/90 mb-1 block text-sm font-medium">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.fullName}
                    onChange={(e) =>
                      setProfile({ ...profile, fullName: e.target.value })
                    }
                    className="liquid-glass-light text-white placeholder-white/60 w-full rounded-glass-md border border-white/20 px-4 py-3 focus:border-[var(--tcs-gold)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--tcs-gold)]/30 transition-all"
                  />
                </div>
                <div>
                  <label className="text-white/90 mb-1 block text-sm font-medium">
                    Username
                  </label>
                  <input
                    type="text"
                    value={profile.username}
                    onChange={(e) =>
                      setProfile({ ...profile, username: e.target.value })
                    }
                    className="liquid-glass-light text-white placeholder-white/60 w-full rounded-glass-md border border-white/20 px-4 py-3 focus:border-[var(--tcs-gold)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--tcs-gold)]/30 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/90 mb-1 block text-sm font-medium">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                    className="liquid-glass-light text-white placeholder-white/60 w-full rounded-glass-md border border-white/20 px-4 py-3 focus:border-[var(--tcs-gold)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--tcs-gold)]/30 transition-all"
                  />
                </div>
                <div>
                  <label className="text-white/90 mb-1 block text-sm font-medium">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profile.phoneNumber}
                    onChange={(e) =>
                      setProfile({ ...profile, phoneNumber: e.target.value })
                    }
                    className="liquid-glass-light text-white placeholder-white/60 w-full rounded-glass-md border border-white/20 px-4 py-3 focus:border-[var(--tcs-gold)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--tcs-gold)]/30 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => setEditing(false)}
                  className="touch-target liquid-glass-light text-white rounded-glass-lg px-6 py-2 font-semibold border border-white/20 hover:border-white/30 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="touch-target liquid-glass-gold text-[var(--tcs-blue-deep)] rounded-glass-lg px-6 py-2 font-semibold shadow-[0_10px_25px_rgba(212,165,116,0.4)] hover:shadow-[0_15px_35px_rgba(212,165,116,0.5)] transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-white/60 mb-1 text-sm">Full Name</p>
                <p className="text-white text-lg font-medium">
                  {profile.fullName}
                </p>
              </div>
              <div>
                <p className="text-white/60 mb-1 text-sm">Username</p>
                <p className="text-white text-lg font-medium">
                  @{profile.username}
                </p>
              </div>
              <div>
                <p className="text-white/60 mb-1 text-sm">Email Address</p>
                <p className="text-white text-lg font-medium">
                  {profile.email}
                </p>
              </div>
              <div>
                <p className="text-white/60 mb-1 text-sm">Phone Number</p>
                <p className="text-white text-lg font-medium">
                  {profile.phoneNumber || 'Not set'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Preferences */}
        <div className="liquid-glass-card rounded-glass-lg mb-6 p-6 md:p-8 border border-white/20 shadow-[0_15px_40px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">⚙️</span>
            <h2 className="text-2xl font-bold text-white">Preferences</h2>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-white/90 mb-1 block text-sm font-medium">
                Language
              </label>
              <select
                value={profile.preferences.language}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    preferences: {
                      ...profile.preferences,
                      language: e.target.value,
                    },
                  })
                }
                className="liquid-glass-light text-white w-full rounded-glass-md border border-white/20 px-4 py-3 focus:border-[var(--tcs-gold)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--tcs-gold)]/30 transition-all"
              >
                <option value="en" className="bg-[var(--tcs-blue-dark)]">English</option>
                <option value="fr" className="bg-[var(--tcs-blue-dark)]">Français</option>
                <option value="es" className="bg-[var(--tcs-blue-dark)]">Español</option>
              </select>
            </div>

            <div>
              <label className="text-white/90 mb-1 block text-sm font-medium">
                Timezone
              </label>
              <select
                value={profile.preferences.timezone}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    preferences: {
                      ...profile.preferences,
                      timezone: e.target.value,
                    },
                  })
                }
                className="liquid-glass-light text-white w-full rounded-glass-md border border-white/20 px-4 py-3 focus:border-[var(--tcs-gold)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--tcs-gold)]/30 transition-all"
              >
                <option value="America/Toronto" className="bg-[var(--tcs-blue-dark)]">
                  Eastern Time (Toronto)
                </option>
                <option value="America/Vancouver" className="bg-[var(--tcs-blue-dark)]">
                  Pacific Time (Vancouver)
                </option>
                <option value="America/Chicago" className="bg-[var(--tcs-blue-dark)]">
                  Central Time (Chicago)
                </option>
              </select>
            </div>

            <div>
              <label className="text-white/90 mb-1 block text-sm font-medium">
                Theme
              </label>
              <select
                value={profile.preferences.theme}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    preferences: {
                      ...profile.preferences,
                      theme: e.target.value as any,
                    },
                  })
                }
                className="liquid-glass-light text-white w-full rounded-glass-md border border-white/20 px-4 py-3 focus:border-[var(--tcs-gold)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--tcs-gold)]/30 transition-all"
              >
                <option value="light" className="bg-[var(--tcs-blue-dark)]">Light</option>
                <option value="dark" className="bg-[var(--tcs-blue-dark)]">Dark (Coming Soon)</option>
                <option value="auto" className="bg-[var(--tcs-blue-dark)]">Auto (System)</option>
              </select>
            </div>

            <div className="liquid-glass-light flex items-center justify-between rounded-glass-md p-4 border border-white/10">
              <div>
                <p className="text-white font-medium">
                  Email Notifications
                </p>
                <p className="text-white/60 text-sm">Receive email alerts</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={profile.preferences.emailNotifications}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      preferences: {
                        ...profile.preferences,
                        emailNotifications: e.target.checked,
                      },
                    })
                  }
                  className="peer sr-only"
                />
                <div className="bg-white/20 peer-focus:ring-[var(--tcs-gold)] rounded-full peer-checked:after:border-white after:bg-white after:border-white/30 after:rounded-full peer h-7 w-12 after:absolute after:left-[2px] after:top-[2px] after:h-6 after:w-6 after:border after:transition-all after:content-[''] peer-checked:bg-[var(--tcs-gold)] peer-checked:after:translate-x-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--tcs-gold)]/50"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="liquid-glass-card rounded-glass-lg mb-6 p-6 md:p-8 border border-white/20 shadow-[0_15px_40px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">🔒</span>
            <h2 className="text-2xl font-bold text-white">Security</h2>
          </div>
          <div className="space-y-4">
            {!changingPassword ? (
              <>
                <div className="liquid-glass-light flex items-center justify-between rounded-glass-md p-4 border border-white/10">
                  <div>
                    <p className="text-white font-medium">Password</p>
                    <p className="text-white/60 text-sm">
                      Last changed: 30 days ago
                    </p>
                  </div>
                  <button
                    onClick={() => setChangingPassword(true)}
                    className="touch-target liquid-glass-light text-white rounded-glass-md px-4 py-2 text-sm font-semibold border border-white/20 hover:border-white/30 transition-all"
                  >
                    Change Password
                  </button>
                </div>

                <div className="liquid-glass-light flex items-center justify-between rounded-glass-md p-4 border border-white/10">
                  <div>
                    <p className="text-white font-medium">
                      Multi-Factor Authentication
                    </p>
                    <p className="text-white/60 text-sm">
                      {profile.mfaEnabled
                        ? 'Currently enabled'
                        : 'Not enabled'}
                    </p>
                  </div>
                  <Link href="/settings/mfa">
                    <button className="touch-target liquid-glass-light text-white rounded-glass-md px-4 py-2 text-sm font-semibold border border-white/20 hover:border-white/30 transition-all">
                      {profile.mfaEnabled ? 'Manage MFA' : 'Enable MFA'}
                    </button>
                  </Link>
                </div>

                <div className="liquid-glass-light flex items-center justify-between rounded-glass-md p-4 border border-white/10">
                  <div>
                    <p className="text-white font-medium">
                      Active Sessions
                    </p>
                    <p className="text-white/60 text-sm">2 active sessions</p>
                  </div>
                  <button className="touch-target liquid-glass-light text-red-300 rounded-glass-md px-4 py-2 text-sm font-semibold border border-red-400/30 hover:border-red-400/50 transition-all">
                    Logout All Devices
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-white/90 mb-1 block text-sm font-medium">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    className="liquid-glass-light text-white placeholder-white/60 w-full rounded-glass-md border border-white/20 px-4 py-3 focus:border-[var(--tcs-gold)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--tcs-gold)]/30 transition-all"
                  />
                </div>

                <div>
                  <label className="text-white/90 mb-1 block text-sm font-medium">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    className="liquid-glass-light text-white placeholder-white/60 w-full rounded-glass-md border border-white/20 px-4 py-3 focus:border-[var(--tcs-gold)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--tcs-gold)]/30 transition-all"
                  />
                </div>

                <div>
                  <label className="text-white/90 mb-1 block text-sm font-medium">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="liquid-glass-light text-white placeholder-white/60 w-full rounded-glass-md border border-white/20 px-4 py-3 focus:border-[var(--tcs-gold)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--tcs-gold)]/30 transition-all"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setChangingPassword(false)}
                    className="touch-target liquid-glass-light text-white rounded-glass-lg px-6 py-2 font-semibold border border-white/20 hover:border-white/30 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={changePassword}
                    className="touch-target liquid-glass-gold text-[var(--tcs-blue-deep)] rounded-glass-lg px-6 py-2 font-semibold shadow-[0_10px_25px_rgba(212,165,116,0.4)] hover:shadow-[0_15px_35px_rgba(212,165,116,0.5)] transition-all"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="liquid-glass-card rounded-glass-lg p-6 md:p-8 border border-red-400/40 shadow-[0_15px_40px_rgba(239,68,68,0.3)]">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">⚠️</span>
            <h2 className="text-2xl font-bold text-red-200">Danger Zone</h2>
          </div>
          <div className="space-y-4">
            <div className="liquid-glass-light flex items-center justify-between rounded-glass-md p-4 border border-red-400/30">
              <div>
                <p className="text-red-200 font-medium">
                  Export Account Data
                </p>
                <p className="text-red-300/80 text-sm">
                  Download all your data in JSON format
                </p>
              </div>
              <button className="touch-target liquid-glass-light text-red-200 rounded-glass-md px-4 py-2 text-sm font-semibold border border-red-400/30 hover:border-red-400/50 transition-all">
                Export Data
              </button>
            </div>

            <div className="liquid-glass-light flex items-center justify-between rounded-glass-md p-4 border border-red-400/30">
              <div>
                <p className="text-red-200 font-medium">Delete Account</p>
                <p className="text-red-300/80 text-sm">
                  Permanently delete your account and all data
                </p>
              </div>
              <button className="touch-target liquid-glass-light text-red-200 rounded-glass-md px-4 py-2 text-sm font-semibold border border-red-400/40 hover:border-red-400/60 hover:bg-red-500/20 transition-all">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
