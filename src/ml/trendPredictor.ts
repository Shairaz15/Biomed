/**
 * Trend Predictor Service
 * Orchestrates: Data -> Normalization -> Inference -> Result
 */

import * as tf from '@tensorflow/tfjs';
import type { SessionDataPoint } from '../ai/trendAnalyzer';
import { normalizeSessionSequence } from './featureNormalizer';
import { loadTrendModel } from './modelLoader';
import { computeFeatureImportance } from './explainability';
import type { TrendPrediction } from './types';
import { ML_CONFIG } from './types';

const CLASS_LABELS = ['stable', 'declining', 'improving'] as const;

export async function predictTrend(sessions: SessionDataPoint[]): Promise<TrendPrediction | null> {
    // 1. Check data sufficiency
    if (sessions.length < ML_CONFIG.minSessions) {
        console.warn("Insufficient sessions for ML prediction");
        return null;
    }

    // 2. Load model
    console.log("[ML Debug] Loading trend model...");
    const model = await loadTrendModel();
    if (!model) {
        console.error("[ML Debug] Failed to load trend model");
        return null;
    }
    console.log("[ML Debug] Model loaded successfully");

    try {
        // 3. Prepare Input
        const sequence = normalizeSessionSequence(sessions);
        console.log("[ML Debug] Normalized sequence:", sequence);
        // Shape: [1, Window, Features]
        const inputTensor = tf.tensor([sequence]);

        // 4. Run Inference
        const predTensor = model.predict(inputTensor) as tf.Tensor;
        const probabilities = predTensor.dataSync(); // [stable, declining, improving]
        console.log("[ML Debug] Prediction probabilities:", probabilities);

        // 5. Determine Result
        const maxProbIndex = predTensor.argMax(-1).dataSync()[0];
        const confidence = probabilities[maxProbIndex];
        const direction = CLASS_LABELS[maxProbIndex];
        console.log(`[ML Debug] Prediction: ${direction} (${confidence})`);

        // 6. Explainability
        const contributions = computeFeatureImportance(model, inputTensor);

        // 7. Cleanup
        inputTensor.dispose();
        predTensor.dispose();

        // 8. Determine reliability
        let reliability: 'high' | 'medium' | 'low' = 'low';
        if (confidence >= ML_CONFIG.thresholds.highConfidence && sessions.length >= 5) {
            reliability = 'high';
        } else if (confidence >= ML_CONFIG.thresholds.mediumConfidence) {
            reliability = 'medium';
        }

        return {
            direction,
            confidence,
            anomalyProbability: probabilities[1], // Probability of 'declining' acts as anomaly proxy here
            domainContributions: contributions,
            reliabilityFlag: reliability
        };

    } catch (err) {
        console.error("Prediction failed:", err);
        return null;
    }
}
