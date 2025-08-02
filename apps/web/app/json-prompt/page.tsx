'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@workspace/ui/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/ui/card'
import { Textarea } from '@workspace/ui/components/ui/textarea'
import { useToast } from '@workspace/ui/hooks/use-toast'
import { HugeiconsIcon } from '@hugeicons/react'
import { RocketIcon, Loading03Icon, CopyIcon, ViewIcon, ViewOffIcon, SourceCodeIcon } from '@hugeicons/core-free-icons'
import { useJsonPromptGenerator } from '@workspace/ui/hooks/use-json-prompt-generator'
import { DashboardSubheader } from '@workspace/ui/components/dashboard-subheader'

export default function JsonPromptPage() {
  const [inputText, setInputText] = useState('')
  const [originalJsonResult, setOriginalJsonResult] = useState<any>(null)
  const [jsonResult, setJsonResult] = useState<any>(null)
  const [categoryStates, setCategoryStates] = useState<{[key: string]: {enabled: boolean, value: string}}>({}) 
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const { toast } = useToast()

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied to clipboard",
        description: "Content has been copied to your clipboard.",
      })
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      })
    }
  }

  const {
    generateJsonPrompt,
    isLoading: isGeneratingJson,
    error: jsonError
  } = useJsonPromptGenerator({
    onSuccess: (jsonPrompt) => {
      setOriginalJsonResult(jsonPrompt)
      setJsonResult(jsonPrompt)
      // Initialize category states
      const newCategoryStates: {[key: string]: {enabled: boolean, value: string}} = {}
      Object.entries(jsonPrompt).forEach(([key, value]) => {
        newCategoryStates[key] = {
          enabled: true,
          value: String(value)
        }
      })
      setCategoryStates(newCategoryStates)
      toast({
        title: "JSON Prompt Generated",
        description: "Your prompt has been converted to structured JSON format.",
      })
    },
    onError: (error) => {
      toast({
        title: "JSON Generation Failed",
        description: error,
        variant: "destructive",
      })
    }
  })

  const handleGenerateJson = () => {
    if (!inputText.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter some text to generate a JSON prompt.",
        variant: "destructive",
      })
      return
    }

    generateJsonPrompt(inputText.trim())
  }

  const handleClear = () => {
    setInputText('')
    setOriginalJsonResult(null)
    setJsonResult(null)
    setCategoryStates({})
    setEditingCategory(null)
  }

  // Update JSON result with delay when categories change
  const updateJsonResult = useCallback(() => {
    if (!originalJsonResult) return
    
    const updatedJson: any = {}
    Object.entries(categoryStates).forEach(([key, state]) => {
      if (state.enabled) {
        updatedJson[key] = state.value
      }
    })
    setJsonResult(updatedJson)
  }, [originalJsonResult, categoryStates])

  useEffect(() => {
    if (Object.keys(categoryStates).length > 0) {
      const timeoutId = setTimeout(() => {
        updateJsonResult()
      }, 300) // 300ms delay
      
      return () => clearTimeout(timeoutId)
    }
  }, [categoryStates, updateJsonResult])

  const toggleCategory = (key: string) => {
    setCategoryStates(prev => ({
      ...prev,
      [key]: {
        enabled: !(prev[key]?.enabled ?? true),
        value: prev[key]?.value ?? ''
      }
    }))
  }

  const updateCategoryValue = (key: string, value: string) => {
    setCategoryStates(prev => ({
      ...prev,
      [key]: {
        enabled: prev[key]?.enabled ?? true,
        value: value
      }
    }))
  }

  return (
    <div className="w-full">
      {/* Header using DashboardSubheader */}
      <DashboardSubheader
        title="JSON Prompt Generator"
        description="Convert your ideas into structured JSON format for video generation"
        icon={SourceCodeIcon}
        iconBoxVariant="purple"
      />
      
      <div className="px-6 py-6">
        <div className="max-w-7xl space-y-6">

        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={RocketIcon} className="size-5" />
              Enter Your Prompt
            </CardTitle>
            <CardDescription>
              Describe your video concept, scene, or any creative ideas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter your prompt ideas here... (e.g., 'A mysterious figure walking through a foggy forest at sunset with dramatic lighting')"
              value={inputText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInputText(e.target.value)}
              rows={6}
              className="min-h-[150px]"
            />
            
            <div className="flex flex-wrap gap-3 justify-between">
              <div className="flex gap-3">
                <Button
                  onClick={handleGenerateJson}
                  disabled={isGeneratingJson || !inputText.trim()}
                  className="gap-2"
                >
                  <HugeiconsIcon 
                    icon={isGeneratingJson ? Loading03Icon : RocketIcon} 
                    className={`size-4 ${isGeneratingJson ? 'animate-spin' : ''}`} 
                  />
                  {isGeneratingJson ? 'Creating...' : 'Create JSON Prompt'}
                </Button>
                
                {(inputText || jsonResult) && (
                  <Button
                    onClick={handleClear}
                    variant="outline"
                  >
                    Clear All
                  </Button>
                )}
              </div>
              
              <div className="text-sm text-muted-foreground">
                {inputText.length} characters
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {originalJsonResult && (
          <div className="space-y-4">
            {/* Complete JSON */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Complete JSON Structure</CardTitle>
                  <Button
                    onClick={() => copyToClipboard(JSON.stringify(jsonResult, null, 2))}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <HugeiconsIcon icon={CopyIcon} className="size-4" />
                    Copy JSON
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm whitespace-pre-wrap">
                    {JSON.stringify(jsonResult, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>

            {/* Individual Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Individual Categories</CardTitle>
                <CardDescription>
                  Edit values and toggle categories for your JSON prompt
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(categoryStates).map(([key, state]) => (
                    <div key={key} className={`space-y-2 transition-opacity duration-200 ${
                      state.enabled ? 'opacity-100' : 'opacity-60'
                    }`}>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm capitalize flex-1">
                          {key.replace(/_/g, ' ')}
                        </h4>
                      </div>
                      {editingCategory === key ? (
                        <div className="relative">
                          <Textarea
                            value={state.value}
                            onChange={(e) => updateCategoryValue(key, e.target.value)}
                            className="text-sm min-h-[60px] resize-none pr-10"
                            onBlur={() => setEditingCategory(null)}
                            autoFocus
                          />
                          <Button
                            onClick={() => toggleCategory(key)}
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-2 h-6 w-6 p-0 hover:bg-muted/50"
                          >
                            <HugeiconsIcon 
                              icon={state.enabled ? ViewIcon : ViewOffIcon} 
                              className={`size-4 transition-colors ${
                                state.enabled ? 'text-foreground' : 'text-muted-foreground'
                              }`} 
                            />
                          </Button>
                        </div>
                      ) : (
                        <div className="relative">
                          <div 
                            className={`p-3 pr-10 border rounded-md text-sm cursor-pointer transition-colors ${
                              state.enabled 
                                ? 'bg-background hover:bg-muted/50' 
                                : 'bg-muted/30 text-muted-foreground'
                            }`}
                            onClick={() => setEditingCategory(key)}
                          >
                            {state.value}
                          </div>
                          <Button
                            onClick={() => toggleCategory(key)}
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-2 h-6 w-6 p-0 hover:bg-muted/50"
                          >
                            <HugeiconsIcon 
                              icon={state.enabled ? ViewIcon : ViewOffIcon} 
                              className={`size-4 transition-colors ${
                                state.enabled ? 'text-foreground' : 'text-muted-foreground'
                              }`} 
                            />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
