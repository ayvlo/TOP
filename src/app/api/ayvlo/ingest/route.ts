import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ingestBatchSchema } from '@/lib/validation/schemas';
import { detectAnomalies } from '@/lib/ai/detector';
import { explainAnomaly } from '@/lib/ai/explainer';
import { runWorkflowActions, shouldTriggerWorkflow } from '@/lib/ai/action-runner';
import { enforceRateLimit, ingestRatelimit } from '@/lib/rate-limit';
import { parseApiKey } from '@/lib/utils';
import { sendOrgWebhook, WEBHOOK_EVENTS } from '@/lib/webhook';

export async function POST(req: NextRequest) {
  try {
    // Authenticate with API key
    const authHeader = req.headers.get('authorization');
    const apiKeyValue = parseApiKey(authHeader);

    if (!apiKeyValue) {
      return new NextResponse('Missing API key', { status: 401 });
    }

    // Find API key
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        keyHash: apiKeyValue,
        permissions: {
          has: 'write',
        },
      },
      include: {
        organization: true,
      },
    });

    if (!apiKey) {
      return new NextResponse('Invalid API key', { status: 401 });
    }

    // Rate limiting
    try {
      await enforceRateLimit(ingestRatelimit, apiKey.organizationId);
    } catch (error) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
          },
        }
      );
    }

    // Parse and validate events
    const body = await req.json();
    const events = ingestBatchSchema.parse(Array.isArray(body) ? body : [body]);

    // Update API key last used
    await prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    });

    // Detect anomalies
    const anomalies = detectAnomalies(events);

    // Get first workspace for the org (simplified)
    const workspace = await prisma.workspace.findFirst({
      where: { organizationId: apiKey.organizationId },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: 'No workspace found. Create a workspace first.' },
        { status: 400 }
      );
    }

    const createdAnomalies = [];

    // Store anomalies and trigger workflows
    for (const anomaly of anomalies) {
      const explanation = explainAnomaly({ anomaly });

      const created = await prisma.anomaly.create({
        data: {
          workspaceId: workspace.id,
          metric: anomaly.metric,
          severity: anomaly.severity,
          payload: anomaly.payload,
          explanation,
          aiScore: anomaly.aiScore,
          status: 'OPEN',
        },
      });

      createdAnomalies.push(created);

      // Send webhook
      await sendOrgWebhook(apiKey.organizationId, WEBHOOK_EVENTS.ANOMALY_DETECTED, {
        anomaly: created,
      });

      // Check and trigger workflows
      const workflows = await prisma.workflow.findMany({
        where: {
          workspaceId: workspace.id,
          isActive: true,
        },
      });

      for (const workflow of workflows) {
        if (shouldTriggerWorkflow(workflow, created)) {
          await runWorkflowActions({
            anomaly: created,
            workflow,
            organizationId: apiKey.organizationId,
          });

          await prisma.workflow.update({
            where: { id: workflow.id },
            data: {
              runCount: { increment: 1 },
              lastRunAt: new Date(),
            },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      eventsProcessed: events.length,
      anomaliesDetected: createdAnomalies.length,
      anomalies: createdAnomalies,
    });
  } catch (error: any) {
    console.error('Ingest error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
