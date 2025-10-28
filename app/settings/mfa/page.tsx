'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Navigation from '@/components/Navigation';
import { Card, CardHeader, CardContent, CardFooter, Button, Badge, LoadingSpinner } from '@/components/ui';

interface MFAStatus {
  enrolled: boolean;
  enrolledAt?: string;
  backupCodesRemaining?: number;
}

interface EnrollmentData {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export default function MFAPage() {
  const [mfaStatus, setMfaStatus] = useState<MFAStatus | null>(null);
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [step, setStep] = useState<'status' | 'enroll' | 'verify'>('status');

  useEffect(() => {
    fetchMFAStatus();
  }, []);

  const fetchMFAStatus = async () => {
    setLoading(true);
    try {
      // Mock status for now - replace with actual API call
      const mockStatus: MFAStatus = {
        enrolled: false,
        backupCodesRemaining: 0
      };

      setMfaStatus(mockStatus);
      setStep(mockStatus.enrolled ? 'status' : 'status');
    } catch (err) {
      setError('Failed to fetch MFA status');
    } finally {
      setLoading(false);
    }
  };

  const startEnrollment = async () => {
    setEnrolling(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/mfa/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 1 }) // Replace with actual user ID
      });

      const data = await response.json();

      if (data.success) {
        setEnrollmentData(data.data);
        setStep('verify');
      } else {
        setError(data.error || 'Failed to start enrollment');
      }
    } catch (err) {
      setError('Error connecting to MFA service');
    } finally {
      setEnrolling(false);
    }
  };

  const verifyEnrollment = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setVerifying(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/mfa/verify-enrollment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 1, // Replace with actual user ID
          token: verificationCode,
          secret: enrollmentData?.secret
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('MFA successfully enabled!');
        setStep('status');
        fetchMFAStatus();
      } else {
        setError(data.error || 'Invalid verification code');
      }
    } catch (err) {
      setError('Error verifying code');
    } finally {
      setVerifying(false);
    }
  };

  const disableMFA = async () => {
    if (!confirm('Are you sure you want to disable MFA? This will reduce your account security.')) {
      return;
    }

    try {
      // API call to disable MFA
      console.log('Disabling MFA');
      await fetchMFAStatus();
      setSuccess('MFA has been disabled');
    } catch (err) {
      setError('Failed to disable MFA');
    }
  };

  const downloadBackupCodes = () => {
    if (!enrollmentData?.backupCodes) return;

    const text = [
      'PSW Voice Documentation System - MFA Backup Codes',
      '==============================================',
      '',
      'IMPORTANT: Store these codes in a safe place!',
      'Each code can only be used once.',
      '',
      ...enrollmentData.backupCodes.map((code, i) => `${i + 1}. ${code}`),
      '',
      `Generated: ${new Date().toLocaleString()}`,
    ].join('\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mfa-backup-codes-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#030817] via-[#050d1f] to-[#0b142c]">
        <Navigation user={{ name: 'User', role: 'psw', email: 'user@tailoredcare.ca' }} />
        <LoadingSpinner fullScreen text="Loading MFA settings..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#030817] via-[#050d1f] to-[#0b142c]">
      <Navigation user={{ name: 'User', role: 'psw', email: 'user@tailoredcare.ca' }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Multi-Factor Authentication</h1>
          <p className="text-gray-600 mt-2">Enhance your account security with MFA</p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            ✅ {success}
          </div>
        )}

        {/* Status View */}
        {step === 'status' && mfaStatus && (
          <Card>
            <CardHeader
              title="MFA Status"
              icon="🔒"
              action={
                mfaStatus.enrolled ? (
                  <Badge variant="success">✅ Enabled</Badge>
                ) : (
                  <Badge variant="warning">⚠️ Not Enabled</Badge>
                )
              }
            />
            <CardContent>
              {mfaStatus.enrolled ? (
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Multi-factor authentication is currently <span className="font-bold text-green-600">enabled</span> for your account.
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-600">Enabled On</p>
                      <p className="text-lg font-bold text-gray-900">
                        {mfaStatus.enrolledAt
                          ? new Date(mfaStatus.enrolledAt).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-600">Backup Codes Remaining</p>
                      <p className="text-lg font-bold text-gray-900">
                        {mfaStatus.backupCodesRemaining || 0} / 10
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-bold text-blue-900 mb-2">✅ Your account is protected</h4>
                    <p className="text-sm text-blue-800">
                      You&rsquo;ll be prompted for a verification code from your authenticator app when logging in.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Multi-factor authentication is currently <span className="font-bold text-amber-600">not enabled</span> for your account.
                  </p>

                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <h4 className="font-bold text-amber-900 mb-2">⚠️ Enhance your security</h4>
                    <p className="text-sm text-amber-800 mb-3">
                      Enable MFA to add an extra layer of protection to your account. You&rsquo;ll need an authenticator app like:
                    </p>
                    <ul className="text-sm text-amber-800 space-y-1 ml-4">
                      <li>• Google Authenticator (iOS/Android)</li>
                      <li>• Microsoft Authenticator (iOS/Android)</li>
                      <li>• Authy (iOS/Android/Desktop)</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-bold text-gray-900 mb-2">How it works:</h4>
                    <ol className="text-sm text-gray-700 space-y-2">
                      <li>1️⃣ Scan a QR code with your authenticator app</li>
                      <li>2️⃣ Enter the 6-digit code to verify</li>
                      <li>3️⃣ Save your backup codes in a safe place</li>
                      <li>4️⃣ Use your authenticator app for all future logins</li>
                    </ol>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              {mfaStatus.enrolled ? (
                <>
                  <Button variant="secondary" onClick={() => console.log('Generate new backup codes')}>
                    🔄 Generate New Backup Codes
                  </Button>
                  <Button variant="danger" onClick={disableMFA}>
                    🔓 Disable MFA
                  </Button>
                </>
              ) : (
                <Button variant="primary" onClick={startEnrollment} loading={enrolling}>
                  🔒 Enable MFA
                </Button>
              )}
            </CardFooter>
          </Card>
        )}

        {/* Enrollment View - QR Code */}
        {step === 'verify' && enrollmentData && (
          <>
            <Card className="mb-6">
              <CardHeader title="Step 1: Scan QR Code" icon="📱" />
              <CardContent>
                <div className="flex flex-col items-center space-y-4">
                  <p className="text-gray-700 text-center">
                    Scan this QR code with your authenticator app
                  </p>

                  {/* QR Code */}
                  <div className="p-6 bg-white border-4 border-[#1B365D] rounded-xl">
                    <Image
                      src={enrollmentData.qrCode}
                      alt="MFA QR Code"
                      width={256}
                      height={256}
                      className="w-64 h-64"
                      priority
                    />
                  </div>

                  {/* Manual entry option */}
                  <details className="w-full">
                    <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                      Can&rsquo;t scan? Enter key manually
                    </summary>
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Secret Key:</p>
                      <code className="text-sm font-mono bg-white px-3 py-2 rounded border border-gray-300 block">
                        {enrollmentData.secret}
                      </code>
                    </div>
                  </details>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader title="Step 2: Verify Code" icon="🔢" />
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Enter the 6-digit code from your authenticator app to complete setup
                </p>

                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="flex-1 px-4 py-3 text-2xl font-mono text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
                    maxLength={6}
                  />
                  <Button
                    variant="primary"
                    onClick={verifyEnrollment}
                    loading={verifying}
                    disabled={verificationCode.length !== 6}
                  >
                    Verify & Enable
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Backup Codes */}
            <Card className="mt-6">
              <CardHeader title="Step 3: Save Backup Codes" icon="💾" />
              <CardContent>
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                  <p className="text-sm text-amber-800 font-medium">
                    ⚠️ Important: Save these backup codes in a secure location. Each code can only be used once.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  {enrollmentData.backupCodes.map((code, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <code className="text-sm font-mono">{code}</code>
                    </div>
                  ))}
                </div>

                <Button variant="secondary" onClick={downloadBackupCodes} fullWidth>
                  📥 Download Backup Codes
                </Button>
              </CardContent>
            </Card>

            <div className="mt-6 flex justify-center">
              <Button
                variant="ghost"
                onClick={() => {
                  setStep('status');
                  setEnrollmentData(null);
                  setVerificationCode('');
                }}
              >
                ← Back to Status
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
