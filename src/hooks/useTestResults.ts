/**
 * Test Results Storage Hook
 * Provides localStorage persistence for cognitive test results.
 * Can be replaced with Firebase later.
 */

import { useState, useEffect, useCallback } from "react";
import type { ReactionTestResult } from "../components/tests/reaction/reactionFeatures";

const STORAGE_KEYS = {
    reactionResults: "cognitrack_reaction_results",
    lastSession: "cognitrack_last_session",
};

export interface StoredResults {
    reactionResults: ReactionTestResult[];
}

/**
 * Hook for managing reaction test results in localStorage.
 */
export function useReactionResults() {
    const [results, setResults] = useState<ReactionTestResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load results from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.reactionResults);
            if (stored) {
                const parsed = JSON.parse(stored) as ReactionTestResult[];
                // Convert date strings back to Date objects
                const withDates = parsed.map((r) => ({
                    ...r,
                    timestamp: new Date(r.timestamp),
                }));
                setResults(withDates);
            }
        } catch (error) {
            console.error("Failed to load reaction results:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Save a new result
    const saveResult = useCallback((result: ReactionTestResult) => {
        setResults((prev) => {
            const updated = [...prev, result];
            try {
                localStorage.setItem(STORAGE_KEYS.reactionResults, JSON.stringify(updated));
            } catch (error) {
                console.error("Failed to save reaction result:", error);
            }
            return updated;
        });
    }, []);

    // Get the latest result
    const getLatestResult = useCallback((): ReactionTestResult | null => {
        if (results.length === 0) return null;
        return results[results.length - 1];
    }, [results]);

    // Get all results sorted by date
    const getSortedResults = useCallback((): ReactionTestResult[] => {
        return [...results].sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
    }, [results]);

    // Clear all results
    const clearResults = useCallback(() => {
        setResults([]);
        localStorage.removeItem(STORAGE_KEYS.reactionResults);
    }, []);

    // Get baseline (average of first 2 sessions)
    const getBaseline = useCallback((): number | null => {
        if (results.length < 2) return null;
        const sorted = getSortedResults();
        const firstTwo = sorted.slice(0, 2);
        const avgSum = firstTwo.reduce((sum, r) => sum + r.aggregates.avg, 0);
        return avgSum / firstTwo.length;
    }, [results, getSortedResults]);

    return {
        results,
        isLoading,
        saveResult,
        getLatestResult,
        getSortedResults,
        clearResults,
        getBaseline,
    };
}

/**
 * Loads the last reaction result from session storage (immediate result after test).
 */
export function getLastReactionResult(): ReactionTestResult | null {
    try {
        const stored = sessionStorage.getItem("lastReactionResult");
        if (stored) {
            const parsed = JSON.parse(stored);
            return {
                ...parsed,
                timestamp: new Date(parsed.timestamp),
            };
        }
    } catch (error) {
        console.error("Failed to load last reaction result:", error);
    }
    return null;
}

/**
 * Clears the last reaction result from session storage.
 */
export function clearLastReactionResult(): void {
    sessionStorage.removeItem("lastReactionResult");
}
