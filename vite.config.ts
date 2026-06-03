import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

const apiDevPlugin = (env: Record<string, string>): Plugin => ({
  name: "smartnote-api-dev",
  configureServer(server) {
    for (const [key, value] of Object.entries(env)) {
      if (process.env[key] === undefined) process.env[key] = value;
    }

    server.middlewares.use(async (req, res, next) => {
      if (!req.url) return next();
      const path = req.url.split("?")[0];
      const modulePath =
        path === "/api/generate"
          ? "/api/generate.ts"
          : path === "/api/generate-stream"
            ? "/api/generate-stream.ts"
            : null;
      if (!modulePath) return next();

      try {
        const chunks: Buffer[] = [];
        for await (const chunk of req) {
          chunks.push(chunk as Buffer);
        }
        const rawBody = Buffer.concat(chunks).toString("utf-8");

        const headers = new Headers();
        for (const [key, value] of Object.entries(req.headers)) {
          if (typeof value === "string") headers.set(key, value);
          else if (Array.isArray(value)) headers.set(key, value.join(","));
        }

        const request = new Request(`http://localhost${req.url}`, {
          method: req.method,
          headers,
          body:
            req.method && req.method !== "GET" && req.method !== "HEAD"
              ? rawBody
              : undefined,
        });

        const mod = await server.ssrLoadModule(modulePath);
        const handler = mod.default as (req: Request) => Promise<Response>;
        const response = await handler(request);

        res.statusCode = response.status;
        response.headers.forEach((value, key) => res.setHeader(key, value));

        if (!response.body) {
          res.end();
          return;
        }

        const reader = response.body.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(Buffer.from(value));
          }
        } finally {
          try {
            reader.releaseLock();
          } catch {
            // ignore
          }
          res.end();
        }
      } catch (err) {
        console.error("[api-dev] handler failed:", err);
        if (!res.headersSent) {
          res.statusCode = 500;
          res.setHeader("content-type", "application/json");
          res.end(JSON.stringify({ error: "Dev API handler failed." }));
        } else {
          res.end();
        }
      }
    });
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), apiDevPlugin(env)],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
