import type { ProductReview } from "@/lib/typy";

export function averageRating(reviews: ProductReview[]): number {
  if (!reviews.length) return 0;
  return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
}

export function formatAverageRating(avg: number): string {
  return avg.toFixed(1).replace(".", ",");
}
