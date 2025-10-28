'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { Card, CardHeader, CardContent, CardFooter, Button, Badge, LoadingSpinner } from '@/components/ui';

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
      theme: 'light'
    },
    stats: {
      totalReports: 87,
      reportsThisMonth: 23,
      avgResponseTime: 145
    }
  });

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
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
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setChangingPassword(false);
      alert('Password changed successfully');
    } catch (error) {
      console.error('Failed to change password:', error);
    }
  };

  const getRoleBadge = (role: string) => {
    const config: Record<string, { variant: 'danger' | 'warning' | 'info'; icon: string; label: string }> = {
      admin: { variant: 'danger', icon: '👑', label: 'Administrator' },
      supervisor: { variant: 'warning', icon: '👨‍💼', label: 'Supervisor' },
      psw: { variant: 'info', icon: '👨‍⚕️', label: 'Personal Support Worker' }
    };

    const { variant, icon, label } = config[role];
    return <Badge variant={variant}>{icon} {label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#030817] via-[#050d1f] to-[#0b142c]">
      <Navigation user={{ name: profile.fullName, role: profile.role, email: profile.email }} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
        </div>

        {/* Profile Card */}
        <Card className="mb-6">
          <CardContent>
            <div className="flex items-start space-x-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#1B365D] to-[#D4A574] flex items-center justify-center text-white text-5xl font-bold">
                  {profile.fullName.charAt(0).toUpperCase()}
                </div>
                <Button variant="ghost" size="sm" className="mt-3 w-full">
                  Change Photo
                </Button>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">{profile.fullName}</h2>
                    <p className="text-gray-600">@{profile.username}</p>
                  </div>
                  {getRoleBadge(profile.role)}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{profile.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium text-gray-900">{profile.phoneNumber || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Member Since</p>
                    <p className="font-medium text-gray-900">
                      {new Date(profile.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Login</p>
                    <p className="font-medium text-gray-900">
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
                      <Button size="sm" variant="warning">
                        Enable MFA
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card padding="sm">
            <div className="text-center p-4">
              <p className="text-4xl font-bold text-[#1B365D] mb-2">{profile.stats.totalReports}</p>
              <p className="text-sm text-gray-600">Total Reports</p>
            </div>
          </Card>
          <Card padding="sm">
            <div className="text-center p-4">
              <p className="text-4xl font-bold text-[#D4A574] mb-2">{profile.stats.reportsThisMonth}</p>
              <p className="text-sm text-gray-600">This Month</p>
            </div>
          </Card>
          <Card padding="sm">
            <div className="text-center p-4">
              <p className="text-4xl font-bold text-purple-600 mb-2">{profile.stats.avgResponseTime}ms</p>
              <p className="text-sm text-gray-600">Avg Response Time</p>
            </div>
          </Card>
        </div>

        {/* Edit Profile */}
        <Card className="mb-6">
          <CardHeader
            title="Profile Information"
            icon="✏️"
            action={
              !editing && (
                <Button size="sm" variant="primary" onClick={() => setEditing(true)}>
                  Edit Profile
                </Button>
              )
            }
          />
          <CardContent>
            {editing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profile.fullName}
                      onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={profile.username}
                      onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profile.phoneNumber}
                      onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Full Name</p>
                  <p className="text-lg font-medium text-gray-900">{profile.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Username</p>
                  <p className="text-lg font-medium text-gray-900">@{profile.username}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email Address</p>
                  <p className="text-lg font-medium text-gray-900">{profile.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                  <p className="text-lg font-medium text-gray-900">{profile.phoneNumber || 'Not set'}</p>
                </div>
              </div>
            )}
          </CardContent>
          {editing && (
            <CardFooter>
              <Button variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={saveProfile} loading={saving}>
                Save Changes
              </Button>
            </CardFooter>
          )}
        </Card>

        {/* Preferences */}
        <Card className="mb-6">
          <CardHeader title="Preferences" icon="⚙️" />
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language
                </label>
                <select
                  value={profile.preferences.language}
                  onChange={(e) => setProfile({
                    ...profile,
                    preferences: { ...profile.preferences, language: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
                >
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                  <option value="es">Español</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timezone
                </label>
                <select
                  value={profile.preferences.timezone}
                  onChange={(e) => setProfile({
                    ...profile,
                    preferences: { ...profile.preferences, timezone: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
                >
                  <option value="America/Toronto">Eastern Time (Toronto)</option>
                  <option value="America/Vancouver">Pacific Time (Vancouver)</option>
                  <option value="America/Chicago">Central Time (Chicago)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Theme
                </label>
                <select
                  value={profile.preferences.theme}
                  onChange={(e) => setProfile({
                    ...profile,
                    preferences: { ...profile.preferences, theme: e.target.value as any }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark (Coming Soon)</option>
                  <option value="auto">Auto (System)</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-600">Receive email alerts</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.preferences.emailNotifications}
                    onChange={(e) => setProfile({
                      ...profile,
                      preferences: { ...profile.preferences, emailNotifications: e.target.checked }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1B365D]"></div>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="mb-6">
          <CardHeader title="Security" icon="🔒" />
          <CardContent>
            <div className="space-y-4">
              {!changingPassword ? (
                <>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Password</p>
                      <p className="text-sm text-gray-600">Last changed: 30 days ago</p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => setChangingPassword(true)}>
                      Change Password
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Multi-Factor Authentication</p>
                      <p className="text-sm text-gray-600">
                        {profile.mfaEnabled ? 'Currently enabled' : 'Not enabled'}
                      </p>
                    </div>
                    <Link href="/settings/mfa">
                      <Button size="sm" variant="ghost">
                        {profile.mfaEnabled ? 'Manage MFA' : 'Enable MFA'}
                      </Button>
                    </Link>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Active Sessions</p>
                      <p className="text-sm text-gray-600">2 active sessions</p>
                    </div>
                    <Button size="sm" variant="danger">
                      Logout All Devices
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    <Button variant="ghost" onClick={() => setChangingPassword(false)}>
                      Cancel
                    </Button>
                    <Button variant="primary" onClick={changePassword}>
                      Change Password
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader title="Danger Zone" icon="⚠️" />
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                <div>
                  <p className="font-medium text-red-900">Export Account Data</p>
                  <p className="text-sm text-red-700">Download all your data in JSON format</p>
                </div>
                <Button size="sm" variant="ghost">
                  Export Data
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                <div>
                  <p className="font-medium text-red-900">Delete Account</p>
                  <p className="text-sm text-red-700">Permanently delete your account and all data</p>
                </div>
                <Button size="sm" variant="danger">
                  Delete Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
