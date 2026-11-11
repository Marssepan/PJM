/**
 * PJM Dictionary — Express API server
 * -----------------------------------------------------------------------------
 * Local, offline backend for the PJM (Polish Sign Language) learning app.
 *
 * Endpoints:
 *   GET /api/health                 → liveness + DB check
 *   GET /api/categories             → all categories with their signs
 *   GET /api/signs/search?q=...     → case- and accent-insensitive search (PostgreSQL unaccent)
 *   GET /api/alphabet               → PJM fingerspelling alphabet (Polish order)
 *   GET /videos/<file>.mp4          → static video files (HTTP Range supported)
 *
 * Security middleware:
 *   helmet               → secure HTTP headers (CORP disabled so the Vite app can load .mp4 files)
 *   express-rate-limit   → 200 requests / 15 min per IP on /api/* (videos and /api/health exempt)
 *
 * Run:  npm run dev (tsx watch, auto-restart)   ·   production: Vercel (imports the default export)
 *
 * Prisma models:
 *   Category { id (uuid), name @unique, slug @unique, signs Sign[] }
 *   Sign     { id (uuid), name, description?, video_url, category_id, category Category }
 *   Alphabet { id (uuid), letter @unique, video_url, requiresMovement }
 */

import path from 'path';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit, type Options as RateLimitOptions } from 'express-rate-limit';
import { Prisma, PrismaClient } from '@prisma/client';

// -----------------------------------------------------------------------------
// Config
// -----------------------------------------------------------------------------
const PORT = Number(process.env.PORT) || 3001;

/** Vite dev server origin. Comma-separated list allowed, e.g. "http://localhost:5173,http://127.0.0.1:5173". */
const CORS_ORIGINS = (process.env.CORS_ORIGIN ?? 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((o) => o.trim());

/**
 * Number of reverse proxies in front of the app (nginx, Caddy, load balancer).
 * Needed so the rate limiter sees the real client IP from X-Forwarded-For.
 * 0 = direct connections (local / no proxy). Never set higher than the real proxy count.
 */
const TRUST_PROXY_HOPS = Number(process.env.TRUST_PROXY ?? 0);

/** Rate limiting for /api/* */
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 200; // requests per window per IP

/** Search guard rails. */
const SEARCH_MIN_LENGTH = 1;
const SEARCH_MAX_LENGTH = 100;
const SEARCH_RESULT_LIMIT = 50;

// -----------------------------------------------------------------------------
// Prisma client (single shared instance)
// -----------------------------------------------------------------------------
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'production' ? ['error'] : ['warn', 'error'],
});

/** Polish collation: A < Ą < B < C < Ć < ... < Ł < ... < Ź < Ż — independent of DB collation. */
const plCollator = new Intl.Collator('pl', { sensitivity: 'base' });

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
type ErrorBody = { error: string; details?: string };

class HttpError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'HttpError';
  }
}

// -----------------------------------------------------------------------------
// App + middleware
// -----------------------------------------------------------------------------
const app = express();

app.disable('x-powered-by'); // helmet removes it too — kept explicit
if (TRUST_PROXY_HOPS > 0) app.set('trust proxy', TRUST_PROXY_HOPS);

/**
 * 1. Helmet — security headers (HSTS, X-Content-Type-Options, X-Frame-Options,
 *    Referrer-Policy, CSP, COOP, ...).
 *    crossOriginResourcePolicy: false — the default `same-origin` would make the browser
 *    refuse to load /videos/*.mp4 from the Vite app, which runs on a different origin.
 *    (COEP is already off by default in Helmet ≥ 7.)
 */
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);

/** 2. CORS — only the frontend origin(s) may call the API from a browser. */
app.use(cors({ origin: CORS_ORIGINS }));

/** 3. Body parser — small limit, the API only receives tiny JSON payloads (if any). */
app.use(express.json({ limit: '10kb' }));

/**
 * 4. Rate limiting — /api/* only.
 *    Static videos are NOT limited: one <video> makes several Range requests while seeking.
 *    Health check is skipped so monitoring cannot lock itself (or users) out.
 */
const rateLimitMessage: ErrorBody = { error: 'Przekroczono limit zapytań. Spróbuj ponownie za chwilę.' };

const apiLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  limit: RATE_LIMIT_MAX,
  standardHeaders: 'draft-7', // RateLimit + RateLimit-Policy headers
  legacyHeaders: false, // no X-RateLimit-* headers
  skip: (req: Request) => req.path === '/health', // path is relative to the /api mount point
  handler: (_req: Request, res: Response, _next: NextFunction, options: RateLimitOptions) => {
    res.status(options.statusCode).json(rateLimitMessage); // 429 Too Many Requests
  },
});

app.use('/api', apiLimiter);

/**
 * Static video files (local development).
 * In production the frontend loads videos from GitHub Pages instead (VITE_VIDEO_URL),
 * so the free, sleeping backend never has to stream .mp4 files.
 * express.static supports HTTP Range requests out of the box → <video> seeking works.
 * VIDEOS_DIR overrides the folder (absolute or relative to the working directory).
 */
const VIDEOS_DIR = process.env.VIDEOS_DIR
  ? path.resolve(process.env.VIDEOS_DIR)
  : path.join(__dirname, 'public/videos');

app.use(
  '/videos',
  express.static(VIDEOS_DIR, {
    maxAge: '1d',
    fallthrough: false, // missing file → 404 via error handler, not the API 404
  }),
);

// -----------------------------------------------------------------------------
// Routes
// -----------------------------------------------------------------------------

