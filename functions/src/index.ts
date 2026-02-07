/**
 * Firebase Cloud Functions Entry Point
 * Exports all Cloud Functions for the CogniTrack application.
 */

export { setAdminRole } from './auth/setAdminRole';
export { updateMetrics } from './triggers/updateMetrics';
export { weeklyReminder } from './scheduled/weeklyReminder';
export { logAdminAction } from './admin/logAdminAction';
