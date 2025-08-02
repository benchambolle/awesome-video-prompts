export interface PromptSource {
  type: 'custom' | 'base' | 'model';
  id: string;
  name: string;
  url?: string;
  displayName?: string;
}

export function getSourceDisplayName(source: PromptSource): string {
  return source.displayName || source.name || 'Unknown Source';
}

export function getSourceUrl(source: PromptSource): string | undefined {
  return source.url;
} 