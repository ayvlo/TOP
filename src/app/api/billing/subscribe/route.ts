import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/current-user';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/rbac';
import { stripe, createCustomer, createSubscription } from '@/lib/stripe';
import { createSubscriptionSchema } from '@/lib/validation/schemas';

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

    await requireRole(user.id, orgId, ['OWNER']);

    const validated = createSubscriptionSchema.parse(data);

    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
      include: { billing: true },
    });

    if (!organization) {
      return new NextResponse('Organization not found', { status: 404 });
    }

    let customerId: string;

    // Create or get Stripe customer
    if (organization.billing) {
      customerId = organization.billing.stripeCustomerId;
    } else {
      const customer = await createCustomer(
        user.email!,
        organization.name,
        organization.id
      );
      customerId = customer.id;
    }

    // Create subscription
    const subscription = await createSubscription(
      customerId,
      validated.priceId,
      validated.seats || 5
    );

    // Store billing info
    await prisma.billingInfo.upsert({
      where: { organizationId: orgId },
      create: {
        organizationId: orgId,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        plan: 'pro',
        status: subscription.status,
        seats: validated.seats || 5,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
      update: {
        stripeSubscriptionId: subscription.id,
        plan: 'pro',
        status: subscription.status,
        seats: validated.seats || 5,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });

    const invoice = subscription.latest_invoice as any;
    const paymentIntent = invoice?.payment_intent;

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret: paymentIntent?.client_secret,
    });
  } catch (error: any) {
    console.error('Subscription error:', error);

    if (error.message === 'Forbidden: Insufficient permissions') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
