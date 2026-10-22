# syntax=docker/dockerfile:1

# ==============================================================================
# Stage 1: Dependencies
# ==============================================================================
FROM node:20-bookworm-slim AS deps
WORKDIR /app

# Install dependensi sistem yang dibutuhkan untuk build native modul (sharp/node-gyp jika ada)
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*

# Salin manifest dependensi
COPY package.json package-lock.json ./

# Install dependensi menggunakan lockfile resmi
RUN npm ci

# ==============================================================================
# Stage 2: Builder
# ==============================================================================
FROM node:20-bookworm-slim AS builder
WORKDIR /app

# Salin modul dari stage deps
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Environment placeholder untuk proses build statis Next.js
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PAYLOAD_SECRET=build_time_secret_placeholder_minimum_32_characters_long
ENV DATABASE_URI=postgresql://dummy:dummy@localhost:5432/dummy
ENV PAYLOAD_CACHE_COMPONENTS_ENABLED=true

# Jalankan typecheck dan build
RUN npm run build

# ==============================================================================
# Stage 3: Runner (Production)
# ==============================================================================
FROM node:20-bookworm-slim AS runner
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3004
ENV HOSTNAME="0.0.0.0"
ENV RAG_EMBEDDING_CACHE_DIR=/app/model-cache

# Buat grup dan user non-root demi keamanan kontainer
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Salin aset publik, konfigurasi, dan hasil build Next.js
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/src ./src
COPY --from=builder /app/scripts ./scripts
COPY --from=builder --chmod=755 /app/docker/entrypoint.sh ./docker/entrypoint.sh

# Atur kepemilikan berkas ke user non-root
RUN chown -R nextjs:nodejs /app
# Cache model tidak dibundel ke image (ukurannya besar dan bukan artefak build).
# Untuk mengaktifkan RAG, mount cache read-only ke /app/model-cache atau salin
# lewat pipeline deployment yang menyediakan artifact model.
RUN mkdir -p /app/model-cache && chown -R nextjs:nodejs /app/model-cache

USER nextjs

EXPOSE 3004

ENTRYPOINT ["/app/docker/entrypoint.sh"]
CMD ["npm", "run", "start"]
