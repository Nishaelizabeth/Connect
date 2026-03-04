import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User,
    Mail,
    Lock,
    Camera,
    Save,
    ArrowLeft,
    Eye,
    EyeOff,
    CheckCircle,
    AlertCircle,
    Loader2,
    Trash2,
    Shield,
    Calendar,
} from 'lucide-react';
import { Navbar } from '@/components/ui/navbar';
import Sidebar from '@/components/dashboard/Sidebar';
import { getUser, setUser } from '@/utils/storage';
import { getMe, updateProfile, changePassword, updateEmail } from '@/api/auth.api';

// ─── Types ───────────────────────────────────────────────────────────────────

interface User {
    id: number;
    email: string;
    full_name: string;
    bio: string;
    profile_picture_url: string | null;
    google_picture_url: string | null;
    auth_provider: string;
    date_joined?: string;
}

type AlertType = 'success' | 'error';

interface AlertState {
    type: AlertType;
    message: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SectionCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({
    title,
    icon,
    children,
}) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                {icon}
            </div>
            <h2 className="font-semibold text-gray-900">{title}</h2>
        </div>
        <div className="px-6 py-5">{children}</div>
    </div>
);

const Alert: React.FC<AlertState & { onDismiss: () => void }> = ({ type, message, onDismiss }) => (
    <div
        className={`flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm ${
            type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-red-50 text-red-700 border border-red-200'
        }`}
    >
        {type === 'success' ? (
            <CheckCircle className="w-4 h-4 shrink-0" />
        ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
        )}
        <span className="flex-1">{message}</span>
        <button onClick={onDismiss} className="text-inherit opacity-60 hover:opacity-100 ml-1 leading-none">
            ×
        </button>
    </div>
);

const PasswordInput: React.FC<
    React.InputHTMLAttributes<HTMLInputElement> & { label: string }
