import { prisma } from './prisma';
import crypto from 'crypto';
import { logError } from './logger';

export async function sendOrgWebhook(
  orgId: string,
  event: string,
  payload: any
): Promise<void> {
  const endpoints = await prisma.webhookEndpoint.findMany({
    where: {
      organizationId: orgId,
      isActive: true,
      events: {
        has: event,
      },
    },
  });

  const promises = endpoints.map((endpoint) =>
    sendWebhook(endpoint.url, endpoint.secret, event, payload, endpoint.id)
  );

  await Promise.allSettled(promises);
}

async function sendWebhook(
  url: string,
  secret: string,
  event: string,
  payload: any,
  endpointId: string
): Promise<void> {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const body = JSON.stringify({
      event,
      data: payload,
      timestamp,
    });

    // Create signature
    const signature = createWebhookSignature(body, secret);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Ayvlo-Event': event,
        'X-Ayvlo-Signature': signature,
        'X-Ayvlo-Timestamp': timestamp.toString(),
      },
      body,
    });

    if (!response.ok) {
      throw new Error(`Webhook failed with status ${response.status}`);
    }

    // Update success
    await prisma.webhookEndpoint.update({
      where: { id: endpointId },
      data: {
        lastTriggeredAt: new Date(),
        failureCount: 0,
      },
    });
  } catch (error) {
    logError(error as Error, { endpointId, event });

    // Increment failure count
    await prisma.webhookEndpoint.update({
      where: { id: endpointId },
      data: {
        failureCount: {
          increment: 1,
        },
      },
    });
  }
}

export function createWebhookSignature(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = createWebhookSignature(payload, secret);
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

// Common webhook events
export const WEBHOOK_EVENTS = {
  ANOMALY_DETECTED: 'anomaly.detected',
  ANOMALY_RESOLVED: 'anomaly.resolved',
  WORKFLOW_TRIGGERED: 'workflow.triggered',
  ALERT_CREATED: 'alert.created',
  DATASOURCE_SYNC_COMPLETED: 'datasource.sync_completed',
} as const;
