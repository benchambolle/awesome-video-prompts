import type { Metadata } from "next";
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
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description
    }
  }
}

export default async function VideoGenerationPage({ params }: Props) {
  return <ModelDetailClient />
}