> = ({ label, ...props }) => {
    const [show, setShow] = useState(false);
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
            <div className="relative">
                <input
                    {...props}
                    type={show ? 'text' : 'password'}
                    className="w-full pr-10 pl-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const SettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [user, setUserState] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Profile section
    const [profileForm, setProfileForm] = useState({ full_name: '', bio: '' });
    const [avatar, setAvatar] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [removePicture, setRemovePicture] = useState(false);
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileAlert, setProfileAlert] = useState<AlertState | null>(null);

    // Email section
    const [emailForm, setEmailForm] = useState({ new_email: '', current_password: '' });
    const [emailSaving, setEmailSaving] = useState(false);
    const [emailAlert, setEmailAlert] = useState<AlertState | null>(null);

    // Password section
    const [passwordForm, setPasswordForm] = useState({
        current_password: '',
        new_password: '',
        confirm_password: '',
    });
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [passwordAlert, setPasswordAlert] = useState<AlertState | null>(null);

    // ── Fetch user ────────────────────────────────────────────────────────────
    useEffect(() => {
        const load = async () => {
            try {
                const data = await getMe();
                setUserState(data as unknown as User);
                setProfileForm({ full_name: data.full_name || '', bio: data.bio || '' });
                setAvatarPreview(data.profile_picture_url || data.google_picture_url || null);
            } catch {
                // fallback to stored user
                const stored = getUser();
                if (stored) {
                    setUserState(stored);
                    setProfileForm({ full_name: stored.full_name || '', bio: stored.bio || '' });
                    setAvatarPreview(stored.profile_picture_url || null);
                }
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // ── Avatar selection ──────────────────────────────────────────────────────
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatar(file);
        setRemovePicture(false);
        const reader = new FileReader();
        reader.onload = () => setAvatarPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleRemovePicture = () => {
        setAvatar(null);
        setAvatarPreview(null);
        setRemovePicture(true);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // ── Save profile ──────────────────────────────────────────────────────────
    const handleProfileSave = async () => {
        setProfileSaving(true);
        setProfileAlert(null);
        try {
            const updated = await updateProfile({
                full_name: profileForm.full_name,
                bio: profileForm.bio,
                profile_picture: avatar || undefined,
                remove_picture: removePicture,
            });
            setUserState((prev) => ({ ...prev!, ...updated } as User));
            setUser({ ...getUser(), ...updated }); // sync local storage
            setAvatar(null);
            setRemovePicture(false);
            setAvatarPreview((updated as any).profile_picture_url || null);
            setProfileAlert({ type: 'success', message: 'Profile updated successfully.' });
        } catch (err: any) {
            const detail =
                err.response?.data?.detail ||
                Object.values(err.response?.data || {}).flat().join(' ') ||
                'Failed to update profile.';
            setProfileAlert({ type: 'error', message: String(detail) });
        } finally {
            setProfileSaving(false);
        }
    };

    // ── Save email ────────────────────────────────────────────────────────────
    const handleEmailSave = async () => {
        setEmailSaving(true);
        setEmailAlert(null);
        try {
            const updated = await updateEmail(emailForm);
            setUserState((prev) => ({ ...prev!, email: updated.email }));
            setUser({ ...getUser(), email: updated.email }); // sync local storage
            setEmailForm({ new_email: '', current_password: '' });
            setEmailAlert({ type: 'success', message: 'Email updated successfully.' });
        } catch (err: any) {
            const detail =
                err.response?.data?.current_password ||
                err.response?.data?.new_email ||
                err.response?.data?.detail ||
                'Failed to update email.';
            setEmailAlert({ type: 'error', message: String(detail) });
        } finally {
            setEmailSaving(false);
        }
    };

    // ── Save password ─────────────────────────────────────────────────────────
    const handlePasswordSave = async () => {
        if (passwordForm.new_password !== passwordForm.confirm_password) {
            setPasswordAlert({ type: 'error', message: 'New passwords do not match.' });
            return;
        }
        setPasswordSaving(true);
        setPasswordAlert(null);
        try {
            await changePassword(passwordForm);
            setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
            setPasswordAlert({ type: 'success', message: 'Password changed successfully.' });
        } catch (err: any) {
            const detail =
                err.response?.data?.current_password ||
                err.response?.data?.detail ||
                Object.values(err.response?.data || {}).flat().join(' ') ||
                'Failed to change password.';
            setPasswordAlert({ type: 'error', message: String(detail) });
        } finally {
            setPasswordSaving(false);
        }
    };

    const avatarInitial = user?.full_name?.charAt(0)?.toUpperCase() || '?';

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <Sidebar activeItem="" onItemClick={() => {}} userName="" />
                <main className="pt-20 ml-56 flex items-center justify-center h-[80vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Sidebar activeItem="" onItemClick={() => {}} userName={user?.full_name || ''} />

            <main className="pt-20 ml-56 p-8 max-w-3xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Manage your profile and security</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* ── Profile Section ─────────────────────────────────── */}
                    <SectionCard title="Profile Information" icon={<User className="w-4 h-4" />}>
                        <div className="space-y-5">
                            {/* Avatar */}
                            <div className="flex items-center gap-5">
                                <div className="relative w-20 h-20 shrink-0">
                                    {avatarPreview ? (
                                        <img
                                            src={avatarPreview}
                                            alt="Avatar"
                                            className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                                        />
                                    ) : (
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center border-2 border-gray-200">
                                            <span className="text-white font-bold text-2xl">{avatarInitial}</span>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center shadow hover:bg-blue-700 transition-colors"
                                    >
                                        <Camera className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Upload new photo
                                    </button>
                                    {(avatarPreview || user?.profile_picture_url) && (
                                        <button
                                            onClick={handleRemovePicture}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Remove photo
                                        </button>
                                    )}
                                    <p className="text-xs text-gray-400">JPG, PNG or GIF · Max 5 MB</p>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarChange}
                                />
                            </div>

                            {/* Full name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                                <input
                                    type="text"
                                    value={profileForm.full_name}
                                    onChange={(e) => setProfileForm((p) => ({ ...p, full_name: e.target.value }))}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Your full name"
                                />
                            </div>

                            {/* Bio */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
                                <textarea
                                    rows={3}
                                    value={profileForm.bio}
                                    onChange={(e) => setProfileForm((p) => ({ ...p, bio: e.target.value }))}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    placeholder="Tell others a little about yourself…"
                                />
                                <p className="text-xs text-gray-400 mt-1">{profileForm.bio.length}/300 characters</p>
                            </div>

                            {profileAlert && (
                                <Alert {...profileAlert} onDismiss={() => setProfileAlert(null)} />
                            )}

                            <div className="flex justify-end">
                                <button
                                    onClick={handleProfileSave}
                                    disabled={profileSaving}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
                                >
                                    {profileSaving ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    Save Profile
                                </button>
                            </div>
                        </div>
                    </SectionCard>

                    {/* ── Email Section ────────────────────────────────────── */}
                    <SectionCard title="Email Address" icon={<Mail className="w-4 h-4" />}>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                                <span className="text-sm text-gray-700 font-medium">{user?.email}</span>
                                <span className="ml-auto text-xs text-gray-400">Current</span>
                            </div>

                            {user?.auth_provider === 'google' ? (
                                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                                    <Shield className="w-4 h-4 shrink-0 mt-0.5" />
                                    Email is managed by Google and cannot be changed here.
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            New Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={emailForm.new_email}
                                            onChange={(e) =>
                                                setEmailForm((p) => ({ ...p, new_email: e.target.value }))
                                            }
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="new@example.com"
                                        />
                                    </div>
                                    <PasswordInput
                                        label="Current Password (to confirm)"
                                        value={emailForm.current_password}
                                        onChange={(e) =>
                                            setEmailForm((p) => ({ ...p, current_password: e.target.value }))
                                        }
                                        placeholder="Enter your current password"
                                    />

                                    {emailAlert && (
                                        <Alert {...emailAlert} onDismiss={() => setEmailAlert(null)} />
                                    )}

                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleEmailSave}
                                            disabled={
                                                emailSaving || !emailForm.new_email || !emailForm.current_password
                                            }
                                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
                                        >
                                            {emailSaving ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Save className="w-4 h-4" />
                                            )}
                                            Update Email
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </SectionCard>

                    {/* ── Password Section ─────────────────────────────────── */}
                    {user?.auth_provider !== 'google' && (
                        <SectionCard title="Change Password" icon={<Lock className="w-4 h-4" />}>
                            <div className="space-y-4">
                                <PasswordInput
                                    label="Current Password"
                                    value={passwordForm.current_password}
                                    onChange={(e) =>
                                        setPasswordForm((p) => ({ ...p, current_password: e.target.value }))
                                    }
                                    placeholder="Enter your current password"
                                />
                                <PasswordInput
                                    label="New Password"
                                    value={passwordForm.new_password}
                                    onChange={(e) =>
                                        setPasswordForm((p) => ({ ...p, new_password: e.target.value }))
                                    }
                                    placeholder="At least 8 characters"
                                />
                                <PasswordInput
                                    label="Confirm New Password"
                                    value={passwordForm.confirm_password}
                                    onChange={(e) =>
                                        setPasswordForm((p) => ({ ...p, confirm_password: e.target.value }))
                                    }
                                    placeholder="Repeat new password"
                                />

                                {passwordAlert && (
                                    <Alert {...passwordAlert} onDismiss={() => setPasswordAlert(null)} />
                                )}

                                <div className="flex justify-end">
                                    <button
                                        onClick={handlePasswordSave}
                                        disabled={
                                            passwordSaving ||
                                            !passwordForm.current_password ||
                                            !passwordForm.new_password ||
                                            !passwordForm.confirm_password
                                        }
                                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
                                    >
                                        {passwordSaving ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Lock className="w-4 h-4" />
                                        )}
                                        Change Password
                                    </button>
                                </div>
                            </div>
                        </SectionCard>
                    )}

                
                </div>
            </main>
        </div>
    );
};

export default SettingsPage;
