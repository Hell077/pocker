# ---------- Stage 1: build Go server ----------
FROM golang:1.24.2-alpine AS builder

WORKDIR /app
COPY . .

RUN go mod download
RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/main.go

# ---------- Stage 2: install Atlas ----------
FROM alpine:latest AS atlas
RUN apk add --no-cache curl
RUN curl -sSf https://atlasgo.sh | sh -s -- -y --to /usr/local/bin

# ---------- Stage 3: final image ----------
FROM alpine:latest

WORKDIR /root/

# Бинарники
COPY --from=builder /app/server .
COPY --from=atlas /usr/local/bin/atlas /usr/local/bin/atlas

# Конфиг и миграции (всё уже в /app/packages/... )
COPY --from=builder /app/packages/database ./database/
COPY --from=builder /app/packages/atlas.hcl ./

ENV PORT=3000
EXPOSE 3000

CMD ["./server"]
