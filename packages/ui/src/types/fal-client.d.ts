declare module "@fal-ai/client" {
  export interface FalQueueUpdate {
    status: string
    logs?: Array<{ message: string }>
  }

  export interface FalResponse {
    data: {
      output: string
    }
    requestId: string
  }

  export interface FalStreamResult {
    output: string
  }

  export interface FalStream {
    done: () => Promise<FalStreamResult>
    [Symbol.asyncIterator]: () => AsyncIterator<any>
  }

  export interface FalClient {
    config: (options: { credentials: string }) => void
    subscribe: (endpoint: string, options: {
      input: any
      logs?: boolean
      onQueueUpdate?: (update: FalQueueUpdate) => void
    }) => Promise<FalResponse>
    stream: (endpoint: string, options: {
      input: any
    }) => Promise<FalStream>
  }

  export const fal: FalClient
}