/** GET /api/health — quick check that the server and database are reachable. */
app.get('/api/health', async (_req: Request, res: Response<{ status: string } | ErrorBody>) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok' });
  } catch (err) {
    console.error('[GET /api/health]', err);
    res.status(503).json({ error: 'Database unavailable' });
  }
});

/** GET /api/categories — all categories, each with its signs (both sorted by name). */
app.get('/api/categories', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        signs: { orderBy: { name: 'asc' } },
      },
    });
    res.json(categories);
  } catch (err) {
    next(err);
  }
});

/** Row shape returned by the raw search query. */
type SignSearchRow = {
  id: string; // UUID
  name: string;
  description: string | null;
  video_url: string;
  category_id: string; // UUID
  category: { id: string; name: string; slug: string };
  rank: number;
};

/** Escape LIKE wildcards so user input is matched literally ("50%" ≠ "anything"). */
const escapeLike = (value: string): string => value.replace(/[\\%_]/g, (ch) => `\\${ch}`);

/**
 * GET /api/signs/search?q=... — case- AND accent-insensitive match on name OR description.
 *   "zolw" → "Żółw", "LOZKO" → "Łóżko", "kon" → "Koń".
 * Uses PostgreSQL `unaccent` (enabled via schema.prisma → extensions = [unaccent]).
 * Ranking: name starts with query (0) → name contains (1) → description only (2), then Polish A–Ż.
 * $queryRaw with a tagged template = parameterised query → safe from SQL injection.
 */
app.get(
  '/api/signs/search',
  async (req: Request<unknown, unknown, unknown, { q?: string | string[] }>, res: Response, next: NextFunction) => {
    try {
      const raw = Array.isArray(req.query.q) ? req.query.q[0] : req.query.q;
      const q = (raw ?? '').trim();

      if (q.length < SEARCH_MIN_LENGTH) {
        throw new HttpError(400, 'Query parameter "q" is required.');
      }
      if (q.length > SEARCH_MAX_LENGTH) {
        throw new HttpError(400, `Query parameter "q" must be at most ${SEARCH_MAX_LENGTH} characters.`);
      }

      const term = escapeLike(q);
      const contains = `%${term}%`;
      const startsWith = `${term}%`;

      // Prisma default table names ("Sign", "Category") — schema has no @@map.
      const rows = await prisma.$queryRaw<SignSearchRow[]>`
        SELECT
          s.id,
          s.name,
          s.description,
          s.video_url,
          s.category_id,
          json_build_object('id', c.id, 'name', c.name, 'slug', c.slug) AS category,
          (CASE
            WHEN unaccent(s.name) ILIKE unaccent(${startsWith}) THEN 0
            WHEN unaccent(s.name) ILIKE unaccent(${contains}) THEN 1
            ELSE 2
          END)::int AS rank
        FROM "Sign" s
        JOIN "Category" c ON c.id = s.category_id
        WHERE unaccent(s.name) ILIKE unaccent(${contains})
           OR unaccent(COALESCE(s.description, '')) ILIKE unaccent(${contains})
        ORDER BY rank, s.name
        LIMIT ${SEARCH_RESULT_LIMIT}
      `;

      // Final ordering with Polish collation (DB collation may not be pl_PL).
      rows.sort((a, b) => a.rank - b.rank || plCollator.compare(a.name, b.name));

      res.json(rows.map(({ rank: _rank, ...sign }) => sign));
    } catch (err) {
      next(err);
    }
  },
);

/** GET /api/alphabet — all letters in Polish alphabetical order. */
app.get('/api/alphabet', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const letters = await prisma.alphabet.findMany();
    // Sorted in JS: DB default collation (en_US.utf8) does not guarantee Polish order.
    letters.sort((a, b) => plCollator.compare(a.letter, b.letter));
    res.json(letters);
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------------------------------------------
// 404 + central error handler
// -----------------------------------------------------------------------------
app.use((req: Request, res: Response<ErrorBody>) => {
  res.status(404).json({ error: `Not found: ${req.method} ${req.originalUrl}` });
});

// Express recognises error middleware by its 4 arguments — keep `_next`.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, req: Request, res: Response<ErrorBody>, _next: NextFunction) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  // express.static with fallthrough:false → missing video file
  if (typeof err === 'object' && err !== null && 'status' in err && (err as { status: number }).status === 404) {
    res.status(404).json({ error: `File not found: ${req.originalUrl}` });
    return;
  }

  if (err instanceof Prisma.PrismaClientInitializationError) {
    console.error('[DB connection]', err.message);
    res.status(503).json({ error: 'Database unavailable. Is the Docker container running?' });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    console.error(`[Prisma ${err.code}]`, err.message);
    res.status(500).json({ error: 'Database query failed', details: err.code });
    return;
  }

  console.error(`[${req.method} ${req.originalUrl}]`, err);
  res.status(500).json({ error: 'Internal server error' });
});

// -----------------------------------------------------------------------------
// Start + graceful shutdown
// -----------------------------------------------------------------------------
async function main(): Promise<void> {
  await prisma.$connect(); // fail fast if PostgreSQL is not reachable
  const server = app.listen(PORT, () => {
    console.log(`PJM API ready on http://localhost:${PORT}`);
    console.log(`Videos served from ${VIDEOS_DIR}`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    console.log(`\n${signal} received — shutting down…`);
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

/**
 * Vercel imports `app` and runs it as a serverless function (no listen(), no signals).
 * Everywhere else (local dev) we start a normal HTTP server.
 */
export default app;

if (!process.env.VERCEL) {
  main().catch(async (err) => {
    console.error('Failed to start server:', err);
    await prisma.$disconnect();
    process.exit(1);
  });
}
