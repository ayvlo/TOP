import { prisma } from './prisma';
import type { OrgRole } from '@prisma/client';

type Permission = 'org:read' | 'org:write' | 'org:admin' | 'workspace:read' | 'workspace:write';

const rolePermissions: Record<OrgRole, Permission[]> = {
  OWNER: ['org:read', 'org:write', 'org:admin', 'workspace:read', 'workspace:write'],
  ADMIN: ['org:read', 'org:write', 'workspace:read', 'workspace:write'],
  MEMBER: ['org:read', 'workspace:read', 'workspace:write'],
  VIEWER: ['org:read', 'workspace:read'],
};

export async function getUserRole(userId: string, orgId: string): Promise<OrgRole | null> {
  const member = await prisma.orgMember.findFirst({
    where: {
      userId,
      organizationId: orgId,
    },
  });

  return member?.role || null;
}

export async function hasPermission(
  userId: string,
  orgId: string,
  permission: Permission
): Promise<boolean> {
  const role = await getUserRole(userId, orgId);

  if (!role) {
    return false;
  }

  return rolePermissions[role].includes(permission);
}

export async function requireRole(
  userId: string,
  orgId: string,
  allowedRoles: OrgRole[]
): Promise<void> {
  const role = await getUserRole(userId, orgId);

  if (!role || !allowedRoles.includes(role)) {
    throw new Error('Forbidden: Insufficient permissions');
  }
}

export async function requirePermission(
  userId: string,
  orgId: string,
  permission: Permission
): Promise<void> {
  const hasAccess = await hasPermission(userId, orgId, permission);

  if (!hasAccess) {
    throw new Error(`Forbidden: Missing permission ${permission}`);
  }
}

export async function isOrgOwner(userId: string, orgId: string): Promise<boolean> {
  const role = await getUserRole(userId, orgId);
  return role === 'OWNER';
}

export async function isOrgAdmin(userId: string, orgId: string): Promise<boolean> {
  const role = await getUserRole(userId, orgId);
  return role === 'OWNER' || role === 'ADMIN';
}

export async function canManageMembers(userId: string, orgId: string): Promise<boolean> {
  return await hasPermission(userId, orgId, 'org:admin');
}

export async function canManageBilling(userId: string, orgId: string): Promise<boolean> {
  return await isOrgOwner(userId, orgId);
}
