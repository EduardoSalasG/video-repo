# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Install build tools for native deps (bcrypt, prisma engines)
RUN apk add --no-cache python3 make g++ ffmpeg

COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN npm ci

COPY backend ./backend
WORKDIR /app/backend
ENV DATABASE_URL=postgresql://build:build@localhost:5432/video_repo
RUN npx prisma generate

RUN npm run build

# ---- Runtime stage ----
FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache ffmpeg tini
ENV NODE_ENV=production

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/backend/prisma ./prisma
COPY --from=build /app/backend/prisma.config.ts ./prisma.config.ts
COPY --from=build /app/backend/dist ./dist

EXPOSE 3000
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/index.js"]
