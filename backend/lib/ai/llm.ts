/**
 * Local LLM Adapter - Ollama Integration
 * Runtime: LOCAL ONLY (http://localhost:11434)
 * NEVER use cloud APIs in this file
 */

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const OLLAMA_PRIMARY_MODEL = process.env.OLLAMA_PRIMARY_MODEL || 'llama3.3:70b';
const REQUEST_TIMEOUT = 60000; // 60 seconds

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  message: {
    role: string;
    content: string;
  };
  done: boolean;
  model: string;
}

/**
 * Send chat completion request to local Ollama instance
 * @throws Error if Ollama is not running or request fails
 */
export async function chatCompletion(
  request: ChatCompletionRequest
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: request.model || OLLAMA_PRIMARY_MODEL,
        messages: request.messages,
        stream: false,
        options: {
          temperature: request.temperature || 0.7,
          num_predict: request.max_tokens || 2000,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(
        `Ollama API error: ${response.status} ${response.statusText}`
      );
    }

    const data: ChatCompletionResponse = await response.json();
    return data.message.content;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(
        `Ollama request timeout after ${REQUEST_TIMEOUT / 1000}s. Is Ollama running?`
      );
    }
    throw new Error(
      `Ollama connection failed: ${error instanceof Error ? error.message : 'Unknown error'}. Verify Ollama is running at ${OLLAMA_HOST}`
    );
  }
}

/**
 * Check if Ollama service is healthy
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
