import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/current-user';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/rbac';
import { inviteMemberSchema } from '@/lib/validation/schemas';
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

    await requireRole(user.id, params.orgId, ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']);

    const members = await prisma.orgMember.findMany({
      where: {
        organizationId: params.orgId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json(members);
  } catch (error: any) {
    console.error('Error fetching members:', error);

    if (error.message === 'Forbidden: Insufficient permissions') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(
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
    const data = inviteMemberSchema.parse(body);

    // Find or create user
    let invitedUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!invitedUser) {
      invitedUser = await prisma.user.create({
        data: {
          email: data.email,
        },
      });
    }

    // Check if already a member
    const existing = await prisma.orgMember.findUnique({
      where: {
        userId_organizationId: {
          userId: invitedUser.id,
          organizationId: params.orgId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'User is already a member' }, { status: 409 });
    }

    // Add member
    const member = await prisma.orgMember.create({
      data: {
        userId: invitedUser.id,
        organizationId: params.orgId,
        role: data.role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    await createAuditLog({
      organizationId: params.orgId,
      userId: user.id,
      action: AUDIT_ACTIONS.MEMBER_INVITED,
      entity: 'OrgMember',
      entityId: member.id,
      meta: { email: data.email, role: data.role },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error: any) {
    console.error('Error inviting member:', error);

    if (error.message === 'Forbidden: Insufficient permissions') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
