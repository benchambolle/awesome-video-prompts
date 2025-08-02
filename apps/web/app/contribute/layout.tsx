'use client'

import { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/ui/card"
import { Badge } from "@workspace/ui/components/ui/badge"
import { DashboardSubheader } from "@workspace/ui/components/dashboard-subheader"
import { useRouter, usePathname } from 'next/navigation'
import { HugeiconsIcon } from "@hugeicons/react"
import { 
  AddCircleIcon, 
  Settings02Icon, 
  FileEditIcon,
  PaintBrushIcon,
  SparklesIcon,
  ArrowRight01Icon,
  CheckmarkCircle01Icon
} from "@hugeicons/core-free-icons"

interface ContributeLayoutProps {
  children: ReactNode
}

export default function ContributeLayout({ children }: ContributeLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()

  const contributionTypes = [
    {
      id: 'custom-prompt',
      title: 'Share Your Prompts',
      description: 'Contribute complete video generation prompts that others can discover and use',
      icon: AddCircleIcon,
      path: '/contribute/custom-prompt',
      category: 'Gallery',
      impact: 'Sample prompts for creating AI videos',
      difficulty: 'Easy'
    },
    {
      id: 'prompt-categories',
      title: 'Organize Categories', 
      description: 'Create new categories to help organize and filter prompts in the gallery',
      icon: Settings02Icon,
      path: '/contribute/prompt-categories',
      category: 'Gallery',
      impact: 'Categories for organizing sample prompts',
      difficulty: 'Easy'
    },
    {
      id: 'base-prompt',
      title: 'Add Prompt Elements',
      description: 'Contribute individual prompt building blocks for the prompt generator',
      icon: FileEditIcon,
      path: '/contribute/base-prompt',
      category: 'Generator',
      impact: 'Prompt building blocks for creating video prompts',
      difficulty: 'Medium'
    },
    {
      id: 'base-prompt-category',
      title: 'Create Element Types',
      description: 'Define new types of prompt elements for advanced prompt generation',
      icon: PaintBrushIcon,
      path: '/contribute/base-prompt-category',
      category: 'Generator',
      impact: 'Prompt element types for creating video prompts',
      difficulty: 'Advanced'
    }
  ]

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <DashboardSubheader
        title="Contribute to DengeAI"
        description="Help build the future of AI video generation by sharing your prompts and ideas with our community"
        icon={SparklesIcon}
        iconBoxVariant="primary"
      />

      <div className="flex-1 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {contributionTypes.map((type) => {
              const isActive = pathname === type.path
              const isGallery = type.category === 'Gallery'
              
              return (
                <Card 
                  key={type.id}
                  className={`group cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    isActive 
                      ? 'ring-2 ring-primary border-primary bg-primary/5' 
                      : 'hover:border-primary/50 hover:bg-accent/30'
                  }`}
                  onClick={() => router.push(type.path)}
                >
                  <CardHeader className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-xl transition-colors ${
                        isActive 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted group-hover:bg-primary/10'
                      }`}>
                        <HugeiconsIcon 
                          icon={type.icon}
                          size={24}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={isGallery ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {type.category}
                        </Badge>
                        <Badge 
                          variant="outline"
                          className="text-xs"
                        >
                          {type.difficulty}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">
                        {type.title}
                      </CardTitle>
                      <p className="text-muted-foreground leading-relaxed">
                        {type.description}
                      </p>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} />
                        <span>{type.impact}</span>
                      </div>
                      <HugeiconsIcon 
                        icon={ArrowRight01Icon} 
                        size={16} 
                        className={`transition-transform group-hover:translate-x-1 ${
                          isActive ? 'text-primary' : 'text-muted-foreground'
                        }`}
                      />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="min-h-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
