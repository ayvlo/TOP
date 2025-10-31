/**
 * Ayvlo AI Action Runner
 * Executes automated actions in response to anomalies
 *
 * Integrates with Slack, webhooks, Stripe, and other services
 */

import type { Anomaly, Workflow } from '@prisma/client';
import { sendOrgWebhook } from '../webhook';
import { logEvent, logError } from '../logger';

export interface ActionContext {
  anomaly: Anomaly;
  workflow: Workflow;
  organizationId: string;
}

export async function runWorkflowActions(context: ActionContext): Promise<void> {
  const { workflow, anomaly, organizationId } = context;
  const actions = workflow.actions as any[];

  logEvent('workflow.started', {
    workflowId: workflow.id,
    anomalyId: anomaly.id,
    organizationId,
  });

  for (const action of actions) {
    try {
      await executeAction(action, { anomaly, organizationId });
    } catch (error) {
      logError(error as Error, {
        action: action.type,
        workflowId: workflow.id,
        anomalyId: anomaly.id,
      });
    }
  }
}

async function executeAction(
  action: any,
  context: { anomaly: Anomaly; organizationId: string }
): Promise<void> {
  const { type, config } = action;

  switch (type) {
    case 'slack':
      await sendSlackNotification(config, context.anomaly);
      break;

    case 'webhook':
      await sendOrgWebhook(
        context.organizationId,
        'anomaly.detected',
        {
          anomaly: context.anomaly,
        }
      );
      break;

    case 'email':
      await sendEmailNotification(config, context.anomaly);
      break;

    case 'stripe_dunning':
      await triggerStripeDunning(config, context.anomaly);
      break;

    case 'auto_resolve':
      await attemptAutoResolve(config, context.anomaly);
      break;

    default:
      logEvent('action.unknown', { type });
  }
}

// Action implementations

async function sendSlackNotification(config: any, anomaly: Anomaly): Promise<void> {
  // TODO: Integrate with Slack API
  // const webhook = config.webhookUrl;
  // await fetch(webhook, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     text: `🚨 Anomaly detected: ${anomaly.metric}`,
  //     blocks: [
  //       {
  //         type: 'section',
  //         text: {
  //           type: 'mrkdwn',
  //           text: `*Severity:* ${anomaly.severity}/100\n*Metric:* ${anomaly.metric}\n*Explanation:* ${anomaly.explanation}`,
  //         },
  //       },
  //     ],
  //   }),
  // });

  logEvent('action.slack.sent', {
    anomalyId: anomaly.id,
    channel: config.channel,
  });
}

async function sendEmailNotification(config: any, anomaly: Anomaly): Promise<void> {
  // TODO: Integrate with email service (SendGrid, Postmark, etc.)
  // await sendEmail({
  //   to: config.recipients,
  //   subject: `Anomaly Alert: ${anomaly.metric}`,
  //   body: `
  //     An anomaly has been detected:
  //
  //     Metric: ${anomaly.metric}
  //     Severity: ${anomaly.severity}/100
  //     Explanation: ${anomaly.explanation}
  //
  //     View details: ${config.dashboardUrl}
  //   `,
  // });

  logEvent('action.email.sent', {
    anomalyId: anomaly.id,
    recipients: config.recipients,
  });
}

async function triggerStripeDunning(config: any, anomaly: Anomaly): Promise<void> {
  // TODO: Integrate with Stripe dunning
  // If the anomaly is related to failed payments, trigger Stripe's dunning flow
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  // await stripe.subscriptions.update(subscriptionId, {
  //   collection_method: 'send_invoice',
  //   days_until_due: 7,
  // });

  logEvent('action.stripe_dunning.triggered', {
    anomalyId: anomaly.id,
  });
}

async function attemptAutoResolve(config: any, anomaly: Anomaly): Promise<void> {
  // TODO: Implement auto-resolution logic
  // This could involve:
  // - Restarting a service
  // - Clearing a cache
  // - Adjusting rate limits
  // - Rolling back a feature flag

  logEvent('action.auto_resolve.attempted', {
    anomalyId: anomaly.id,
    strategy: config.strategy,
  });
}

/**
 * Check if workflow should trigger for this anomaly
 */
export function shouldTriggerWorkflow(workflow: Workflow, anomaly: Anomaly): boolean {
  const trigger = workflow.trigger as any;

  if (trigger.type !== 'anomaly_detected') {
    return false;
  }

  // Check conditions
  if (trigger.conditions) {
    if (trigger.conditions.severity?.gte && anomaly.severity < trigger.conditions.severity.gte) {
      return false;
    }

    if (trigger.conditions.severity?.lte && anomaly.severity > trigger.conditions.severity.lte) {
      return false;
    }

    if (trigger.conditions.metric && !anomaly.metric.includes(trigger.conditions.metric)) {
      return false;
    }
  }

  return true;
}
