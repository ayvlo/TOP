import { z } from 'zod';

// ============================================
// ORGANIZATION SCHEMAS
// ============================================

export const createOrganizationSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  logo: z.string().url().optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']),
});

// ============================================
// WORKSPACE SCHEMAS
// ============================================

export const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

// ============================================
// DATA SOURCE SCHEMAS
// ============================================

export const createDataSourceSchema = z.object({
  type: z.enum(['stripe', 'postgres', 'hubspot', 'shopify', 'api', 'custom']),
  name: z.string().min(1).max(100),
  config: z.record(z.any()),
});

export const updateDataSourceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  config: z.record(z.any()).optional(),
  isActive: z.boolean().optional(),
});

// ============================================
// AYVLO INGESTION SCHEMAS
// ============================================

export const ingestEventSchema = z.object({
  metric: z.string().min(1),
  value: z.number(),
  timestamp: z.string().datetime(),
  metadata: z.record(z.any()).optional(),
});

export const ingestBatchSchema = z.array(ingestEventSchema).max(1000);

export const updateAnomalySchema = z.object({
  status: z.enum(['OPEN', 'INVESTIGATING', 'RESOLVED', 'FALSE_POSITIVE']),
  explanation: z.string().optional(),
});

// ============================================
// WORKFLOW SCHEMAS
// ============================================

export const createWorkflowSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  trigger: z.object({
    type: z.string(),
    conditions: z.record(z.any()).optional(),
  }),
  actions: z.array(
    z.object({
      type: z.string(),
      config: z.record(z.any()),
    })
  ),
  isActive: z.boolean().optional(),
});

export const updateWorkflowSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  trigger: z
    .object({
      type: z.string(),
      conditions: z.record(z.any()).optional(),
    })
    .optional(),
  actions: z
    .array(
      z.object({
        type: z.string(),
        config: z.record(z.any()),
      })
    )
    .optional(),
  isActive: z.boolean().optional(),
});

// ============================================
// API KEY SCHEMAS
// ============================================

export const createApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  permissions: z.array(z.enum(['read', 'write', 'admin'])),
  expiresAt: z.string().datetime().optional(),
});

// ============================================
// WEBHOOK SCHEMAS
// ============================================

export const createWebhookSchema = z.object({
  label: z.string().min(1).max(100),
  url: z.string().url(),
  events: z.array(z.string()),
});

export const updateWebhookSchema = z.object({
  label: z.string().min(1).max(100).optional(),
  url: z.string().url().optional(),
  events: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

// ============================================
// FEATURE FLAG SCHEMAS
// ============================================

export const updateFeatureFlagSchema = z.object({
  enabled: z.boolean(),
  config: z.record(z.any()).optional(),
});

// ============================================
// BILLING SCHEMAS
// ============================================

export const createSubscriptionSchema = z.object({
  priceId: z.string(),
  seats: z.number().int().positive().optional(),
});

export const updateSubscriptionSchema = z.object({
  seats: z.number().int().positive().optional(),
});

// ============================================
// HELPER TYPES
// ============================================

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
export type CreateDataSourceInput = z.infer<typeof createDataSourceSchema>;
export type IngestEventInput = z.infer<typeof ingestEventSchema>;
export type CreateWorkflowInput = z.infer<typeof createWorkflowSchema>;
export type UpdateWorkflowInput = z.infer<typeof updateWorkflowSchema>;
export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
export type CreateWebhookInput = z.infer<typeof createWebhookSchema>;
