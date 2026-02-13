FROM node:24.7-alpine AS build

WORKDIR /app
RUN corepack enable

# Build-time public envs for Next.js
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_GOOGLE_OAUTH_URL
ARG NEXT_PUBLIC_FILE_URL
ARG NEXT_PUBLIC_TWITCH_CHANNEL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_GOOGLE_OAUTH_URL=$NEXT_PUBLIC_GOOGLE_OAUTH_URL
ENV NEXT_PUBLIC_FILE_URL=$NEXT_PUBLIC_FILE_URL
ENV NEXT_PUBLIC_TWITCH_CHANNEL=$NEXT_PUBLIC_TWITCH_CHANNEL

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

FROM node:24.7-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.ts ./next.config.ts

EXPOSE 3000
CMD ["pnpm", "run", "start"]
