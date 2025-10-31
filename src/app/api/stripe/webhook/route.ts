import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { logEvent } from '@/lib/logger';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature')!;

    let event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return new NextResponse('Webhook Error', { status: 400 });
    }

    logEvent('stripe.webhook.received', { type: event.type });

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as any);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as any);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as any);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as any);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return new NextResponse('Webhook Error', { status: 500 });
  }
}

async function handleSubscriptionUpdate(subscription: any) {
  const billing = await prisma.billingInfo.findUnique({
    where: { stripeCustomerId: subscription.customer },
  });

  if (!billing) return;

  await prisma.billingInfo.update({
    where: { id: billing.id },
    data: {
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });

  logEvent('subscription.updated', { subscriptionId: subscription.id });
}

async function handleSubscriptionDeleted(subscription: any) {
  const billing = await prisma.billingInfo.findUnique({
    where: { stripeCustomerId: subscription.customer },
  });

  if (!billing) return;

  await prisma.billingInfo.update({
    where: { id: billing.id },
    data: {
      status: 'canceled',
    },
  });

  logEvent('subscription.deleted', { subscriptionId: subscription.id });
}

async function handlePaymentSucceeded(invoice: any) {
  logEvent('payment.succeeded', { invoiceId: invoice.id });
}

async function handlePaymentFailed(invoice: any) {
  const billing = await prisma.billingInfo.findUnique({
    where: { stripeCustomerId: invoice.customer },
  });

  if (!billing) return;

  await prisma.billingInfo.update({
    where: { id: billing.id },
    data: {
      status: 'past_due',
    },
  });

  logEvent('payment.failed', { invoiceId: invoice.id });
}
