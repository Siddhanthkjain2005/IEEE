FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN node scripts/build-cloud-run.mjs

FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8080
COPY --from=build --chown=node:node /app/dist/standalone/ ./
USER node
EXPOSE 8080
CMD ["node", "server.js"]
