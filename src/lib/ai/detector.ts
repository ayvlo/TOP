/**
 * Ayvlo AI Detector
 * Analyzes incoming events and detects anomalies
 *
 * This is a placeholder implementation using simple statistical methods.
 * In production, replace with your ML model (TensorFlow, scikit-learn, etc.)
 */

export interface IngestEvent {
  metric: string;
  value: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface DetectedAnomaly {
  metric: string;
  severity: number; // 0-100
  payload: any;
  aiScore: number; // confidence score
}

/**
 * Detect anomalies using simple z-score method
 * Replace this with your actual ML model
 */
export function detectAnomalies(events: IngestEvent[]): DetectedAnomaly[] {
  const anomalies: DetectedAnomaly[] = [];

  // Group events by metric
  const metricGroups = groupByMetric(events);

  for (const [metric, metricEvents] of Object.entries(metricGroups)) {
    const values = metricEvents.map((e) => e.value);
    const stats = calculateStats(values);

    // Check each event for anomalies
    for (const event of metricEvents) {
      const zScore = Math.abs((event.value - stats.mean) / stats.stdDev);

      // If z-score > 2.5, it's an anomaly
      if (zScore > 2.5) {
        const severity = Math.min(100, Math.floor(zScore * 20));

        anomalies.push({
          metric,
          severity,
          payload: event,
          aiScore: Math.min(0.99, zScore / 4), // Normalize to 0-1
        });
      }
    }
  }

  return anomalies;
}

/**
 * Advanced detector with historical context
 * Use this for more sophisticated detection
 */
export async function detectAnomaliesWithHistory(
  events: IngestEvent[],
  historicalData?: number[]
): Promise<DetectedAnomaly[]> {
  // TODO: Implement with historical baseline
  // This would query historical data from the database
  // and use more advanced techniques like:
  // - Time series decomposition
  // - ARIMA models
  // - Prophet for forecasting
  // - LSTM for sequence prediction

  return detectAnomalies(events);
}

/**
 * Real-time anomaly scoring
 * For streaming data
 */
export function scoreEvent(event: IngestEvent, baseline: { mean: number; stdDev: number }): {
  isAnomaly: boolean;
  score: number;
  severity: number;
} {
  const zScore = Math.abs((event.value - baseline.mean) / baseline.stdDev);
  const isAnomaly = zScore > 2.5;
  const severity = Math.min(100, Math.floor(zScore * 20));

  return {
    isAnomaly,
    score: Math.min(0.99, zScore / 4),
    severity,
  };
}

// Helper functions

function groupByMetric(events: IngestEvent[]): Record<string, IngestEvent[]> {
  return events.reduce((acc, event) => {
    if (!acc[event.metric]) {
      acc[event.metric] = [];
    }
    acc[event.metric].push(event);
    return acc;
  }, {} as Record<string, IngestEvent[]>);
}

function calculateStats(values: number[]): { mean: number; stdDev: number } {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  return { mean, stdDev };
}
