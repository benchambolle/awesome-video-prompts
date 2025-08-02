"use client"

import { Card } from "@workspace/ui/components/ui/card"
import { Badge } from "@workspace/ui/components/ui/badge"
import { Alert, AlertDescription } from "@workspace/ui/components/ui/alert"
import { AlertCircle, X, Check } from "lucide-react"

export function LogoGuidelines() {
  return (
    <div className="space-y-8">
      <Card className="p-8 bg-background ss">
        <h2 className="text-xl font-bold mb-6">Logo Guidelines</h2>
        
        <div className="space-y-8">
          {/* Logo Concept */}
          <div>
            <h3 className="text-2xl font-semibold mb-4">Logo Concept</h3>
            <p className="text-lg text-muted-foreground">
              The Denge AI logo represents balance (Turkish: "denge") between human creativity and artificial intelligence, 
              forming a harmonious partnership in app development.
            </p>
          </div>

          {/* Animation Guidelines */}
          <div>
            <h3 className="text-2xl font-semibold mb-4">Animation & Motion Guidelines</h3>
            
            <Alert className="mb-6 border-destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-semibold">
                Strict Animation Restrictions - These rules must be followed without exception
              </AlertDescription>
            </Alert>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 border-destructive/20 bg-card shadow-none (for-testing)">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <X className="h-5 w-5 text-destructive" />
                  Prohibited Animations
                </h4>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start">
                    <Badge variant="destructive" className="mr-2 mt-0.5">NO</Badge>
                    <div>
                      <strong>Enter/Exit Animations:</strong> Components and scenes must never use enter or exit animations
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Badge variant="destructive" className="mr-2 mt-0.5">NO</Badge>
                    <div>
                      <strong>Hover Scale Effects:</strong> Never apply scale transforms on hover states
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Badge variant="destructive" className="mr-2 mt-0.5">NO</Badge>
                    <div>
                      <strong>Hover Transform Effects:</strong> Avoid all transform effects (translate, rotate, scale) on hover
                    </div>
                  </li>
                </ul>
              </Card>

              <Card className="p-6 border-green-500/20 bg-card shadow-none (for-testing)">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  Permitted Interactions
                </h4>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start">
                    <Badge className="mr-2 mt-0.5 bg-green-600">YES</Badge>
                    <div>
                      <strong>Color transitions:</strong> Smooth color changes on hover/focus (200-300ms)
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Badge className="mr-2 mt-0.5 bg-green-600">YES</Badge>
                    <div>
                      <strong>Opacity changes:</strong> Fade effects for disabled states or overlays
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Badge className="mr-2 mt-0.5 bg-green-600">YES</Badge>
                    <div>
                      <strong>Shadow adjustments:</strong> Subtle shadow changes for depth feedback
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Badge className="mr-2 mt-0.5 bg-green-600">YES</Badge>
                    <div>
                      <strong>Border modifications:</strong> Border color or width changes
                    </div>
                  </li>
                </ul>
              </Card>
            </div>
          </div>

          {/* Logo Versions */}
          <div>
            <h3 className="text-2xl font-semibold mb-4">Logo Versions</h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 bg-card shadow-none (for-testing)">
                <div className="h-32 bg-muted rounded-md mb-4 flex items-center justify-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded"></div>
                    <span className="text-xl font-bold">Denge AI</span>
                  </div>
                </div>
                <h4 className="font-semibold mb-2">Primary Logo</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Combines wordmark with icon</li>
                  <li>• Horizontal orientation preferred</li>
                  <li>• Maintains clear space equal to x-height</li>
                </ul>
              </Card>

              <Card className="p-6 bg-card shadow-none (for-testing)">
                <div className="h-32 bg-muted rounded-md mb-4 flex items-center justify-center">
                  <div className="w-16 h-16 bg-primary rounded"></div>
                </div>
                <h4 className="font-semibold mb-2">Icon Only</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Used for app icons and small spaces</li>
                  <li>• Minimum size: 24px</li>
                  <li>• Must maintain aspect ratio</li>
                </ul>
              </Card>

              <Card className="p-6 bg-card shadow-none (for-testing)">
                <div className="h-32 bg-muted rounded-md mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold">Denge AI</span>
                </div>
                <h4 className="font-semibold mb-2">Wordmark Only</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Used when icon is already present</li>
                  <li>• Never stretch or distort</li>
                  <li>• Maintain original proportions</li>
                </ul>
              </Card>
            </div>
          </div>

          {/* Logo Colors */}
          <div>
            <h3 className="text-2xl font-semibold mb-4">Logo Colors</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 bg-card shadow-none (for-testing)">
                <h4 className="font-semibold mb-3">On Light Backgrounds</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Primary</span>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded" style={{ backgroundColor: "oklch(0.2435 0 0)" }}></div>
                      <code className="text-xs">oklch(0.2435 0 0)</code>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Accent</span>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded" style={{ backgroundColor: "oklch(0.4341 0.0392 41.9938)" }}></div>
                      <code className="text-xs">oklch(0.4341 0.0392 41.9938)</code>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card shadow-none (for-testing)">
                <h4 className="font-semibold mb-3">On Dark Backgrounds</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Primary</span>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded" style={{ backgroundColor: "oklch(0.9491 0 0)" }}></div>
                      <code className="text-xs">oklch(0.9491 0 0)</code>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Accent</span>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded" style={{ backgroundColor: "oklch(0.9247 0.0524 66.1732)" }}></div>
                      <code className="text-xs">oklch(0.9247 0.0524 66.1732)</code>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Clear Space & Sizing */}
          <div>
            <h3 className="text-2xl font-semibold mb-4">Clear Space & Sizing</h3>
            
            <Card className="p-6 bg-card shadow-none (for-testing)">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Spacing Requirements</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Minimum clear space: 1x the logo height on all sides</li>
                    <li>• Never place on busy backgrounds</li>
                    <li>• Always maintain aspect ratio</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Size Guidelines</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Minimum size: 120px wide (horizontal)</li>
                    <li>• Minimum size: 32px (icon only)</li>
                    <li>• Scale proportionally</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>

          {/* Logo Don'ts */}
          <div>
            <h3 className="text-2xl font-semibold mb-4">Logo Don'ts</h3>
            
            <Card className="p-6 border-destructive/20 bg-card shadow-none (for-testing)">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  "Don't rotate or skew the logo",
                  "Don't change logo colors arbitrarily",
                  "Don't add effects (shadows, outlines)",
                  "Don't place on low-contrast backgrounds",
                  "Don't recreate or modify the logo",
                  "Don't use outdated versions"
                ].map((rule, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <X className="h-4 w-4 text-destructive flex-shrink-0" />
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  )
}
