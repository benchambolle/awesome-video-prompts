"use client"

import { useState, useEffect } from "react"
import { Button } from "@workspace/ui/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/ui/dialog"
import { Input } from "@workspace/ui/components/ui/input"
import { Label } from "@workspace/ui/components/ui/label"
import { HugeiconsIcon } from "@hugeicons/react"
import { Key01Icon, Delete02Icon, EyeIcon } from "@hugeicons/core-free-icons"
import { Alert, AlertDescription } from "@workspace/ui/components/ui/alert"
import { Badge } from "@workspace/ui/components/ui/badge"
import { 
  getFalApiKey, 
  setFalApiKey, 
  removeFalApiKey, 
  getFalApiKeyTimestamp, 
  validateFalApiKey, 
  maskApiKey 
} from "@workspace/ui/lib/fal-api-utils"

interface FalApiKeyDialogProps {
  children?: React.ReactNode
}



export function FalApiKeyDialog({ children }: FalApiKeyDialogProps) {
  const [open, setOpen] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [existingKey, setExistingKey] = useState<string | null>(null)
  const [keyTimestamp, setKeyTimestamp] = useState<Date | null>(null)
  const [showKey, setShowKey] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Load existing API key on component mount
  useEffect(() => {
    loadExistingKey()
  }, [])

  const loadExistingKey = () => {
    try {
      const storedKey = getFalApiKey()
      const storedTimestamp = getFalApiKeyTimestamp()
      
      if (storedKey) {
        setExistingKey(storedKey)
        if (storedTimestamp) {
          setKeyTimestamp(storedTimestamp)
        }
      }
    } catch (error) {
      console.error('Error loading API key:', error)
    }
  }



  const handleSaveApiKey = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (!validateFalApiKey(apiKey)) {
        throw new Error('Please enter a valid FAL API key')
      }

      // Store the API key securely
      setFalApiKey(apiKey)

      setExistingKey(apiKey)
      setKeyTimestamp(new Date())
      setApiKey('')
      setSuccess('API key saved successfully!')
      
      // Close dialog after a short delay
      setTimeout(() => {
        setOpen(false)
        setSuccess(null)
      }, 1500)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save API key')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteApiKey = () => {
    try {
      removeFalApiKey()
      setExistingKey(null)
      setKeyTimestamp(null)
      setSuccess('API key deleted successfully!')
      
      setTimeout(() => {
        setSuccess(null)
      }, 2000)
    } catch (error) {
      setError('Failed to delete API key')
    }
  }

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <HugeiconsIcon icon={Key01Icon} className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="!max-w-[725px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={Key01Icon} className="h-5 w-5" />
            FAL API Key Management
          </DialogTitle>
          <DialogDescription>
            Add or update your API key to use FAL AI models. Your key is stored locally in your browser.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 px-6">
          {/* Existing Key Info */}
          {existingKey && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Current API Key</Label>
                <Badge variant="secondary" className="text-xs">
                  Active
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Input
                  value={showKey ? existingKey : maskApiKey(existingKey)}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowKey(!showKey)}
                  className="h-8 px-2 text-xs"
                >
                  {showKey ? 'Hide' : 'Show'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteApiKey}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />
                </Button>
              </div>

              {keyTimestamp && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Added: {formatDate(keyTimestamp)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    💡 You can also delete this key from your <a href="https://fal.ai/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">FAL Dashboard</a> for additional security.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Add/Update Key Section */}
          <div className="space-y-3">
            <Label htmlFor="api-key" className="text-sm font-medium">
              {existingKey ? 'New API Key' : 'FAL API Key'}
            </Label>
            <Input
              id="api-key"
              type="password"
              placeholder="fal_xxxxxxxxxxxxxxxxxxxxxxxx"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="font-mono"
            />
            <div className="space-y-2">
              <Alert className="!border-red/60 bg-red/10">
                <HugeiconsIcon icon={Key01Icon} className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 text-sm">
                  <strong>Security Notice:</strong> Your API key is stored only in your browser's localStorage. 
                  Use your key responsibly and you can delete it from the FAL dashboard after use if needed.
                </AlertDescription>
              </Alert>
              <p className="text-xs text-muted-foreground">
                Get your API key from <a href="https://fal.ai/dashboard/keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">FAL Dashboard</a>
              </p>
            </div>
          </div>

          {/* Status Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription className="text-green-600">{success}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveApiKey}
            disabled={!apiKey.trim() || isLoading}
          >
            {isLoading ? 'Saving...' : existingKey ? 'Update' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


