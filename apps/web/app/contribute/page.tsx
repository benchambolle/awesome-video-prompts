'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/ui/card"
import { Button } from "@workspace/ui/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { 
  AddCircleIcon, 
  Settings02Icon, 
  FileEditIcon,
  PaintBrushIcon,
  ArrowRight01Icon,
  VideoReplayIcon,
  Image02Icon,
  SparklesIcon
} from "@hugeicons/core-free-icons"

export default function ContributePage() {
  const router = useRouter()

  const promptGallerySystem = [
    {
      id: 'custom-prompt',
      title: 'Custom Prompt',
      description: 'Add complete video prompts that users have created',
      icon: VideoReplayIcon,
      path: '/contribute/custom-prompt',
      impact: 'Appears in Prompt Gallery as inspiration for other users',
      whatYouAdd: 'Full video prompts with examples, thumbnails, and results',
      example: 'A cinematic shot of a person walking through a foggy forest at golden hour',
      affects: ['Prompt Gallery', 'User inspiration', 'Community sharing']
    },
    {
      id: 'prompt-categories',
      title: 'Prompt Categories',
      description: 'Create categories to organize custom prompts in the gallery',
      icon: Settings02Icon,
      path: '/contribute/prompt-categories',
      impact: 'Helps users find specific types of prompts in the gallery',
      whatYouAdd: 'Category labels like "Cinematic", "Animation", "Documentary"',
      example: 'Commercial, Artistic, Experimental, etc.',
      affects: ['Prompt Gallery organization', 'Search filters', 'User navigation']
    }
  ]

  const promptGeneratorSystem = [
    {
      id: 'base-prompt',
      title: 'Prompt Elements',
      description: 'Add specific prompt elements for the generator categories',
      icon: FileEditIcon,
      path: '/contribute/base-prompt',
      impact: 'Users can select these options when building prompts',
      whatYouAdd: 'Specific prompt elements that combine to create full prompts',
      example: 'soft golden-hour lighting, medium shot, dolly forward',
      affects: ['Prompt Generator options', 'User selections', 'Prompt building']
    },
    {
      id: 'base-prompt-category',
      title: 'Element Categories',
      description: 'Create new category types for organizing prompt elements',
      icon: PaintBrushIcon,
      path: '/contribute/base-prompt-category',
      impact: 'Creates new sections in the Prompt Generator',
      whatYouAdd: 'Category types that group related prompt elements',
      example: 'Camera Angle, Environment Color, Time Period, Weather',
      affects: ['Generator structure', 'Category organization', 'User workflow']
    }
  ]

  return (
    <div className="space-y-8">
   
    </div>
  )
}
