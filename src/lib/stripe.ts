import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

export async function createCustomer(email: string, name: string, orgId: string) {
  return await stripe.customers.create({
    email,
    name,
    metadata: {
      organizationId: orgId,
    },
  });
}

export async function createSubscription(
  customerId: string,
  priceId: string,
  quantity: number = 1
) {
  return await stripe.subscriptions.create({
    customer: customerId,
    items: [
      {
        price: priceId,
        quantity,
      },
    ],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent'],
  });
}

export async function createBillingPortalSession(customerId: string, returnUrl: string) {
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

export async function updateSubscriptionQuantity(subscriptionId: string, quantity: number) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  return await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        quantity,
      },
    ],
  });
}

export async function cancelSubscription(subscriptionId: string, immediately: boolean = false) {
  if (immediately) {
    return await stripe.subscriptions.cancel(subscriptionId);
  } else {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }
}
