'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect to the main profile page which already shows reviews/ratings
export default function ProfileReviewsRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/profile'); }, [router]);
  return null;
}
