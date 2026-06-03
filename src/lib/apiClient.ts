import type { AIMode, GenerateOptions } from "@/types";

interface GenerateResponse {
  result?: string;
  error?: string;
}

// Internal fallbacks only — the store maps failures to a localized message
// before showing anything to the user (see useAppStore.submitRequest).
const GENERIC_ERROR = "Failed to generate a response.";
const NETWORK_ERROR = "Network error.";
const EMPTY_RESPONSE = "Empty AI response.";

const JSON_HEADERS: Record<string, string> = {
  "content-type": "application/json",
};

export async function generate(
  text: string,
  mode: AIMode,
  options?: GenerateOptions,
): Promise<string> {
  let response: Response;
  try {
    response = await fetch("/api/generate", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ text, mode, options }),
    });
  } catch {
    throw new Error(NETWORK_ERROR);
  }

  let data: GenerateResponse | null = null;
  try {
    data = (await response.json()) as GenerateResponse;
  } catch {
    throw new Error(GENERIC_ERROR);
  }

  if (!response.ok || !data?.result) {
    throw new Error(data?.error || GENERIC_ERROR);
  }

  return data.result;
}

export async function generateStream(
  text: string,
  mode: AIMode,
  onChunk: (chunk: string) => void,
  options?: GenerateOptions,
): Promise<string> {
  let response: Response;
  try {
    response = await fetch("/api/generate-stream", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ text, mode, options }),
    });
  } catch {
    throw new Error(NETWORK_ERROR);
  }

  if (!response.ok) {
    let message = GENERIC_ERROR;
    try {
      const data = (await response.json()) as GenerateResponse;
      if (data?.error) message = data.error;
    } catch {
      // ignore parse failures, fall back to generic message
    }
    throw new Error(message);
  }

  if (!response.body) {
    throw new Error(GENERIC_ERROR);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let full = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      if (chunk) {
        full += chunk;
        onChunk(chunk);
      }
    }
    const tail = decoder.decode();
    if (tail) {
      full += tail;
      onChunk(tail);
    }
  } finally {
    try {
      reader.releaseLock();
    } catch {
      // ignore
    }
  }

  if (!full) {
    throw new Error(EMPTY_RESPONSE);
  }

  return full;
}
