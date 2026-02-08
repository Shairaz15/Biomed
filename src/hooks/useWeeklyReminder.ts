/**
 * Weekly Reminder Hook
 * Sends email reminders when user hasn't taken an assessment in 7+ days.
 * Since we're on Firebase Spark (free), this runs client-side when user visits the dashboard.
 */

import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    sendWeeklyReminder,
    isEmailConfigured,
    getEmailPreferences,
    recordReminderSent,
    getDaysSinceAssessment
} from '../services/emailService';
import { STORAGE_KEYS } from './useTestResults';

const STORAGE_KEY_LAST_REMINDER = 'cognitrack_last_reminder_sent';
const STORAGE_KEY_FIRST_TEST_DATE = 'cognitrack_first_test_date';

export function useWeeklyReminder() {
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        const checkAndSendReminder = async () => {
            // 1. Check if email is configured
            if (!isEmailConfigured()) {
                console.log('EmailJS not configured, skipping email reminder');
                return;
            }

            // 2. Check user preferences
            const prefs = getEmailPreferences();
            if (!prefs.enabled) {
                console.log('Email reminders disabled by user');
                return;
            }

            // 3. Check if user has taken at least one test (has baseline)
            const hasReactionTests = localStorage.getItem(STORAGE_KEYS.reactionResults);
            const hasMemoryTests = localStorage.getItem(STORAGE_KEYS.memoryResults);
            const hasPatternTests = localStorage.getItem(STORAGE_KEYS.patternResults);
            const hasLanguageTests = localStorage.getItem(STORAGE_KEYS.languageResults);

            const hasAnyTests = hasReactionTests || hasMemoryTests || hasPatternTests || hasLanguageTests;
            if (!hasAnyTests) {
                console.log('No tests taken yet, skipping reminder');
                return;
            }

            // 4. Get last assessment date
            const getLastAssessmentDate = (): Date | null => {
                const dates: Date[] = [];

                try {
                    if (hasReactionTests) {
                        const results = JSON.parse(hasReactionTests);
                        if (results.length > 0) {
                            dates.push(new Date(results[results.length - 1].timestamp));
                        }
                    }
                    if (hasMemoryTests) {
                        const results = JSON.parse(hasMemoryTests);
                        if (results.length > 0) {
                            dates.push(new Date(results[results.length - 1].timestamp));
                        }
                    }
                    if (hasPatternTests) {
                        const results = JSON.parse(hasPatternTests);
                        if (results.length > 0) {
                            dates.push(new Date(results[results.length - 1].timestamp));
                        }
                    }
                    if (hasLanguageTests) {
                        const results = JSON.parse(hasLanguageTests);
                        if (results.length > 0) {
                            dates.push(new Date(results[results.length - 1].timestamp));
                        }
                    }
                } catch (e) {
                    console.error('Error parsing test dates:', e);
                }

                if (dates.length === 0) return null;
                return dates.sort((a, b) => b.getTime() - a.getTime())[0]; // Most recent
            };

            const lastAssessment = getLastAssessmentDate();
            if (!lastAssessment) return;

            const daysSinceLast = getDaysSinceAssessment(lastAssessment);

            // 5. Only send if more than 7 days since last assessment
            if (daysSinceLast < 7) {
                console.log(`Only ${daysSinceLast} days since last assessment, no reminder needed`);
                return;
            }

            // 6. Check if we already sent a reminder today
            const lastReminderStr = localStorage.getItem(STORAGE_KEY_LAST_REMINDER);
            if (lastReminderStr) {
                const lastReminderDate = new Date(lastReminderStr);
                const today = new Date().toDateString();
                if (lastReminderDate.toDateString() === today) {
                    console.log('Already sent reminder today');
                    return;
                }
            }

            // 7. Send the email reminder
            console.log(`Sending weekly reminder - ${daysSinceLast} days since last assessment`);

            try {
                const success = await sendWeeklyReminder({
                    toName: user.displayName || 'there',
                    toEmail: user.email || prefs.email,
                    daysSinceLastAssessment: daysSinceLast,
                });

                if (success) {
                    recordReminderSent();
                    localStorage.setItem(STORAGE_KEY_LAST_REMINDER, new Date().toISOString());
                    console.log('Weekly reminder email sent successfully!');

                    // Also show browser notification if supported
                    if ('Notification' in window && Notification.permission === 'granted') {
                        new Notification('CogniTrack Reminder Sent', {
                            body: 'Check your email for your weekly cognitive assessment reminder!',
                            icon: '/favicon.ico',
                            tag: 'reminder-sent'
                        });
                    }
                }
            } catch (error) {
                console.error('Failed to send weekly reminder:', error);
            }
        };

        // Run after a short delay to not block page load
        const timer = setTimeout(checkAndSendReminder, 2000);
        return () => clearTimeout(timer);
    }, [user]);
}
