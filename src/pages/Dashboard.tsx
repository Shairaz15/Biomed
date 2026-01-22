import { useMemo, useEffect, useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardContent, RiskBadge, Button } from "../components/common";
import { PageWrapper } from "../components/layout";
import { DEMO_SESSIONS, getDemoSessionDataPoints, DEMO_USER } from "../demo";
import { analyzeTrends } from "../ai/trendAnalyzer";
import { detectAnomalies, createBaseline } from "../ai/anomalyDetector";
import { computeRisk } from "../ai/riskEngine";
import type { ReactionTestResult } from "../components/tests/reaction/reactionFeatures";
import "./Dashboard.css";

export function Dashboard() {
    // Toggle between demo mode and real data
    const [showDemoData, setShowDemoData] = useState(() => {
        return sessionStorage.getItem("demoMode") === "true";
    });

    // Load reaction test results from localStorage
    const [reactionResults, setReactionResults] = useState<ReactionTestResult[]>([]);

    useEffect(() => {
        try {
            const stored = localStorage.getItem("cognitrack_reaction_results");
            if (stored) {
                const parsed = JSON.parse(stored) as ReactionTestResult[];
                const withDates = parsed.map((r) => ({
                    ...r,
                    timestamp: new Date(r.timestamp),
                }));
                setReactionResults(withDates);
            }
        } catch (error) {
            console.error("Failed to load reaction results:", error);
        }
    }, []);

    // Toggle demo mode
    const toggleDemoMode = () => {
        setShowDemoData((prev) => {
            const newValue = !prev;
            sessionStorage.setItem("demoMode", String(newValue));
            return newValue;
        });
    };

    // Determine data source
    const hasUserData = reactionResults.length > 0;
    const sessions = DEMO_SESSIONS;
    const sessionDataPoints = getDemoSessionDataPoints();

    // Calculate risk analysis from demo data
    const riskAnalysis = useMemo(() => {
        if (sessions.length < 2) return null;

        const allFeatures = sessions.map((s) => s.features);
        const baseline = createBaseline(allFeatures.slice(0, 2));
        const latestFeatures = sessions[sessions.length - 1].features;
        const slopes = analyzeTrends(sessionDataPoints);
        const anomaly = detectAnomalies(latestFeatures, allFeatures.slice(0, -1));

        return computeRisk(latestFeatures, baseline, slopes, anomaly);
    }, [sessions, sessionDataPoints]);

    // Prepare chart data for demo sessions
    const chartData = sessions.map((session, index) => ({
        name: `Session ${index + 1}`,
        date: session.timestamp.toLocaleDateString(),
        memory: Math.round(session.features.memoryAccuracy * 100),
        reaction: Math.round(session.features.reactionTimeAvg),
        pattern: Math.round(session.features.patternScore * 100),
        speech: Math.round(session.features.speechWPM),
    }));

    // Prepare chart data for user's reaction test results
    const userReactionChartData = reactionResults.map((result, index) => ({
        name: `Test ${index + 1}`,
        date: new Date(result.timestamp).toLocaleDateString(),
        avgReaction: result.aggregates.avg,
        consistency: Math.round(result.aggregates.consistencyScore * 100),
        fatigueSlope: result.aggregates.fatigueSlope,
    }));

    // Get latest user reaction result
    const latestReaction = reactionResults.length > 0 ? reactionResults[reactionResults.length - 1] : null;

    return (
        <PageWrapper>
            <div className="dashboard container">
                <div className="dashboard-header">
                    <div>
                        <h1>Performance Dashboard</h1>
                        <p className="text-secondary">
                            {showDemoData
                                ? `Demo User: ${DEMO_USER.name}`
                                : "Track your cognitive performance trends over time"}
                        </p>
                    </div>
                    <button
                        className={`mode-toggle ${showDemoData ? "demo-active" : "real-active"}`}
                        onClick={toggleDemoMode}
                    >
                        {showDemoData ? "Demo Mode" : "Your Data"}
                    </button>
                </div>

                {/* User's Reaction Test Results - Only show if not in demo mode and user has data */}
                {!showDemoData && hasUserData && latestReaction && (
                    <Card className="user-results animate-fadeIn">
                        <CardHeader
                            title="⚡ Your Latest Reaction Assessment"
                            subtitle={`Completed ${new Date(latestReaction.timestamp).toLocaleDateString()}`}
                        />
                        <CardContent>
                            <div className="user-stats-grid">
                                <div className="stat-item">
                                    <span className="stat-value">{latestReaction.aggregates.avg}</span>
                                    <span className="stat-label">Avg Response (ms)</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">{latestReaction.aggregates.median}</span>
                                    <span className="stat-label">Median (ms)</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">{Math.round(latestReaction.aggregates.consistencyScore * 100)}%</span>
                                    <span className="stat-label">Consistency</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">{latestReaction.falseStartCount}</span>
                                    <span className="stat-label">False Starts</span>
                                </div>
                            </div>
                            {latestReaction.derivedFeatures && (
                                <div className="derived-features">
                                    <span className="features-label">AI Analysis:</span>
                                    <span className="feature-tag">Stability: {Math.round(latestReaction.derivedFeatures.stabilityIndex * 100)}%</span>
                                    <span className="feature-tag">Fatigue: {latestReaction.derivedFeatures.fatigueSlope > 0 ? "+" : ""}{latestReaction.derivedFeatures.fatigueSlope.toFixed(1)}ms/round</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* No data message when in real data mode with no tests */}
                {!showDemoData && !hasUserData && (
                    <Card className="no-data-card">
                        <CardContent>
                            <div className="no-data-message">
                                <span className="no-data-icon">📊</span>
                                <h3>No Assessment Data Yet</h3>
                                <p>Complete a cognitive test to see your personal performance trends.</p>
                                <Button variant="primary" onClick={() => window.location.href = "/tests"}>
                                    Take Your First Test
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* User Reaction Time History Chart */}
                {!showDemoData && hasUserData && userReactionChartData.length > 1 && (
                    <Card className="chart-card user-chart">
                        <CardHeader title="Your Reaction Time History" subtitle="Average response time per session" />
                        <CardContent>
                            <div className="chart-container">
                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={userReactionChartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                                        <YAxis stroke="#64748b" fontSize={12} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "#1e293b",
                                                border: "1px solid rgba(255,255,255,0.1)",
                                                borderRadius: "8px",
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="avgReaction"
                                            stroke="#38bdf8"
                                            strokeWidth={3}
                                            dot={{ fill: "#38bdf8", r: 6 }}
                                            name="Avg Reaction (ms)"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Risk Summary Card (Demo Data) */}
                {showDemoData && riskAnalysis && (
                    <Card className="risk-summary animate-fadeIn">
                        <div className="risk-summary-header">
                            <div>
                                <h2>Demo Trend Analysis</h2>
                                <RiskBadge level={riskAnalysis.riskLevel} />
                            </div>
                            <div className="risk-confidence">
                                <span className="label">Confidence</span>
                                <span className="value">
                                    {Math.round(riskAnalysis.riskConfidenceScore * 100)}%
                                </span>
                            </div>
                        </div>
                        <p className="risk-message">{riskAnalysis.riskMessage}</p>
                        {riskAnalysis.topFactors.length > 0 && (
                            <div className="risk-factors">
                                <span className="factors-label">Contributing factors:</span>
                                <div className="factors-list">
                                    {riskAnalysis.topFactors.map((factor, i) => (
                                        <span key={i} className="factor-tag">
                                            {factor}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card>
                )}

                {/* Charts Grid - Demo Data */}
                {showDemoData && (
                    <div className="charts-grid">
                        {/* Memory Trend */}
                        <Card className="chart-card">
                            <CardHeader title="Memory Accuracy" subtitle="% correct recall" />
                            <CardContent>
                                <div className="chart-container">
                                    <ResponsiveContainer width="100%" height={200}>
                                        <LineChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                            <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                                            <YAxis domain={[0, 100]} stroke="#64748b" fontSize={12} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: "#1e293b",
                                                    border: "1px solid rgba(255,255,255,0.1)",
                                                    borderRadius: "8px",
                                                }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="memory"
                                                stroke="#34d399"
                                                strokeWidth={2}
                                                dot={{ fill: "#34d399" }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Reaction Time Trend */}
                        <Card className="chart-card">
                            <CardHeader title="Reaction Time" subtitle="Average response (ms)" />
                            <CardContent>
                                <div className="chart-container">
                                    <ResponsiveContainer width="100%" height={200}>
                                        <LineChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                            <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                                            <YAxis stroke="#64748b" fontSize={12} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: "#1e293b",
                                                    border: "1px solid rgba(255,255,255,0.1)",
                                                    borderRadius: "8px",
                                                }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="reaction"
                                                stroke="#fbbf24"
                                                strokeWidth={2}
                                                dot={{ fill: "#fbbf24" }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pattern Score Trend */}
                        <Card className="chart-card">
                            <CardHeader title="Pattern Recognition" subtitle="% accuracy" />
                            <CardContent>
                                <div className="chart-container">
                                    <ResponsiveContainer width="100%" height={200}>
                                        <LineChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                            <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                                            <YAxis domain={[0, 100]} stroke="#64748b" fontSize={12} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: "#1e293b",
                                                    border: "1px solid rgba(255,255,255,0.1)",
                                                    borderRadius: "8px",
                                                }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="pattern"
                                                stroke="#38bdf8"
                                                strokeWidth={2}
                                                dot={{ fill: "#38bdf8" }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Speech WPM Trend */}
                        <Card className="chart-card">
                            <CardHeader title="Speech Rate" subtitle="Words per minute" />
                            <CardContent>
                                <div className="chart-container">
                                    <ResponsiveContainer width="100%" height={200}>
                                        <LineChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                            <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                                            <YAxis stroke="#64748b" fontSize={12} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: "#1e293b",
                                                    border: "1px solid rgba(255,255,255,0.1)",
                                                    borderRadius: "8px",
                                                }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="speech"
                                                stroke="#a78bfa"
                                                strokeWidth={2}
                                                dot={{ fill: "#a78bfa" }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Session History - Demo Data */}
                {showDemoData && (
                    <Card className="session-history">
                        <CardHeader title="Session History" subtitle="Recent cognitive assessments" />
                        <CardContent>
                            <div className="session-table-wrapper">
                                <table className="session-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Memory</th>
                                            <th>Reaction</th>
                                            <th>Pattern</th>
                                            <th>Speech WPM</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sessions.slice().reverse().map((session) => (
                                            <tr key={session.id}>
                                                <td>{session.timestamp.toLocaleDateString()}</td>
                                                <td>{Math.round(session.features.memoryAccuracy * 100)}%</td>
                                                <td>{Math.round(session.features.reactionTimeAvg)}ms</td>
                                                <td>{Math.round(session.features.patternScore * 100)}%</td>
                                                <td>{Math.round(session.features.speechWPM)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Actions */}
                <div className="dashboard-actions">
                    <Button variant="primary" size="lg" onClick={() => window.location.href = "/tests"}>
                        Take New Assessment
                    </Button>
                </div>
            </div>
        </PageWrapper>
    );
}
