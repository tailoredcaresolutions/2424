'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Button,
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
    <div className="min-h-screen bg-gradient-to-br from-[#030817] via-[#050d1f] to-[#0b142c]">
      <Navigation
        user={{
          name: profile.fullName,
          role: profile.role,
          email: profile.email,
        }}
      />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-gray-900 text-4xl font-bold">My Profile</h1>
          <p className="text-gray-600 mt-2">
            Manage your account information and preferences
          </p>
        </div>

        {/* Profile Card */}
        <Card className="mb-6">
          <CardContent>
            <div className="flex items-start space-x-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="rounded-full text-white flex h-32 w-32 items-center justify-center bg-gradient-to-br from-[#1B365D] to-[#D4A574] text-5xl font-bold">
                  {profile.fullName.charAt(0).toUpperCase()}
                </div>
                <Button variant="ghost" size="sm" className="mt-3 w-full">
                  Change Photo
                </Button>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-gray-900 text-3xl font-bold">
                      {profile.fullName}
                    </h2>
                    <p className="text-gray-600">@{profile.username}</p>
                  </div>
                  {getRoleBadge(profile.role)}
                </div>

                <div className="mb-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm">Email</p>
                    <p className="text-gray-900 font-medium">{profile.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Phone</p>
                    <p className="text-gray-900 font-medium">
                      {profile.phoneNumber || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Member Since</p>
                    <p className="text-gray-900 font-medium">
                      {new Date(profile.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Last Login</p>
                    <p className="text-gray-900 font-medium">
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
        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card padding="sm">
            <div className="p-4 text-center">
              <p className="mb-2 text-4xl font-bold text-[#1B365D]">
                {profile.stats.totalReports}
              </p>
              <p className="text-gray-600 text-sm">Total Reports</p>
            </div>
          </Card>
          <Card padding="sm">
            <div className="p-4 text-center">
              <p className="mb-2 text-4xl font-bold text-[#D4A574]">
                {profile.stats.reportsThisMonth}
              </p>
              <p className="text-gray-600 text-sm">This Month</p>
            </div>
          </Card>
          <Card padding="sm">
            <div className="p-4 text-center">
              <p className="text-purple-600 mb-2 text-4xl font-bold">
                {profile.stats.avgResponseTime}ms
              </p>
              <p className="text-gray-600 text-sm">Avg Response Time</p>
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
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setEditing(true)}
                >
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
                    <label className="text-gray-700 mb-1 block text-sm font-medium">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profile.fullName}
                      onChange={(e) =>
                        setProfile({ ...profile, fullName: e.target.value })
                      }
                      className="border-gray-300 focus:border-transparent w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-[#1B365D]"
                    />
                  </div>
                  <div>
                    <label className="text-gray-700 mb-1 block text-sm font-medium">
                      Username
                    </label>
                    <input
                      type="text"
                      value={profile.username}
                      onChange={(e) =>
                        setProfile({ ...profile, username: e.target.value })
                      }
                      className="border-gray-300 focus:border-transparent w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-[#1B365D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-700 mb-1 block text-sm font-medium">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) =>
                        setProfile({ ...profile, email: e.target.value })
                      }
                      className="border-gray-300 focus:border-transparent w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-[#1B365D]"
                    />
                  </div>
                  <div>
                    <label className="text-gray-700 mb-1 block text-sm font-medium">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profile.phoneNumber}
                      onChange={(e) =>
                        setProfile({ ...profile, phoneNumber: e.target.value })
                      }
                      className="border-gray-300 focus:border-transparent w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-[#1B365D]"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-600 mb-1 text-sm">Full Name</p>
                  <p className="text-gray-900 text-lg font-medium">
                    {profile.fullName}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1 text-sm">Username</p>
                  <p className="text-gray-900 text-lg font-medium">
                    @{profile.username}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1 text-sm">Email Address</p>
                  <p className="text-gray-900 text-lg font-medium">
                    {profile.email}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1 text-sm">Phone Number</p>
                  <p className="text-gray-900 text-lg font-medium">
                    {profile.phoneNumber || 'Not set'}
                  </p>
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
                <label className="text-gray-700 mb-1 block text-sm font-medium">
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
                  className="border-gray-300 focus:border-transparent w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-[#1B365D]"
                >
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                  <option value="es">Español</option>
                </select>
              </div>

              <div>
                <label className="text-gray-700 mb-1 block text-sm font-medium">
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
                  className="border-gray-300 focus:border-transparent w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-[#1B365D]"
                >
                  <option value="America/Toronto">
                    Eastern Time (Toronto)
                  </option>
                  <option value="America/Vancouver">
                    Pacific Time (Vancouver)
                  </option>
                  <option value="America/Chicago">
                    Central Time (Chicago)
                  </option>
                </select>
              </div>

              <div>
                <label className="text-gray-700 mb-1 block text-sm font-medium">
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
                  className="border-gray-300 focus:border-transparent w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-[#1B365D]"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark (Coming Soon)</option>
                  <option value="auto">Auto (System)</option>
                </select>
              </div>

              <div className="bg-gray-50 flex items-center justify-between rounded-lg p-4">
                <div>
                  <p className="text-gray-900 font-medium">
                    Email Notifications
                  </p>
                  <p className="text-gray-600 text-sm">Receive email alerts</p>
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
                  <div className="bg-gray-200 peer-focus:ring-blue-300 rounded-full peer-checked:after:border-white after:bg-white after:border-gray-300 after:rounded-full peer h-6 w-11 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:border after:transition-all after:content-[''] peer-checked:bg-[#1B365D] peer-checked:after:translate-x-full peer-focus:outline-none peer-focus:ring-4"></div>
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
                  <div className="bg-gray-50 flex items-center justify-between rounded-lg p-4">
                    <div>
                      <p className="text-gray-900 font-medium">Password</p>
                      <p className="text-gray-600 text-sm">
                        Last changed: 30 days ago
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setChangingPassword(true)}
                    >
                      Change Password
                    </Button>
                  </div>

                  <div className="bg-gray-50 flex items-center justify-between rounded-lg p-4">
                    <div>
                      <p className="text-gray-900 font-medium">
                        Multi-Factor Authentication
                      </p>
                      <p className="text-gray-600 text-sm">
                        {profile.mfaEnabled
                          ? 'Currently enabled'
                          : 'Not enabled'}
                      </p>
                    </div>
                    <Link href="/settings/mfa">
                      <Button size="sm" variant="ghost">
                        {profile.mfaEnabled ? 'Manage MFA' : 'Enable MFA'}
                      </Button>
                    </Link>
                  </div>

                  <div className="bg-gray-50 flex items-center justify-between rounded-lg p-4">
                    <div>
                      <p className="text-gray-900 font-medium">
                        Active Sessions
                      </p>
                      <p className="text-gray-600 text-sm">2 active sessions</p>
                    </div>
                    <Button size="sm" variant="danger">
                      Logout All Devices
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-700 mb-1 block text-sm font-medium">
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
                      className="border-gray-300 focus:border-transparent w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-[#1B365D]"
                    />
                  </div>

                  <div>
                    <label className="text-gray-700 mb-1 block text-sm font-medium">
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
                      className="border-gray-300 focus:border-transparent w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-[#1B365D]"
                    />
                  </div>

                  <div>
                    <label className="text-gray-700 mb-1 block text-sm font-medium">
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
                      className="border-gray-300 focus:border-transparent w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-[#1B365D]"
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    <Button
                      variant="ghost"
                      onClick={() => setChangingPassword(false)}
                    >
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
              <div className="bg-red-50 border-red-200 flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="text-red-900 font-medium">
                    Export Account Data
                  </p>
                  <p className="text-red-700 text-sm">
                    Download all your data in JSON format
                  </p>
                </div>
                <Button size="sm" variant="ghost">
                  Export Data
                </Button>
              </div>

              <div className="bg-red-50 border-red-200 flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="text-red-900 font-medium">Delete Account</p>
                  <p className="text-red-700 text-sm">
                    Permanently delete your account and all data
                  </p>
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
