import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth';
import { prisma } from './prisma';
import type { User, Organization, OrgMember } from '@prisma/client';

export async function getCurrentSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getCurrentSession();

  if (!session?.user?.email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  });

  return user;
}

export async function requireCurrentUser(): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}

export async function getCurrentOrganizations(): Promise<
  Array<Organization & { membership: OrgMember }>
> {
  const user = await getCurrentUser();

  if (!user) {
    return [];
  }

  const memberships = await prisma.orgMember.findMany({
    where: {
      userId: user.id,
    },
    include: {
      organization: true,
    },
  });

  return memberships.map((m) => ({
    ...m.organization,
    membership: {
      id: m.id,
      userId: m.userId,
      organizationId: m.organizationId,
      role: m.role,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    },
  }));
}

export async function getCurrentOrg(orgId?: string): Promise<Organization | null> {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  if (orgId) {
    // Verify user has access to this specific org
    const membership = await prisma.orgMember.findFirst({
      where: {
        userId: user.id,
        organizationId: orgId,
      },
      include: {
        organization: true,
      },
    });

    return membership?.organization || null;
  }

  // Get first org user belongs to
  const membership = await prisma.orgMember.findFirst({
    where: {
      userId: user.id,
    },
    include: {
      organization: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  return membership?.organization || null;
}

export async function requireCurrentOrg(orgId?: string): Promise<Organization> {
  const org = await getCurrentOrg(orgId);

  if (!org) {
    throw new Error('Organization not found or access denied');
  }

  return org;
}

export async function getUserOrgRole(userId: string, orgId: string): Promise<string | null> {
  const membership = await prisma.orgMember.findFirst({
    where: {
      userId,
      organizationId: orgId,
    },
  });

  return membership?.role || null;
}
