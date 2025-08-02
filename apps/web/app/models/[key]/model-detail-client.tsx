'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { HugeiconsIcon } from "@hugeicons/react"
import { 
  ArrowLeft01Icon, 
  VideoReplayIcon, 
  UploadCircle02Icon,
  ImageUpload01Icon,
  SparklesIcon,
  PlayIcon,
  PauseIcon,
  DownloadCircle02Icon,
  Settings02Icon,
  UserIcon,
  DatabaseIcon
} from "@hugeicons/core-free-icons"
import { Button } from "@workspace/ui/components/ui/button"
import { Input } from "@workspace/ui/components/ui/input"
import { Textarea } from "@workspace/ui/components/ui/textarea"
import { Label } from "@workspace/ui/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/ui/card"
import { Badge } from "@workspace/ui/components/ui/badge"
import { StatusBadge } from "@workspace/ui/components/ui/status-badge"
import { Separator } from "@workspace/ui/components/ui/separator"
import { Slider } from "@workspace/ui/components/ui/slider"
import { Switch } from "@workspace/ui/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/ui/select"
import { DashboardSubheader } from "@workspace/ui/components/dashboard-subheader"
import { clientDataApi } from "../../../lib/client-data-loader"
import { fal } from "@fal-ai/client"

export default function ModelDetailClient() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const modelKey = params.key as string

  // Load API key from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedApiKey = localStorage.getItem('fal_api_key')
      if (storedApiKey) {
        setApiKey(storedApiKey)
        fal.config({
          credentials: storedApiKey
        })
      }
    }
  }, [])

  // State management
  const [modelData, setModelData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [referenceImage, setReferenceImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null)
  const [parameters, setParameters] = useState<Record<string, any>>({})
  const [apiKey, setApiKey] = useState<string>('')
  const [showApiKeyInput, setShowApiKeyInput] = useState(false)
  const [queueStatus, setQueueStatus] = useState<string>('')
  const [queuePosition, setQueuePosition] = useState<number | null>(null)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  // Convert URL key back to model ID (reverse of the mapping in page.tsx)
  const getModelIdFromKey = (key: string): string => {
    const keyToIdMap: Record<string, string> = {
      'veo-3-fast': 'fal-ai/veo/3/fast',
      'ltx-video-13b': 'fal-ai/ltx-video/13b-098',
      'vidu-q1': 'fal-ai/vidu/q1',
      'pixverse-v45': 'fal-ai/pixverse/v4.5/text-to-video',
      'kling-video-pro': 'fal-ai/kling-video/v1.6/pro/text-to-video',
      'minimax-hailuo-02-pro': 'fal-ai/minimax/hailuo-02/pro/text-to-video',
      'minimax-hailuo-02-standard-text': 'fal-ai/minimax/hailuo-02/standard/text-to-video',
      'minimax-hailuo-02-standard-image': 'fal-ai/minimax/hailuo-02/standard/image-to-video',
      'minimax-hailuo-02-pro-image': 'fal-ai/minimax/hailuo-02/pro/image-to-video',
      'seedance-v1-pro': 'fal-ai/bytedance/seedance-v1/pro',
      'wan-turbo-text': 'fal-ai/wan/turbo/text-to-video',
      'wan-turbo-image': 'fal-ai/wan/turbo/image-to-video',
      'wan-v22-5b': 'fal-ai/wan/v2.2-5b/text-to-video',
      // Alternative fallback formats
      'fal-ai-bytedance-seedance-v1-pro': 'fal-ai/bytedance/seedance-v1/pro',
      'fal-ai-veo-3-fast': 'fal-ai/veo/3/fast',
      'fal-ai-vidu-q1': 'fal-ai/vidu/q1',
    }
    
    return keyToIdMap[key] || key
  }

  // Load model data
  useEffect(() => {
    const loadModelData = async () => {
      try {
        setIsLoading(true)
        const models = await clientDataApi.getVideoModels()
        const actualModelId = getModelIdFromKey(modelKey)
        const model = models.find(m => m.id === actualModelId)
        
        if (model) {
          setModelData(model)
                      // Initialize parameters with default values from model_parameters
            const defaultParams: Record<string, any> = {}
            
            if (model.model_parameters) {
              Object.entries(model.model_parameters).forEach(([name, param]: [string, any]) => {
                if (param.default !== undefined) {
                  defaultParams[name] = param.default
                }
              })
            }
            
            // Check if prompt is provided in URL and set it
            const urlPrompt = searchParams.get('prompt')
            if (urlPrompt) {
              defaultParams.prompt = decodeURIComponent(urlPrompt)
            }
            
            setParameters(defaultParams)
        }
      } catch (error) {
        console.error('Error loading model data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (modelKey) {
      loadModelData()
    }
  }, [modelKey, searchParams])

  // Handle image file selection
  useEffect(() => {
    if (referenceImage) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(referenceImage)
    } else {
      setImagePreview(null)
    }
  }, [referenceImage])

  // Handle image URL changes
  useEffect(() => {
    if (imageUrl && !referenceImage) {
      setImagePreview(imageUrl)
    }
  }, [imageUrl, referenceImage])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setReferenceImage(file)
      setImageUrl('') // Clear URL when file is selected
    }
  }

  const handleImageUrlChange = (url: string) => {
    setImageUrl(url)
    if (url) {
      setReferenceImage(null) // Clear file when URL is entered
    }
  }

  const removeImage = () => {
    setReferenceImage(null)
    setImageUrl('')
    setImagePreview(null)
  }

  const handleParameterChange = (paramName: string, value: any) => {
    setParameters(prev => ({
      ...prev,
      [paramName]: value
    }))
  }

  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      localStorage.setItem('fal_api_key', apiKey.trim())
      fal.config({
        credentials: apiKey.trim()
      })
      setShowApiKeyInput(false)
    }
  }

  const handleApiKeyChange = () => {
    setShowApiKeyInput(true)
  }

  const removeApiKey = () => {
    localStorage.removeItem('fal_api_key')
    setApiKey('')
    setShowApiKeyInput(true)
  }

  const handleGenerate = async () => {
    // Check if API key is provided
    if (!apiKey.trim()) {
      alert('Please provide your Fal API key first. You can get it from https://fal.ai/')
      setShowApiKeyInput(true)
      return
    }
    
    // Check if prompt parameter is provided
    if (!parameters.prompt?.trim()) {
      alert('Please provide a prompt for video generation')
      return
    }

    setIsGenerating(true)
    setQueueStatus('SUBMITTING')
    setQueuePosition(null)
    
    try {
      // Prepare the request payload based on model parameters
      const requestPayload: Record<string, any> = { ...parameters }
      
      // Add reference image if provided and model supports it
      if ((modelData.category === 'image-to-video' || modelData.type === 'image-to-video') && imagePreview) {
        requestPayload.image_url = imagePreview
      }
      
      console.log('Submitting video generation request with payload:', requestPayload)
      console.log('Using endpoint:', modelData.api_config?.endpoint)
      
      // Submit the request to fal API queue
      const submitResponse = await fetch(`${modelData.api_config?.endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Key ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      })
      
      if (!submitResponse.ok) {
        const errorText = await submitResponse.text()
        throw new Error(`Failed to submit request: ${submitResponse.status} ${errorText}`)
      }
      
      const queueResult = await submitResponse.json()
      console.log('Queue submission result:', queueResult)
      
      if (queueResult.status === 'IN_QUEUE') {
        setQueueStatus('IN_QUEUE')
        setQueuePosition(queueResult.queue_position || 0)
        
        // Start polling for status
        await pollQueueStatus(queueResult.status_url, queueResult.response_url)
      } else {
        throw new Error('Unexpected queue response status: ' + queueResult.status)
      }
      
    } catch (error) {
      console.error('Error generating video:', error)
      alert(`Error generating video: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setQueueStatus('')
      setQueuePosition(null)
      setIsGenerating(false)
    }
  }
  
  const pollQueueStatus = async (statusUrl: string, responseUrl: string) => {
    const maxPollingTime = 10 * 60 * 1000 // 10 minutes
    const startTime = Date.now()
    
    const poll = async (): Promise<void> => {
      try {
        if (Date.now() - startTime > maxPollingTime) {
          throw new Error('Video generation timed out after 10 minutes')
        }
        
        const statusResponse = await fetch(statusUrl, {
          headers: {
            'Authorization': `Key ${apiKey}`,
          },
        })
        
        if (!statusResponse.ok) {
          throw new Error(`Failed to check status: ${statusResponse.status}`)
        }
        
        const status = await statusResponse.json()
        console.log('Queue status:', status)
        
        setQueueStatus(status.status)
        if (status.queue_position !== undefined) {
          setQueuePosition(status.queue_position)
        }
        
        if (status.status === 'COMPLETED') {
          // Fetch the final result
          const resultResponse = await fetch(responseUrl, {
            headers: {
              'Authorization': `Key ${apiKey}`,
            },
          })
          
          if (!resultResponse.ok) {
            throw new Error(`Failed to fetch result: ${resultResponse.status}`)
          }
          
          const result = await resultResponse.json()
          console.log('Final result:', result)
          
          // Extract video URL from result
          if (result.video?.url) {
            setGeneratedVideo(result.video.url)
          } else if (result.video) {
            setGeneratedVideo(result.video)
          } else if (result.data?.video?.url) {
            setGeneratedVideo(result.data.video.url)
          } else if (result.data?.video) {
            setGeneratedVideo(result.data.video)
          } else {
            console.error('No video URL found in result:', result)
            alert('Video generation completed but no video URL was returned')
          }
          
          setQueueStatus('COMPLETED')
          setQueuePosition(null)
          setIsGenerating(false)
          
        } else if (status.status === 'FAILED') {
          throw new Error(`Video generation failed: ${status.error || 'Unknown error'}`)
          
        } else if (status.status === 'IN_PROGRESS' || status.status === 'IN_QUEUE') {
          // Continue polling
          setTimeout(poll, 2000) // Poll every 2 seconds
          
        } else {
          throw new Error(`Unknown status: ${status.status}`)
        }
        
      } catch (error) {
        console.error('Error polling queue status:', error)
        alert(`Error during video generation: ${error instanceof Error ? error.message : 'Unknown error'}`)
        setQueueStatus('')
        setQueuePosition(null)
        setIsGenerating(false)
      }
    }
    
    // Start polling
    setTimeout(poll, 1000) // Initial delay of 1 second
  }

  // Play video function
  const handlePlayVideo = () => {
    const videoElement = document.querySelector('video') as HTMLVideoElement
    if (videoElement) {
      if (videoElement.paused) {
        videoElement.play()
        setIsVideoPlaying(true)
      } else {
        videoElement.pause()
        setIsVideoPlaying(false)
      }
    }
  }

  // Download video function
  const handleDownloadVideo = async () => {
    if (!generatedVideo) return
    
    try {
      // Create a temporary anchor element to trigger download
      const response = await fetch(generatedVideo)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `generated-video-${Date.now()}.mp4`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up the object URL
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading video:', error)
      alert('Failed to download video. Please try again.')
    }
  }

  const renderParameterControl = (param: any) => {
    const value = parameters[param.name]

    switch (param.type) {
      case 'number':
        if (param.min !== undefined && param.max !== undefined) {
          return (
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor={param.name}>{param.name.charAt(0).toUpperCase() + param.name.slice(1).replace(/_/g, ' ')}</Label>
                <span className="text-sm text-muted-foreground">{value}</span>
              </div>
              {param.description && (
                <p className="text-xs text-muted-foreground">{param.description}</p>
              )}
              <Slider
                id={param.name}
                min={param.min}
                max={param.max}
                step={param.step || 1}
                value={[value || param.default || param.min]}
                onValueChange={(values: number[]) => handleParameterChange(param.name, values[0])}
              />
            </div>
          )
        } else {
          return (
            <div className="space-y-2">
              <Label htmlFor={param.name}>{param.name.charAt(0).toUpperCase() + param.name.slice(1).replace(/_/g, ' ')}</Label>
              {param.description && (
                <p className="text-xs text-muted-foreground">{param.description}</p>
              )}
              <Input
                id={param.name}
                type="number"
                value={value || ''}
                onChange={(e) => handleParameterChange(param.name, parseFloat(e.target.value))}
                min={param.min}
                max={param.max}
                step={param.step}
              />
            </div>
          )
        }

      case 'boolean':
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                id={param.name}
                checked={value || false}
                onCheckedChange={(checked: boolean) => handleParameterChange(param.name, checked)}
              />
              <Label htmlFor={param.name}>{param.name.charAt(0).toUpperCase() + param.name.slice(1).replace(/_/g, ' ')}</Label>
            </div>
            {param.description && (
              <p className="text-xs text-muted-foreground">{param.description}</p>
            )}
          </div>
        )

      case 'select':
        return (
          <div className="space-y-2">
            <Label htmlFor={param.name}>{param.name.charAt(0).toUpperCase() + param.name.slice(1).replace(/_/g, ' ')}</Label>
            {param.description && (
              <p className="text-xs text-muted-foreground">{param.description}</p>
            )}
            <Select value={value || ''} onValueChange={(val: string) => handleParameterChange(param.name, val)}>
              <SelectTrigger>
                <SelectValue placeholder={`Select ${param.name.charAt(0).toUpperCase() + param.name.slice(1).replace(/_/g, ' ')}`} />
              </SelectTrigger>
              <SelectContent>
                {param.options?.map((option: any) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label || option.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      default:
        return (
          <div className="space-y-2">
            <Label htmlFor={param.name}>{param.name.charAt(0).toUpperCase() + param.name.slice(1).replace(/_/g, ' ')}</Label>
            {param.description && (
              <p className="text-xs text-muted-foreground">{param.description}</p>
            )}
            <Input
              id={param.name}
              value={value || ''}
              onChange={(e) => handleParameterChange(param.name, e.target.value)}
              placeholder={param.placeholder}
            />
          </div>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading model...</div>
        </div>
      </div>
    )
  }

  if (!modelData) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Model not found</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardSubheader
        title={modelData.display_name || modelData.id}
        description={modelData.description || 'AI video generation model'}
        icon={VideoReplayIcon}
        iconBoxVariant="primary"
        className="mb-8"
      />

      <div className="container mx-auto px-4 ">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Input */}
          <div className="space-y-6">
            {/* Back Button */}
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="mb-4"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4 mr-2" />
              Back to Models
            </Button>

            {/* API Key Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HugeiconsIcon icon={UserIcon} className="w-5 h-5" />
                  Fal API Key
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!apiKey || showApiKeyInput ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="api-key">Enter your Fal API Key</Label>
                      <Input
                        id="api-key"
                        type="password"
                        placeholder="fal_xxxxxxxxxxxxxxxx"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleApiKeySubmit} size="sm">
                        Save API Key
                      </Button>
                      {apiKey && (
                        <Button 
                          variant="outline" 
                          onClick={() => setShowApiKeyInput(false)} 
                          size="sm"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Get your API key from{' '}
                      <a 
                        href="https://fal.ai/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        https://fal.ai/
                      </a>
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">API Key configured</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleApiKeyChange}>
                        Change
                      </Button>
                      <Button variant="outline" size="sm" onClick={removeApiKey}>
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Prompt Loaded Notification */}
            {searchParams.get('prompt') && (
              <Card className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <HugeiconsIcon icon={SparklesIcon} className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                      Prompt loaded from prompt library
                    </span>
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    The prompt has been pre-filled from the selected prompt. You can modify it or generate the video directly.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Reference Image - Only for image-to-video models */}
            {(modelData.category === 'image-to-video' || modelData.type === 'image-to-video') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HugeiconsIcon icon={ImageUpload01Icon} className="w-5 h-5" />
                  Reference Image (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!imagePreview ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="image-upload">Upload Image</Label>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="mt-1"
                      />
                    </div>
                    <div className="text-center text-muted-foreground">or</div>
                    <div>
                      <Label htmlFor="image-url">Image URL</Label>
                      <Input
                        id="image-url"
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        value={imageUrl}
                        onChange={(e) => handleImageUrlChange(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Reference"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={removeImage}
                        className="absolute top-2 right-2"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            )}

            {/* Parameters */}
            {modelData.model_parameters && Object.keys(modelData.model_parameters).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HugeiconsIcon icon={Settings02Icon} className="w-5 h-5" />
                    Parameters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(modelData.model_parameters).map(([name, param]: [string, any]) => (
                    <div key={name}>
                      {renderParameterControl({ ...param, name })}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={!parameters.prompt?.trim() || isGenerating || !apiKey.trim()}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  {queueStatus === 'SUBMITTING' && 'Submitting...'}
                  {queueStatus === 'IN_QUEUE' && `In Queue (Position: ${queuePosition ?? 0})`}
                  {queueStatus === 'IN_PROGRESS' && 'Generating Video...'}
                  {queueStatus === 'COMPLETED' && 'Processing Result...'}
                  {!queueStatus && 'Generating...'}
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={SparklesIcon} className="w-4 h-4 mr-2" />
                  Generate Video
                </>
              )}
            </Button>
            
            {/* Queue Status Display */}
            {isGenerating && queueStatus && (
              <Card className="border-dashed">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    {/* Status Icon and Text */}
                    <div className="flex items-center justify-center space-x-2">
                      {queueStatus === 'SUBMITTING' && (
                        <>
                          <div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm font-medium text-blue-600">Submitting Request</span>
                        </>
                      )}
                      {queueStatus === 'IN_QUEUE' && (
                        <>
                          <div className="animate-bounce w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-sm font-medium text-yellow-600">Waiting in Queue</span>
                        </>
                      )}
                      {queueStatus === 'IN_PROGRESS' && (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full"></div>
                          <span className="text-sm font-medium text-green-600">Generating Video</span>
                        </>
                      )}
                    </div>
                    
                    {/* Queue Position */}
                    {queuePosition !== null && queuePosition > 0 && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                        <div className="flex items-center justify-center space-x-2">
                          <HugeiconsIcon icon={UserIcon} className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm text-yellow-700 dark:text-yellow-300">
                            Position {queuePosition} in queue
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Progress Message */}
                    {queueStatus === 'IN_PROGRESS' && (
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-center space-x-2">
                            <HugeiconsIcon icon={SparklesIcon} className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-700 dark:text-green-300">
                              AI is creating your video
                            </span>
                          </div>
                          <div className="text-xs text-green-600 dark:text-green-400">
                            This process typically takes 2-5 minutes depending on the model and complexity
                          </div>
                          
                          {/* Animated Progress Bar */}
                          <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-1.5 mt-3">
                            <div className="bg-green-500 h-1.5 rounded-full animate-pulse" style={{width: '60%'}}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Queue Info */}
                    {queueStatus === 'IN_QUEUE' && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                        <div className="text-xs text-blue-600 dark:text-blue-400">
                          Your request is being processed in order. Please keep this page open.
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Output */}
          <div className="space-y-6">
            <Card className='!p-0'>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 px-3 pt-4">
                  <HugeiconsIcon icon={VideoReplayIcon} className="w-5 h-5" />
                  Generated Video
                </CardTitle>
              </CardHeader>
              <CardContent className='!p-0'>
                {generatedVideo ? (
                  <div className="space-y-4">
                    <video
                      src={generatedVideo}
                      controls
                      className="w-full rounded-lg"
                      poster="/placeholder-video.jpg"
                      onPlay={() => setIsVideoPlaying(true)}
                      onPause={() => setIsVideoPlaying(false)}
                      onEnded={() => setIsVideoPlaying(false)}
                    />
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={handlePlayVideo}>
                        <HugeiconsIcon icon={isVideoPlaying ? PauseIcon : PlayIcon} className="w-4 h-4 mr-2" />
                        {isVideoPlaying ? 'Pause' : 'Play'}
                      </Button>
                      <Button variant="outline" className="flex-1" onClick={handleDownloadVideo}>
                        <HugeiconsIcon icon={DownloadCircle02Icon} className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <HugeiconsIcon icon={VideoReplayIcon} className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Your generated video will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Model Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HugeiconsIcon icon={DatabaseIcon} className="w-5 h-5" />
                  Model Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{modelData.provider}</Badge>
                  <StatusBadge variant="green">{modelData.status || 'Available'}</StatusBadge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <p className="font-medium">{modelData.category || modelData.type}</p>
                  </div>
                  {modelData.display_name && (
                    <div>
                      <span className="text-muted-foreground">Model:</span>
                      <p className="font-medium">{modelData.display_name}</p>
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground">Description:</span>
                  <p className="text-sm mt-1">{modelData.description}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
