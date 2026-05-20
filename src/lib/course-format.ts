import type { PricingModel } from "@/generated/prisma/enums";

export function formatCoursePrice(
  pricingModel: PricingModel,
  price: number,
  subscriptionPrice = 0,
) {
  if (pricingModel === "FREE") return "Free";
  if (pricingModel === "SUBSCRIPTION") {
    return `${subscriptionPrice.toFixed(2)} EUR / Month`;
  }
  return `${price.toFixed(2)} EUR`;
}

export function courseCtaLabel(
  pricingModel: PricingModel,
  price: number,
  subscriptionPrice = 0,
) {
  if (pricingModel === "FREE") return "Start Course for Free";
  if (pricingModel === "SUBSCRIPTION") {
    return `Subscribe now - EUR ${subscriptionPrice.toFixed(2)} / Month`;
  }
  return `Enroll now - EUR ${price.toFixed(2)}`;
}
