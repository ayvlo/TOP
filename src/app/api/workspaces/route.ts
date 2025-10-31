import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/current-user';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/rbac';
import { createWorkspaceSchema } from '@/lib/validation/schemas';
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { orgId, ...data } = body;

    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    await requireRole(user.id, orgId, ['OWNER', 'ADMIN', 'MEMBER']);

    const validated = createWorkspaceSchema.parse(data);

    const workspace = await prisma.workspace.create({
      data: {
        name: validated.name,
        description: validated.description,
        organizationId: orgId,
      },
    });

    await createAuditLog({
      organizationId: orgId,
      userId: user.id,
      action: AUDIT_ACTIONS.WORKSPACE_CREATED,
      entity: 'Workspace',
      entityId: workspace.id,
    });

    return NextResponse.json(workspace, { status: 201 });
  } catch (error: any) {
    console.error('Error creating workspace:', error);

    if (error.message === 'Forbidden: Insufficient permissions') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
