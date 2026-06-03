export const SECURITY_HEADERS: Record<string, string> = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-frame-options": "DENY",
  "permissions-policy":
    "camera=(), microphone=(), geolocation=(), payment=()",
  "cache-control": "no-store",
};

export const STREAM_SECURITY_HEADERS: Record<string, string> = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-frame-options": "DENY",
  "permissions-policy":
    "camera=(), microphone=(), geolocation=(), payment=()",
};

export const MAX_BODY_BYTES = 64 * 1024;
export const MAX_INPUT_LENGTH = 12000;
// Gentle in-memory IP-based demo limit. A UX nudge only — not durable across
// serverless instances.
export const ANONYMOUS_DAILY_LIMIT = 10;
export const UPSTREAM_TIMEOUT_MS = 25_000;

export const json = (data: unknown, status: number): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", ...SECURITY_HEADERS },
  });

export const checkBodySize = (request: Request): Response | null => {
  const lenHeader = request.headers.get("content-length");
  if (lenHeader) {
    const len = Number.parseInt(lenHeader, 10);
    if (Number.isFinite(len) && len > MAX_BODY_BYTES) {
      return json({ error: "Тело запроса слишком большое." }, 413);
    }
  }
  return null;
};

export const getClientIp = (request: Request): string => {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("cf-connecting-ip") ??
    "unknown"
  );
};

interface IpUsage {
  date: string;
  count: number;
}

const ipUsageStore: Map<string, IpUsage> = (() => {
  const g = globalThis as unknown as {
    __SMARTNOTE_IP_USAGE__?: Map<string, IpUsage>;
  };
  if (!g.__SMARTNOTE_IP_USAGE__) {
    g.__SMARTNOTE_IP_USAGE__ = new Map<string, IpUsage>();
  }
  return g.__SMARTNOTE_IP_USAGE__;
})();

const todayString = (): string => {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export interface RateLimitOk {
  ok: true;
  remaining: number;
  commit: () => void;
}
export interface RateLimitDenied {
  ok: false;
  response: Response;
}
export type RateLimitResult = RateLimitOk | RateLimitDenied;

export const checkRateLimitWithLimit = (
  request: Request,
  limit: number,
): RateLimitResult => {
  const ip = getClientIp(request);
  const today = todayString();
  const current = ipUsageStore.get(ip);
  const count = current && current.date === today ? current.count : 0;

  return rateLimitFromCounter(ip, today, count, limit);
};

const rateLimitFromCounter = (
  ip: string,
  today: string,
  count: number,
  limit: number,
): RateLimitResult => {
  if (count >= limit) {
    return {
      ok: false,
      response: json(
        {
          error:
            "Достигнут дневной лимит запросов. Пожалуйста, попробуйте завтра.",
        },
        429,
      ),
    };
  }

  return {
    ok: true,
    remaining: limit - count - 1,
    commit: () => {
      const fresh = ipUsageStore.get(ip);
      const baseCount =
        fresh && fresh.date === today ? fresh.count : 0;
      ipUsageStore.set(ip, { date: today, count: baseCount + 1 });
    },
  };
};

export const fetchWithTimeout = async (
  url: string,
  init: RequestInit,
  timeoutMs: number = UPSTREAM_TIMEOUT_MS,
): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

export const isValidMode = (
  value: unknown,
): value is
  | "summary"
  | "rewrite"
  | "keyPoints"
  | "quiz"
  | "outline"
  | "copyPolish" =>
  value === "summary" ||
  value === "rewrite" ||
  value === "keyPoints" ||
  value === "quiz" ||
  value === "outline" ||
  value === "copyPolish";
