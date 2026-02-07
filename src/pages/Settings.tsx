/**
 * Settings Page
 * User preferences for email notifications and account management.
 */

import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { PageWrapper } from '../components/layout/PageWrapper';
import './Settings.css';

interface UserPreferences {
    emailNotifications: boolean;
    lastReminderSent?: Date;
}

export function Settings() {
    const { user } = useAuth();
    const [preferences, setPreferences] = useState<UserPreferences>({
        emailNotifications: true,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        if (!user) return;

        const loadPreferences = async () => {
            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setPreferences({
                        emailNotifications: data.preferences?.emailNotifications ?? true,
                        lastReminderSent: data.preferences?.lastReminderSent?.toDate(),
                    });
                }
            } catch (error) {
                console.error('Error loading preferences:', error);
            } finally {
                setLoading(false);
            }
        };

        loadPreferences();
    }, [user]);

    const handleToggleNotifications = async (enabled: boolean) => {
        if (!user) return;

        setSaving(true);
        setMessage(null);

        try {
            await updateDoc(doc(db, 'users', user.uid), {
                'preferences.emailNotifications': enabled,
                'preferences.updatedAt': serverTimestamp(),
            });
            setPreferences((prev) => ({ ...prev, emailNotifications: enabled }));
            setMessage({ type: 'success', text: 'Preferences saved!' });
        } catch (error) {
            console.error('Error saving preferences:', error);
            setMessage({ type: 'error', text: 'Failed to save preferences' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <PageWrapper>
                <div className="settings-loading">Loading settings...</div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            <div className="settings-page">
                <header className="settings-header">
                    <h1>Settings</h1>
                    <p>Manage your account preferences</p>
                </header>

                <section className="settings-section">
                    <h2>Account</h2>
                    <div className="setting-item">
                        <div className="setting-info">
                            <span className="setting-label">Email</span>
                            <span className="setting-value">{user?.email}</span>
                        </div>
                    </div>
                    <div className="setting-item">
                        <div className="setting-info">
                            <span className="setting-label">Display Name</span>
                            <span className="setting-value">{user?.displayName || 'Not set'}</span>
                        </div>
                    </div>
                </section>

                <section className="settings-section">
                    <h2>Notifications</h2>
                    <div className="setting-item">
                        <div className="setting-info">
                            <span className="setting-label">Weekly Reminder Emails</span>
                            <span className="setting-description">
                                Receive a reminder every Sunday to complete your cognitive assessments
                            </span>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={preferences.emailNotifications}
                                onChange={(e) => handleToggleNotifications(e.target.checked)}
                                disabled={saving}
                            />
                            <span className="toggle-slider" />
                        </label>
                    </div>
                    {preferences.lastReminderSent && (
                        <p className="last-reminder-info">
                            Last reminder sent: {preferences.lastReminderSent.toLocaleDateString()}
                        </p>
                    )}
                </section>

                {message && (
                    <div className={`settings-message ${message.type}`}>
                        {message.text}
                    </div>
                )}
            </div>
        </PageWrapper>
    );
}
