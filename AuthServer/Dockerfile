FROM oven/bun:latest AS builder

WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install

COPY . .

FROM oven/bun:latest

WORKDIR /app

COPY --from=builder /app /app

EXPOSE 3000

CMD ["bun", "run", "index.ts"]
