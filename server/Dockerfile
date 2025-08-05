# WebSocket Voice Server Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile --prod

# Copy server files
COPY server/live-server.ts ./server/
COPY tsconfig.json ./

# Install tsx for TypeScript execution
RUN pnpm add tsx

# Expose WebSocket port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const ws = require('ws'); const client = new ws('ws://localhost:3001'); client.on('open', () => { client.close(); process.exit(0); }); client.on('error', () => process.exit(1));"

# Start server
CMD ["pnpm", "run", "dev:local-ws"]