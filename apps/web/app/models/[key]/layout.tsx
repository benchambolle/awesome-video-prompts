import fs from 'fs'
import path from 'path'

// Generate static params for all models
export async function generateStaticParams() {
  // Model filename to URL key mapping (must match the mapping in page.tsx)
  const modelMap: Record<string, string> = {
    'fal-ai-veo-3-fast.json': 'veo-3-fast',
    'fal-ai-ltx-video-13b.json': 'ltx-video-13b',
    'fal-ai-vidu-q1.json': 'vidu-q1',
    'fal-ai-pixverse-v45-text-to-video.json': 'pixverse-v45',
    'fal-ai-kling-video-pro-text-to-video.json': 'kling-video-pro',
    'fal-ai-minimax-hailuo-02-pro.json': 'minimax-hailuo-02-pro',
    'fal-ai-seedance-v1-pro.json': 'seedance-v1-pro',
    'fal-ai-wan-turbo-text-to-video.json': 'wan-turbo-text',
    'fal-ai-wan-turbo-image-to-video.json': 'wan-turbo-image',
    'fal-ai-wan-v22-5b.json': 'wan-v22-5b',
  }

  try {
    const modelsDir = path.join(process.cwd(), 'public/data/models')
    const files = fs.readdirSync(modelsDir)
    
    const staticParams = files
      .filter(file => file.endsWith('.json') && modelMap[file])
      .map(file => ({
        key: modelMap[file]
      }))
      
    // Add alternative formats for models that might use fallback URL generation
    const additionalParams = [
      { key: 'fal-ai-bytedance-seedance-v1-pro' }, // Fallback format for bytedance seedance
      { key: 'fal-ai-veo-3-fast' }, // Fallback format for veo
      { key: 'fal-ai-vidu-q1' }, // Fallback format for vidu
    ]
    
    return [...staticParams, ...additionalParams]
  } catch (error) {
    console.error('Failed to generate static params for models:', error)
    // Fallback to hardcoded list if file reading fails
    return [
      { key: 'veo-3-fast' },
      { key: 'ltx-video-13b' },
      { key: 'vidu-q1' },
      { key: 'pixverse-v45' },
      { key: 'kling-video-pro' },
      { key: 'minimax-hailuo-02-pro' },
      { key: 'seedance-v1-pro' },
      { key: 'wan-turbo-text' },
      { key: 'wan-turbo-image' },
      { key: 'wan-v22-5b' },
    ]
  }
}

export default function ModelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
