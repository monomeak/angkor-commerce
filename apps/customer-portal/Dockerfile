# Build context is the monorepo root (needs the shared pnpm-lock.yaml/workspace).
# docker build -f apps/customer-portal/Dockerfile .

FROM node:24-alpine AS base
RUN apk add --no-cache libc6-compat && corepack enable
WORKDIR /app

# ---- Prune the monorepo down to just this app's dependency graph ----
FROM base AS pruner
COPY . .
RUN npx --yes turbo@2.10.5 prune customer-portal --docker

# ---- Install deps from the pruned lockfile only (cacheable layer) ----
FROM base AS installer
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile

# ---- Bring in pruned source and build just this app ----
FROM installer AS builder
COPY --from=pruner /app/out/full/ .
RUN pnpm turbo build --filter=customer-portal

# ---- Minimal production runtime ----
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/customer-portal/public ./apps/customer-portal/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/customer-portal/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/customer-portal/.next/static ./apps/customer-portal/.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0
CMD ["node", "apps/customer-portal/server.js"]
