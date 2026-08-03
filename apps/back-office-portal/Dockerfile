# Build context is the monorepo root (needs the shared pnpm-lock.yaml/workspace).
# docker build -f apps/back-office-portal/Dockerfile .

FROM node:24-alpine AS base
RUN apk add --no-cache libc6-compat && corepack enable
WORKDIR /app

# ---- Prune the monorepo down to just this app's dependency graph ----
FROM base AS pruner
COPY . .
RUN npx --yes turbo@2.10.5 prune back-office-portal --docker

# ---- Install deps from the pruned lockfile only (cacheable layer) ----
FROM base AS installer
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile

# ---- Bring in pruned source and build just this app ----
FROM installer AS builder
COPY --from=pruner /app/out/full/ .
# NEXT_PUBLIC_* vars are inlined at build time, so this must be a build ARG,
# not just a runtime env var passed to the container.
ARG NEXT_PUBLIC_API_BASE_URL=https://dummyjson.com
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
RUN pnpm turbo build --filter=back-office-portal

# ---- Minimal production runtime ----
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/back-office-portal/public ./apps/back-office-portal/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/back-office-portal/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/back-office-portal/.next/static ./apps/back-office-portal/.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0
CMD ["node", "apps/back-office-portal/server.js"]
