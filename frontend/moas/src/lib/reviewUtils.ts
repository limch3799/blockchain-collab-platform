import type { ReviewGiven, ReviewReceived } from '@/types/review';

export function getDisplayMember(
  review: ReviewGiven | ReviewReceived,
  mode: 'reviewer' | 'reviewee',
) {
  return mode === 'reviewer'
    ? (review as ReviewReceived).reviewer
    : (review as ReviewGiven).reviewee;
}
