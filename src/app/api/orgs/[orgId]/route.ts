import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/current-user';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/rbac';
import { updateOrganizationSchema } from '@/lib/validation/schemas';
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit';

export async function GET(
  req: NextRequest,
  { params }: { params: { orgId: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const organization = await prisma.organization.findFirst({
      where: {
        id: params.orgId,
        members: {
          some: {
            userId: user.id,
          },
        },
      },
      include: {
        _count: {
          select: {
            members: true,
            workspaces: true,
            apiKeys: true,
          },
        },
      },
    });

    if (!organization) {
      return new NextResponse('Organization not found', { status: 404 });
    }

    return NextResponse.json(organization);
  } catch (error) {
    console.error('Error fetching organization:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { orgId: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await requireRole(user.id, params.orgId, ['OWNER', 'ADMIN']);

    const body = await req.json();
    const data = updateOrganizationSchema.parse(body);

    const organization = await prisma.organization.update({
      where: { id: params.orgId },
      data,
    });

    await createAuditLog({
      organizationId: params.orgId,
      userId: user.id,
      action: AUDIT_ACTIONS.ORG_UPDATED,
      entity: 'Organization',
      entityId: params.orgId,
    });

    return NextResponse.json(organization);
  } catch (error: any) {
    console.error('Error updating organization:', error);

    if (error.message === 'Forbidden: Insufficient permissions') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { orgId: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await requireRole(user.id, params.orgId, ['OWNER']);

    await prisma.organization.delete({
      where: { id: params.orgId },
    });

    await createAuditLog({
      organizationId: params.orgId,
      userId: user.id,
      action: AUDIT_ACTIONS.ORG_DELETED,
      entity: 'Organization',
      entityId: params.orgId,
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error('Error deleting organization:', error);

    if (error.message === 'Forbidden: Insufficient permissions') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
