"use client"

import { Card } from "@workspace/ui/components/ui/card"
import { Badge } from "@workspace/ui/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/ui/tabs"

export function Typography() {
  return (
    <div className="space-y-8">
      <Card className="p-8 bg-card">
        <h2 className="text-xl font-bold mb-6">Typography</h2>
        
        <Tabs defaultValue="scale" className="w-full">
          <TabsList>
            <TabsTrigger value="scale">Type Scale</TabsTrigger>
            <TabsTrigger value="fonts">Font Stack</TabsTrigger>
            <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
          </TabsList>

          {/* Type Scale */}
          <TabsContent value="scale" className="space-y-6 mt-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">Fluid Typography Scale</h3>
              
              <div className="space-y-4">
                {[
                  { name: "text-xs", size: "clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)", example: "Extra Small Text" },
                  { name: "text-sm", size: "clamp(0.875rem, 0.825rem + 0.25vw, 1rem)", example: "Small Text" },
                  { name: "text-base", size: "clamp(1rem, 0.95rem + 0.25vw, 1.125rem)", example: "Base Text" },
                  { name: "text-lg", size: "clamp(1.125rem, 1.05rem + 0.375vw, 1.25rem)", example: "Large Text" },
                  { name: "text-xl", size: "clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem)", example: "Extra Large" },
                  { name: "text-2xl", size: "clamp(1.5rem, 1.35rem + 0.75vw, 2rem)", example: "2X Large" },
                  { name: "text-3xl", size: "clamp(2rem, 1.8rem + 1vw, 2.5rem)", example: "3X Large" }
                ].map((scale) => (
                  <Card key={scale.name} className="p-6 bg-card">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <Badge variant="outline">{scale.name}</Badge>
                        <p style={{ fontSize: scale.size }} className="font-sans">
                          {scale.example}
                        </p>
                      </div>
                      <code className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded">
                        {scale.size}
                      </code>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Font Stack */}
          <TabsContent value="fonts" className="space-y-6 mt-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">Font Stack</h3>
              
              <div className="space-y-6">
                <Card className="p-6 bg-card">
                  <h4 className="font-semibold mb-3">Sans-serif (Primary)</h4>
                  <code className="block bg-muted p-4 rounded-mdtext-sm mb-4">
                    --font-sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                  </code>
                  <div className="space-y-2">
                    <p className="text-2xl font-sans">The quick brown fox jumps over the lazy dog</p>
                    <p className="text-sm text-muted-foreground">Used for all UI elements, headlines, and body text</p>
                  </div>
                </Card>

                <Card className="p-6 bg-card">
                  <h4 className="font-semibold mb-3">Monospace (Code)</h4>
                  <code className="block bg-muted p-4 rounded-mdtext-sm mb-4">
                    --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'Liberation Mono', 'Courier New', monospace;
                  </code>
                  <div className="space-y-2">
                    <p className="text-xl font-mono">const greeting = "Hello, World!";</p>
                    <p className="text-sm text-muted-foreground">Used for code blocks, technical content, and data</p>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Guidelines */}
          <TabsContent value="guidelines" className="space-y-6 mt-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">Typography Guidelines</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6 bg-card col-span-full">
                  <h4 className="font-semibold mb-3">Headlines</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Use sans-serif for all headlines</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Bold weight (700) for primary headlines</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Medium weight (500) for subheadings</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Maintain clear hierarchy</span>
                    </li>
                  </ul>
                  <div className="mt-4 p-4 bg-muted/50 rounded">
                    <h1 className="text-2xl font-bold">Main Headline</h1>
                    <h2 className="text-xl font-medium mt-2">Subheading Example</h2>
                    <h3 className="text-lg mt-2">Section Title</h3>
                  </div>
                </Card>

                <Card className="p-6 bg-card">
                  <h4 className="font-semibold mb-3">Body Text</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Regular weight (400) for body copy</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Line height: 1.5-1.7 for optimal readability</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Paragraph spacing: 1em</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Max line length: 65-75 characters</span>
                    </li>
                  </ul>
                  <div className="mt-4 p-4 bg-muted/50 rounded">
                    <p className="leading-relaxed">
                      This is an example of body text with optimal line height and spacing. Notice how the text is easy to read and flows naturally.
                    </p>
                  </div>
                </Card>

                <Card className="p-6 bg-card">
                  <h4 className="font-semibold mb-3">Code & Technical</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Monospace font for all code</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Syntax highlighting following GitHub Dark theme</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Clear contrast for readability</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Consistent indentation and spacing</span>
                    </li>
                  </ul>
                  <div className="mt-4 p-4 bg-muted/50 rounded">
                    <pre className="font-mono text-sm">
                      <code>{`function example() {
  return "Clean code";
}`}</code>
                    </pre>
                  </div>
                </Card>

                <Card className="p-6 bg-card col-span-full">
                  <h4 className="font-semibold mb-3">Best Practices</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <span className="mr-2">✅</span>
                        <span>Use system fonts for faster loading</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">✅</span>
                        <span>Implement fluid typography for responsive design</span>
                      </li>
                    </ul>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <span className="mr-2">✅</span>
                        <span>Maintain consistent spacing throughout</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">✅</span>
                        <span>Test readability on different screen sizes</span>
                      </li>
                    </ul>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
