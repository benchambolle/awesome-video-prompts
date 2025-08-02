"use client"

import * as React from "react"
import { Heart } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/ui/button"
import { useToast } from "@workspace/ui/hooks/use-toast"

interface FavoriteButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'onToggle'> {
  itemId: string
  itemType?: string
  onToggle?: (isFavorite: boolean) => void
  storageKey?: string
  showToast?: boolean
  fillWhenActive?: boolean
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

/**
 * FavoriteButton component that manages favorites in localStorage
 * 
 * @param itemId - Unique identifier for the item to favorite
 * @param itemType - Optional type/category of the item (e.g., "model", "image")
 * @param onToggle - Optional callback when favorite state changes
 * @param storageKey - Custom localStorage key (defaults to "favorites")
 * @param showToast - Whether to show toast notifications
 * @param fillWhenActive - Whether to fill the heart icon when favorited
 */
export function FavoriteButton({
  itemId,
  itemType = "item",
  onToggle,
  storageKey = "favorites",
  showToast = true,
  fillWhenActive = true,
  className,
  variant = "ghost",
  size = "icon",
  ...props
}: FavoriteButtonProps) {
  const { toast } = useToast()
  const [isFavorite, setIsFavorite] = React.useState(false)
  const [isAnimating, setIsAnimating] = React.useState(false)

  // Load initial state from localStorage
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const favorites = JSON.parse(stored) as string[]
        setIsFavorite(favorites.includes(itemId))
      }
    } catch (error) {
      console.error("Error loading favorites:", error)
    }
  }, [itemId, storageKey])

  // Save to localStorage
  const saveFavorites = React.useCallback((favorites: string[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(favorites))
    } catch (error) {
      console.error("Error saving favorites:", error)
      if (showToast) {
        toast({
          title: "Error",
          description: "Failed to save favorite. Please try again.",
          variant: "destructive"
        })
      }
    }
  }, [storageKey, showToast, toast])

  // Toggle favorite state
  const toggleFavorite = React.useCallback(() => {
    setIsAnimating(true)
    
    try {
      const stored = localStorage.getItem(storageKey)
      const favorites = stored ? JSON.parse(stored) as string[] : []
      
      let newFavorites: string[]
      let newState: boolean
      
      if (favorites.includes(itemId)) {
        // Remove from favorites
        newFavorites = favorites.filter(id => id !== itemId)
        newState = false
      } else {
        // Add to favorites
        newFavorites = [...favorites, itemId]
        newState = true
      }
      
      saveFavorites(newFavorites)
      setIsFavorite(newState)
      onToggle?.(newState)
      
      if (showToast) {
        toast({
          title: newState ? "Added to favorites" : "Removed from favorites",
          description: newState 
            ? `${itemType} has been added to your favorites.`
            : `${itemType} has been removed from your favorites.`
        })
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
      if (showToast) {
        toast({
          title: "Error",
          description: "Failed to update favorite. Please try again.",
          variant: "destructive"
        })
      }
    }
    
    // Remove animation class after animation completes
    setTimeout(() => setIsAnimating(false), 300)
  }, [itemId, itemType, storageKey, saveFavorites, onToggle, showToast, toast])

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        "group relative",
        isAnimating && "animate-in zoom-in-95 duration-300",
        className
      )}
      onClick={toggleFavorite}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={isFavorite}
      {...props}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-all",
          isFavorite && fillWhenActive && "fill-current",
          isFavorite ? "text-red-500" : "text-muted-foreground",
          "group-hover:scale-110"
        )}
      />
    </Button>
  )
}

// Hook to get all favorites
export function useFavorites(storageKey = "favorites") {
  const [favorites, setFavorites] = React.useState<string[]>([])

  React.useEffect(() => {
    const loadFavorites = () => {
      try {
        const stored = localStorage.getItem(storageKey)
        if (stored) {
          setFavorites(JSON.parse(stored) as string[])
        }
      } catch (error) {
        console.error("Error loading favorites:", error)
      }
    }

    // Load initial favorites
    loadFavorites()

    // Listen for storage changes (from other tabs/windows)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey) {
        loadFavorites()
      }
    }

    window.addEventListener("storage", handleStorageChange)
    
    // Also listen for custom events within the same tab
    const handleCustomEvent = () => loadFavorites()
    window.addEventListener(`${storageKey}-updated`, handleCustomEvent)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener(`${storageKey}-updated`, handleCustomEvent)
    }
  }, [storageKey])

  return favorites
}
