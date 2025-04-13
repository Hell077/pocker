# ---------- STAGE 1: build Go server ----------
FROM golang:1.24.2-alpine AS builder

WORKDIR /app
COPY . .

# 👇 Путь до main.go (учитываем структуру: apps/Backend/cmd/main.go)
RUN CGO_ENABLED=0 GOOS=linux go build -o server ./apps/Backend/cmd/main.go

# ---------- STAGE 2: install Atlas CLI ----------
FROM alpine:latest AS atlas
RUN apk add --no-cache curl
# 👇 Устанавливаем Atlas напрямую в нужную папку
RUN curl -sSf https://atlasgo.sh | sh -s -- -y --to /usr/local/bin

# ---------- STAGE 3: final runtime ----------
FROM alpine:latest

WORKDIR /root/

# Бинарник Go-сервера
COPY --from=builder /app/server .

# Бинарник Atlas CLI
COPY --from=atlas /usr/local/bin/atlas /usr/local/bin/atlas

# Миграции и atlas.hcl (путь внутри builder → /app/apps/Backend/packages/...)
COPY --from=builder /app/apps/Backend/packages/database ./database/
COPY --from=builder /app/apps/Backend/packages/atlas.hcl ./

# ✅ ENV (можно убрать — если Railway передаёт DATABASE_URL через secrets)
ENV PORT=3000
EXPOSE 3000

CMD ["./server"]
