// ================================================
// services/stripeService.js — Stripe Checkout business logic
// ================================================

function getStripe() {
  return require('stripe')(process.env.STRIPE_SECRET_KEY);
}

const isValidEmail = (email) => {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const StripeService = {
  /**
   * Create a Stripe Checkout session
   * Generates a payment URL that the client redirects to
   */
  async createCheckoutSession({ orderId, items, customerEmail }) {
    const stripe = getStripe();

    const lineItems = items.map((item) => {
      let imageUrls = [];
      if (item.image_url) {
        if (item.image_url.startsWith('http://') || item.image_url.startsWith('https://')) {
          imageUrls = [item.image_url];
        } else {
          imageUrls = [`${process.env.CLIENT_URL || 'http://localhost:3000'}${item.image_url}`];
        }
      }

      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.title,
            images: imageUrls,
          },
          unit_amount: Math.round(Number(item.unit_price) * 100), // Stripe expects cents
        },
        quantity: Number(item.quantity),
      };
    });

    // Format email safely so Stripe never throws invalid email error
    let safeCustomerEmail = undefined;
    if (isValidEmail(customerEmail)) {
      safeCustomerEmail = customerEmail;
    } else if (customerEmail && customerEmail.includes('@')) {
      safeCustomerEmail = `${customerEmail}.com`;
    }

    const sessionData = {
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      metadata: { order_id: String(orderId) },
      success_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/checkout/cancel`,
    };

    if (safeCustomerEmail) {
      sessionData.customer_email = safeCustomerEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionData);

    return session;
  },

  /**
   * Verify Stripe webhook signature
   * Returns the verified event or throws if the signature is invalid
   */
  constructEvent(rawBody, signature) {
    const stripe = getStripe();
    return stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  },
};

module.exports = StripeService;
