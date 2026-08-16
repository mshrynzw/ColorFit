export class ColorFitApiError extends Error {
  readonly code: string
  readonly status: number
  readonly requestId?: string

  constructor(code: string, message: string, status: number, requestId?: string) {
    super(message)
    this.name = 'ColorFitApiError'
    this.code = code
    this.status = status
    this.requestId = requestId
  }
}

const NETWORK_MESSAGE =
  '通信に失敗しました。時間をおいて再度お試しください。'

function apiBaseUrl(): string {
  const base = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'
  return base.replace(/\/$/, '')
}

async function readApiError(response: Response): Promise<ColorFitApiError> {
  try {
    const body = (await response.json()) as {
      error?: { code?: string; message?: string; requestId?: string }
    }
    if (body.error?.code && body.error.message) {
      return new ColorFitApiError(
        body.error.code,
        body.error.message,
        response.status,
        body.error.requestId,
      )
    }
  } catch {
    // Fall through to a generic message. Do not expose raw body text.
  }

  return new ColorFitApiError('INTERNAL_SERVER_ERROR', NETWORK_MESSAGE, response.status)
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  let response: Response
  try {
    response = await fetch(`${apiBaseUrl()}${path}`, init)
  } catch {
    throw new ColorFitApiError('NETWORK_ERROR', NETWORK_MESSAGE, 0)
  }

  if (!response.ok) {
    throw await readApiError(response)
  }

  return response
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ColorFitApiError) {
    return error.message
  }
  return NETWORK_MESSAGE
}
