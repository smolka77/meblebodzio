import type { ProductReview } from "@/lib/typy";

export function averageRating(reviews: ProductReview[]): number {
  if (!reviews.length) return 0;
  return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
}

export function formatAverageRating(avg: number): string {
  return avg.toFixed(1).replace(".", ",");
}

export function productScore(product: {
  reviews?: ProductReview[];
  rating?: number;
  reviewCount?: number;
}): { rating: number; count: number } | null {
  const list = product.reviews?.filter((review) => Number.isFinite(review.rating)) ?? [];
  if (list.length) {
    return { rating: averageRating(list), count: list.length };
  }
  const rating = product.rating;
  const count = product.reviewCount;
  if (
    typeof rating === "number" &&
    rating > 0 &&
    typeof count === "number" &&
    count > 0
  ) {
    return { rating, count };
  }
  return null;
}
