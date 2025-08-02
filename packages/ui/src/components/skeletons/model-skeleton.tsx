import { Skeleton } from "../ui/skeleton"

export function ModelSkeleton() {
  return (
    <div data-slot="card" className="bg-background border rounded-xl border-border text-card-foreground flex flex-col gap-4 hover:border-primary/40 transition-shadow overflow-hidden cursor-pointer group p-0">
      <div data-slot="card-content" className="p-0">
        <div className="aspect-video bg-foreground/10 relative flex items-center justify-center">
          <Skeleton className="w-16 h-16" />
          <div className="absolute top-3 right-3">
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <Skeleton className="h-6 w-48 mb-1" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-4" />
          <div className="pt-4 border-t">
            <div className="flex items-center justify-center">
              <Skeleton className="h-4 w-4 mr-2" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ModelsPageSkeleton() {
  return (
    <main className="flex-1 flex flex-col min-h-0 overflow-auto">
      <div className="flex-1 p-0 bg-background">
        <div className="min-h-screen bg-muted/30">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 p-6 border-b border-border/50 bg-gradient-to-r from-background via-background to-background/95 backdrop-blur-sm transition-all duration-200">
            <div className="flex items-start gap-4 min-w-0 flex-1">
              <div className="flex-shrink-0 w-12 h-12 border font-medium flex items-center justify-center backdrop-blur-sm transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:shadow-sm border-blue text-blue bg-blue/10 shadow-[inset_0_1px_2px_rgba(59,130,246,0.15)]">
                <Skeleton className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <Skeleton className="h-8 w-48 mb-1" />
                <Skeleton className="h-5 w-96" />
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="space-y-6 p-6">
            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="relative">
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="flex flex-wrap gap-4">
                <Skeleton className="h-9 w-32" />
                <Skeleton className="h-9 w-32" />
              </div>
            </div>
            
            {/* Results Count */}
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-5 w-40" />
            </div>
            
            {/* Models Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <ModelSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export function ModelsGridSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <ModelSkeleton key={i} />
      ))}
    </div>
  )
}
