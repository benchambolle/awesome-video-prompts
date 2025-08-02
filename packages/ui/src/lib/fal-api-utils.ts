/**
 * Utility functions for FAL API key management
 */

const API_KEY_STORAGE_KEY = 'fal_api_key'
const API_KEY_TIMESTAMP_KEY = 'fal_api_key_timestamp'

/**
 * Get the stored FAL API key
 * @returns The API key or null if not found
 */
export const getFalApiKey = (): string | null => {
  try {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(API_KEY_STORAGE_KEY)
  } catch {
    return null
  }
}

/**
 * Check if a FAL API key exists
 * @returns True if API key exists, false otherwise
 */
export const hasFalApiKey = (): boolean => {
  return getFalApiKey() !== null
}

/**
 * Store the FAL API key securely
 * @param apiKey The API key to store
 */
export const setFalApiKey = (apiKey: string): void => {
  try {
    if (typeof window === 'undefined') return
    localStorage.setItem(API_KEY_STORAGE_KEY, apiKey)
    localStorage.setItem(API_KEY_TIMESTAMP_KEY, new Date().toISOString())
  } catch (error) {
    console.error('Failed to store API key:', error)
    throw new Error('Failed to store API key')
  }
}

/**
 * Remove the stored FAL API key
 */
export const removeFalApiKey = (): void => {
  try {
    if (typeof window === 'undefined') return
    localStorage.removeItem(API_KEY_STORAGE_KEY)
    localStorage.removeItem(API_KEY_TIMESTAMP_KEY)
  } catch (error) {
    console.error('Failed to remove API key:', error)
    throw new Error('Failed to remove API key')
  }
}

/**
 * Get the timestamp when the API key was stored
 * @returns Date object or null if not found
 */
export const getFalApiKeyTimestamp = (): Date | null => {
  try {
    if (typeof window === 'undefined') return null
    const timestamp = localStorage.getItem(API_KEY_TIMESTAMP_KEY)
    return timestamp ? new Date(timestamp) : null
  } catch {
    return null
  }
}

/**
 * Validate if a string is a valid FAL API key format
 * @param key The key to validate
 * @returns True if valid format, false otherwise
 */
export const validateFalApiKey = (key: string): boolean => {
  // Basic validation - FAL API keys should be non-empty strings with reasonable length
  // Adjust this validation based on actual FAL API key format requirements
  return key.trim().length > 10 && key.trim().length < 200
}

/**
 * Mask an API key for display purposes
 * @param key The key to mask
 * @returns Masked key string
 */
export const maskApiKey = (key: string): string => {
  if (key.length <= 8) return key
  return key.substring(0, 4) + '•'.repeat(key.length - 8) + key.substring(key.length - 4)
}

/**
 * Create headers for FAL API requests with the stored API key
 * @returns Headers object with Authorization header if API key exists
 */
export const createFalApiHeaders = (): Record<string, string> => {
  const apiKey = getFalApiKey()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  
  if (apiKey) {
    headers['Authorization'] = `Key ${apiKey}`
  }
  
  return headers
}
