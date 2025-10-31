import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/current-user';
import { prisma } from '@/lib/prisma';
import { createOrganizationSchema } from '@/lib/validation/schemas';
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit';
import { slugify } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const organizations = await prisma.organization.findMany({
      where: {
        members: {
          some: {
            userId: user.id,
          },
        },
      },
      include: {
        members: {
          where: {
            userId: user.id,
          },
          select: {
            role: true,
          },
        },
        _count: {
          select: {
            members: true,
            workspaces: true,
          },
        },
      },
    });

    return NextResponse.json(organizations);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const data = createOrganizationSchema.parse(body);

    // Create organization and add user as owner
    const organization = await prisma.organization.create({
      data: {
        name: data.name,
        slug: data.slug || slugify(data.name),
        members: {
          create: {
            userId: user.id,
            role: 'OWNER',
          },
        },
      },
    });

    // Create audit log
    await createAuditLog({
      organizationId: organization.id,
      userId: user.id,
      action: AUDIT_ACTIONS.ORG_CREATED,
      entity: 'Organization',
      entityId: organization.id,
    });

    return NextResponse.json(organization, { status: 201 });
  } catch (error: any) {
    console.error('Error creating organization:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Organization slug already exists' }, { status: 409 });
    }

    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
