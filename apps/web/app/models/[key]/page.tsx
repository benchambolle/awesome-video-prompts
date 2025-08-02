import type { Metadata } from "next";
import { Suspense } from "react";
import ModelDetailClient from './model-detail-client'

interface Props {
  params: Promise<{ key: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { key: modelId } = await params
  
  // Use simple metadata during build to avoid any potential issues
  const title = `${modelId} | DengeAI`
  const description = `AI video generation model: ${modelId}`
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: [
        {
          url: '/og.png',
          width: 1200,
          height: 630,
          alt: `${title} - Professional AI Video Generation Model`,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og.png'],
    }
  }
}

export default async function VideoGenerationPage({ params }: Props) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ModelDetailClient />
    </Suspense>
  )
}
