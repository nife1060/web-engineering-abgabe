/** Stripe-Client, der von der Checkout-Logik und dem Zahlungs-Webhook genutzt wird. */

import Stripe from "stripe";

// Lieber gleich beim Start crashen, wenn der Key fehlt, statt später mitten
// in einer Checkout-Anfrage einen kryptischen Fehler zu bekommen.
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-04-22.dahlia",
  typescript: true,
});

/**
 * Gibt die volle Basis-URL der App zurück. Brauchen wir für die
 * Success-/Cancel-URLs bei Stripe, die müssen nämlich absolut sein.
 */
export function getBaseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
}
