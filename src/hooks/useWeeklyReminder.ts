import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const STORAGE_KEY_LAST_REMINDER = 'last_weekly_reminder_check';

export function useWeeklyReminder() {
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        const checkAndNotify = async () => {
            // 1. Check if browser supports notifications
            if (!('Notification' in window)) {
                console.log('This browser does not support desktop notification');
                return;
            }

            // 2. Request permission if needed
            if (Notification.permission === 'default') {
                await Notification.requestPermission();
            }

            if (Notification.permission !== 'granted') {
                return;
            }

            // 3. Check last reminder time
            const lastCheckStr = localStorage.getItem(STORAGE_KEY_LAST_REMINDER);
            const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
            const now = Date.now();

            if (lastCheckStr) {
                const lastCheckTime = parseInt(lastCheckStr, 10);
                if (now - lastCheckTime < sevenDaysMs) {
                    // Less than 7 days, don't notify
                    return;
                }
            }

            // 4. Send Notification
            new Notification('CogniTrack Weekly Reminder', {
                body: "It's been a while! Take a quick 5-minute assessment to track your cognitive health.",
                icon: '/logo192.png', // Assuming pwa icon exists, or use default
                badge: '/favicon.ico',
                tag: 'weekly-reminder'
            });

            // 5. Update last check time
            localStorage.setItem(STORAGE_KEY_LAST_REMINDER, now.toString());
        };

        checkAndNotify();
    }, [user]);
}
