/**
 * Ayvlo AI Explainer
 * Generates human-readable explanations for detected anomalies
 *
 * This is a placeholder using template-based generation.
 * In production, integrate with OpenAI, Anthropic Claude, or your own LLM.
 */

import type { Anomaly } from '@prisma/client';

export interface ExplanationContext {
  anomaly: Partial<Anomaly>;
  historicalData?: any[];
  relatedEvents?: any[];
}

/**
 * Generate explanation for an anomaly
 * Replace with LLM integration in production
 */
export function explainAnomaly(context: ExplanationContext): string {
  const { anomaly } = context;
  const payload = anomaly.payload as any;

  // Template-based explanation (basic)
  if (anomaly.metric?.includes('mrr') || anomaly.metric?.includes('revenue')) {
    return generateRevenueExplanation(payload, anomaly.severity || 0);
  }

  if (anomaly.metric?.includes('churn')) {
    return generateChurnExplanation(payload, anomaly.severity || 0);
  }

  if (anomaly.metric?.includes('user') || anomaly.metric?.includes('active')) {
    return generateUserExplanation(payload, anomaly.severity || 0);
  }

  // Default explanation
  return `Anomaly detected in ${anomaly.metric}. Value deviated significantly from expected baseline.`;
}

/**
 * Advanced explanation using LLM (placeholder)
 * Integrate with OpenAI/Anthropic in production
 */
export async function explainAnomalyWithAI(
  context: ExplanationContext
): Promise<string> {
  // TODO: Replace with actual LLM call
  // const response = await openai.chat.completions.create({
  //   model: "gpt-4",
  //   messages: [
  //     {
  //       role: "system",
  //       content: "You are an expert data analyst explaining anomalies in SaaS metrics."
  //     },
  //     {
  //       role: "user",
  //       content: `Explain this anomaly: ${JSON.stringify(context)}`
  //     }
  //   ]
  // });
  // return response.choices[0].message.content;

  return explainAnomaly(context);
}

/**
 * Generate actionable insights
 */
export function generateInsights(anomaly: Partial<Anomaly>): string[] {
  const insights: string[] = [];

  if (anomaly.severity && anomaly.severity > 80) {
    insights.push('🚨 Critical: Immediate attention required');
  }

  if (anomaly.metric?.includes('churn')) {
    insights.push('💡 Review recent product changes or pricing updates');
    insights.push('📧 Consider running a win-back campaign');
  }

  if (anomaly.metric?.includes('mrr') || anomaly.metric?.includes('revenue')) {
    insights.push('💰 Check for failed payments or subscription cancellations');
    insights.push('📊 Analyze cohort retention rates');
  }

  if (anomaly.metric?.includes('signup') || anomaly.metric?.includes('acquisition')) {
    insights.push('📈 Review marketing campaign performance');
    insights.push('🔍 Check conversion funnel for bottlenecks');
  }

  return insights;
}

// Template generators

function generateRevenueExplanation(payload: any, severity: number): string {
  const change = payload.drop || payload.increase || 0;
  const direction = change < 0 ? 'dropped' : 'increased';
  const absChange = Math.abs(change);

  let explanation = `Revenue ${direction} ${absChange.toFixed(1)}% compared to expected baseline. `;

  if (severity > 80) {
    explanation += 'This is a critical deviation that requires immediate investigation. ';
  }

  if (payload.current && payload.expected) {
    explanation += `Current: $${payload.current.toLocaleString()}, Expected: $${payload.expected.toLocaleString()}. `;
  }

  explanation += 'Potential causes: changes in subscription plans, increased churn, or payment failures.';

  return explanation;
}

function generateChurnExplanation(payload: any, severity: number): string {
  const change = payload.increase || payload.change || 0;

  let explanation = `Churn rate increased ${change.toFixed(1)}% above normal levels. `;

  if (payload.current && payload.expected) {
    explanation += `Current rate: ${payload.current}%, Expected: ${payload.expected}%. `;
  }

  explanation += 'This could indicate customer dissatisfaction, competitive pressure, or onboarding issues.';

  return explanation;
}

function generateUserExplanation(payload: any, severity: number): string {
  const change = payload.drop || payload.increase || 0;
  const direction = change < 0 ? 'decreased' : 'increased';

  let explanation = `Active user count ${direction} ${Math.abs(change).toFixed(1)}% from expected. `;

  if (severity > 70) {
    explanation += 'Significant deviation detected. ';
  }

  explanation += 'Review recent feature releases, performance issues, or external factors.';

  return explanation;
}
