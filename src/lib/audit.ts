import { prisma } from './prisma';
import { logAudit } from './logger';

export async function createAuditLog(data: {
  organizationId: string;
  userId?: string;
  action: string;
  entity?: string;
  entityId?: string;
  ip?: string;
  userAgent?: string;
  meta?: any;
}) {
  const log = await prisma.auditLog.create({
    data,
  });

  // Also log to application logger
  logAudit(data.action, {
    organizationId: data.organizationId,
    userId: data.userId,
    entity: data.entity,
    entityId: data.entityId,
  });

  return log;
}

export async function getAuditLogs(
  organizationId: string,
  options?: {
    limit?: number;
    offset?: number;
    userId?: string;
    action?: string;
  }
) {
  return await prisma.auditLog.findMany({
    where: {
      organizationId,
      ...(options?.userId && { userId: options.userId }),
      ...(options?.action && { action: options.action }),
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: options?.limit || 50,
    skip: options?.offset || 0,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

// Common audit actions
export const AUDIT_ACTIONS = {
  // Organization
  ORG_CREATED: 'org.created',
  ORG_UPDATED: 'org.updated',
  ORG_DELETED: 'org.deleted',

  // Members
  MEMBER_INVITED: 'member.invited',
  MEMBER_JOINED: 'member.joined',
  MEMBER_REMOVED: 'member.removed',
  MEMBER_ROLE_CHANGED: 'member.role_changed',

  // Workspaces
  WORKSPACE_CREATED: 'workspace.created',
  WORKSPACE_UPDATED: 'workspace.updated',
  WORKSPACE_DELETED: 'workspace.deleted',

  // Data Sources
  DATASOURCE_CONNECTED: 'datasource.connected',
  DATASOURCE_DISCONNECTED: 'datasource.disconnected',

  // Anomalies
  ANOMALY_DETECTED: 'anomaly.detected',
  ANOMALY_RESOLVED: 'anomaly.resolved',

  // Workflows
  WORKFLOW_CREATED: 'workflow.created',
  WORKFLOW_TRIGGERED: 'workflow.triggered',
  WORKFLOW_UPDATED: 'workflow.updated',

  // Billing
  SUBSCRIPTION_CREATED: 'subscription.created',
  SUBSCRIPTION_UPDATED: 'subscription.updated',
  SUBSCRIPTION_CANCELLED: 'subscription.cancelled',

  // API Keys
  API_KEY_CREATED: 'api_key.created',
  API_KEY_DELETED: 'api_key.deleted',
} as const;
