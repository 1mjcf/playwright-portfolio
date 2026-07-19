# Small production image: install only runtime deps, run as non-root.
FROM node:22-alpine

ENV NODE_ENV=production
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 3000
USER node

HEALTHCHECK --interval=10s --timeout=3s --retries=5 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "server.js"]
