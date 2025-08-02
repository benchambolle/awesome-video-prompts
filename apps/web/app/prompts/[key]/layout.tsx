import fs from 'fs'
import path from 'path'

export async function generateStaticParams() {
  try {
    const filePath = path.join(process.cwd(), 'public/data/custom-prompts.json')
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const data = JSON.parse(fileContents)
    
    return data.prompts.map((prompt: any) => ({
      key: prompt.id
    }))
  } catch (error) {
    console.error('Failed to generate static params:', error)
    return []
  }
}

export default function PromptLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
