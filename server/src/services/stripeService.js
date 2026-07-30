// ================================================
// services/stripeService.js — Stripe Checkout business logic
// ================================================

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const StripeService = {
  /**
   * Create a Stripe Checkout session
   * Generates a payment URL that the client redirects to
   */
  async createCheckoutSession({ orderId, items, customerEmail }) {
    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.title,
          images: item.image_url ? [`${process.env.CLIENT_URL}${item.image_url}`] : [],
        },
        unit_amount: Math.round(item.unit_price * 100), // Stripe expects cents
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: customerEmail,
      line_items: lineItems,
      metadata: { order_id: String(orderId) },
      success_url: `${process.env.CLIENT_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout/cancel`,
    });

    return session;
  },

  /**
   * Verify Stripe webhook signature
   * Returns the verified event or throws if the signature is invalid
   */
  constructEvent(rawBody, signature) {
    return stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  },
};

module.exports = StripeService;
