'use server'
import AddReviewButton from '@/app/components/AddReviewButton'
import React from 'react'
import ReviewsList from '@/app/components/ReviewsList'
import ScrollTopLinks from '@/app/hooks/ScrollTopLinks'
interface PageProps {
  params: Promise<{ gameId: string }>; // Имя ключа должно совпадать с [папкой]
}

export default async function ReviewsPage({ params }: PageProps) {
  
  const resolvedParams = await params;
  const slug = resolvedParams.gameId; 
  if (!slug) {
    return <div>Game is not found </div>;
  }


  const gameId = parseInt(slug.split('-')[0]);
  return (
    <div>
      <ScrollTopLinks></ScrollTopLinks>
      <AddReviewButton gameId={gameId}/>
      <ReviewsList gameId={gameId}/>
    </div>
  )
}
