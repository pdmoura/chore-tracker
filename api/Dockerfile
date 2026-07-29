FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm install --global npm@11.9.0 \
  && npm ci

COPY nest-cli.json tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm run build

FROM node:24-alpine AS runtime

ENV NODE_ENV=production
WORKDIR /app

COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/dist ./dist

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=5 \
  CMD node -e "fetch('http://localhost:3000/health').then((response) => { if (!response.ok) process.exit(1); }).catch(() => process.exit(1))"

CMD ["sh", "-c", "npm run db:migrate && node dist/prisma/seed.js && exec node dist/src/main.js"]
