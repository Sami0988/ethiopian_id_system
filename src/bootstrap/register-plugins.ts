import { NestFastifyApplication } from "@nestjs/platform-fastify";
import fastifyHelmet from "@fastify/helmet";
import fastifyCompress from "@fastify/compress";
import fastifyCors from "@fastify/cors";
import fastifyCookie from "@fastify/cookie";
import { createAjv } from "@/common/validation/ajv.config";

export async function registerPlugins(app: NestFastifyApplication) {
  const fastify = app.getHttpAdapter().getInstance();

  // Security headers - disable CSP for Swagger docs
  await app.register(fastifyHelmet, { contentSecurityPolicy: false });

  // Compression
  await app.register(fastifyCompress, { encodings: ["gzip", "deflate"] });

  /**
   * CORS
   * - Primary source: env CORS_ORIGIN (comma-separated)
   * - Fallback: hard-coded origins below (your provided list)
   * - If env is "*" or empty: reflect origin (required for credentials)
   */
  const FALLBACK_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:9093",
    "https://dev.walialink.com",
    "https://dev.admin.walialink.com",
    "https://dev.api.walialink.com",
  ];

  const corsOriginEnv = (process.env.CORS_ORIGIN || "").trim();

  const allowAll = corsOriginEnv === "*";
  const originsFromEnv =
    corsOriginEnv && corsOriginEnv !== "*"
      ? corsOriginEnv
          .split(",")
          .map((o) => o.trim())
          .filter(Boolean)
      : [];

  // If env is empty, we use fallback list; if env provided, we use env list
  const originsList =
    originsFromEnv.length > 0 ? originsFromEnv : FALLBACK_ORIGINS;

  // Normalize (remove trailing slash)
  const allowlist = new Set(originsList.map((o) => o.replace(/\/$/, "")));

  await app.register(fastifyCors, {
    origin: (origin, cb) => {
      // allow server-to-server / curl / health checks
      if (!origin) return cb(null, true);

      const cleanOrigin = origin.replace(/\/$/, "");

      // If env is "*": reflect the request origin string (NOT boolean true)
      if (allowAll) return cb(null, cleanOrigin);

      // Allow exact matches
      if (allowlist.has(cleanOrigin)) return cb(null, cleanOrigin);

      // Optional: allow any walialink.com subdomain
      if (/^https:\/\/([a-z0-9-]+\.)*walialink\.com$/i.test(cleanOrigin)) {
        return cb(null, cleanOrigin);
      }

      return cb(null, false);
    },

    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    // NOTE: Do NOT include "Cookie" here; browsers don't allow it as a CORS request header.
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "X-Admin-Secret",
    ],

    exposedHeaders: ["Content-Range", "X-Content-Range"],
    maxAge: 86400,

    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Cookie support
  await app.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET || "some-secret",
  });

  // ✅ AJV global setup
  const ajv = createAjv();
  fastify.setValidatorCompiler(({ schema }) => ajv.compile(schema));
}
