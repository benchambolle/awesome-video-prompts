"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { useEffect, useState } from "react"
import { Button } from "@workspace/ui/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/ui/sidebar"
import { cn } from "@workspace/ui/lib/utils"

type IconSvgObject = any // Hugeicons icon type

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: IconSvgObject
  }[]
}) {
  const [pathname, setPathname] = useState('')
  
  useEffect(() => {
    // Get current pathname from window.location
    setPathname(window.location.pathname)
    
    // Listen for navigation changes
    const handleLocationChange = () => {
      setPathname(window.location.pathname)
    }
    
    window.addEventListener('popstate', handleLocationChange)
    return () => window.removeEventListener('popstate', handleLocationChange)
  }, [])
  
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-1 px-2 group-data-[collapsible=icon]:px-1">
        <SidebarMenu className="space-y-1 group-data-[collapsible=icon]:space-y-2">
          {items.map((item) => {
            const isActive = pathname === item.url || 
              (item.url !== '/' && pathname.startsWith(item.url))
            
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  tooltip={item.title} 
                  asChild
                  className={cn(
                    "group relative rounded-md transition-all duration-200 hover:bg-accent/80",
                    "group-data-[collapsible=icon]:rounded-md group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2",
                    isActive && "bg-primary/10 text-primary hover:bg-primary/15",
                    isActive && "group-data-[collapsible=icon]:bg-primary/15"
                  )}
                >
                  <a href={item.url} className={cn(
                    "flex items-center gap-3 px-3 py-2.5",
                    "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-2"
                  )}>
                    {item.icon && (
                      <HugeiconsIcon 
                        icon={item.icon}
                        className={cn(
                          "h-4 w-4 transition-colors flex-shrink-0",
                          "group-data-[collapsible=icon]:h-5 group-data-[collapsible=icon]:w-5",
                          isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                        )} 
                      />
                    )}
                    <span className={cn(
                      "font-medium transition-colors",
                      "group-data-[collapsible=icon]:sr-only",
                      isActive ? "text-primary" : "text-foreground"
                    )}>
                      {item.title}
                    </span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
