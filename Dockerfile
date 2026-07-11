FROM oven/bun:alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* bun.lockb* ./
RUN bun install

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN bunx prisma generate

# Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

RUN bun run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 bunjs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone output
COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:bunjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:bunjs /app/.next/static ./.next/static

# We also need to copy the prisma folder to run migrations on startup
COPY --from=builder /app/prisma ./prisma

# We need prisma cli in production to run db push
RUN bun add prisma@latest

# Create an entrypoint script
RUN echo '#!/bin/sh' > /app/entrypoint.sh && \
    echo 'bunx prisma db push --accept-data-loss' >> /app/entrypoint.sh && \
    echo 'bun prisma/seed.ts || true' >> /app/entrypoint.sh && \
    echo 'bun server.js' >> /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["/app/entrypoint.sh"]
