import { prisma } from './prisma';
import { getCache, setCache } from './redis';

const CACHE_TTL = 300; // 5 minutes

export async function isFeatureEnabled(orgId: string, key: string): Promise<boolean> {
  // Try cache first
  const cacheKey = `feature:${orgId}:${key}`;
  const cached = await getCache<boolean>(cacheKey);

  if (cached !== null) {
    return cached;
  }

  // Check database
  const flag = await prisma.featureFlag.findUnique({
    where: {
      organizationId_key: {
        organizationId: orgId,
        key,
      },
    },
  });

  const enabled = flag?.enabled ?? false;

  // Cache result
  await setCache(cacheKey, enabled, CACHE_TTL);

  return enabled;
}

export async function enableFeature(orgId: string, key: string, config?: any): Promise<void> {
  await prisma.featureFlag.upsert({
    where: {
      organizationId_key: {
        organizationId: orgId,
        key,
      },
    },
    update: {
      enabled: true,
      config,
    },
    create: {
      organizationId: orgId,
      key,
      enabled: true,
      config,
    },
  });

  // Invalidate cache
  const cacheKey = `feature:${orgId}:${key}`;
  await setCache(cacheKey, true, CACHE_TTL);
}

export async function disableFeature(orgId: string, key: string): Promise<void> {
  await prisma.featureFlag.upsert({
    where: {
      organizationId_key: {
        organizationId: orgId,
        key,
      },
    },
    update: {
      enabled: false,
    },
    create: {
      organizationId: orgId,
      key,
      enabled: false,
    },
  });

  // Invalidate cache
  const cacheKey = `feature:${orgId}:${key}`;
  await setCache(cacheKey, false, CACHE_TTL);
}

export async function getFeatureConfig<T = any>(orgId: string, key: string): Promise<T | null> {
  const flag = await prisma.featureFlag.findUnique({
    where: {
      organizationId_key: {
        organizationId: orgId,
        key,
      },
    },
  });

  return (flag?.config as T) || null;
}

export async function getAllFeatures(orgId: string) {
  return await prisma.featureFlag.findMany({
    where: {
      organizationId: orgId,
    },
  });
}

// Common feature flags
export const FEATURES = {
  AUTONOMOUS_WORKFLOWS: 'autonomous_workflows',
  AI_INSIGHTS: 'ai_insights',
  ADVANCED_ANALYTICS: 'advanced_analytics',
  CUSTOM_INTEGRATIONS: 'custom_integrations',
  API_ACCESS: 'api_access',
  PRIORITY_SUPPORT: 'priority_support',
} as const;
