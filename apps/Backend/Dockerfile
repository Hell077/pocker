# -------- Stage 1: Build Go binary --------
FROM golang:1.24.2-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o server ./apps/Backend/cmd/main.go

# -------- Stage 2: Install Atlas --------
FROM alpine:latest AS atlas
RUN apk add --no-cache curl
RUN curl -sSf https://atlasgo.sh | sh -s -- -y --to /usr/local/bin

# -------- Stage 3: Final image --------
FROM alpine:latest

WORKDIR /root/

# Бинарники
COPY --from=builder /app/server .
COPY --from=atlas /usr/local/bin/atlas /usr/local/bin/atlas

# Конфигурация и миграции
COPY --from=builder /app/apps/Backend/packages/database ./database/
COPY --from=builder /app/apps/Backend/packages/atlas.hcl ./

ENV PORT=3000
EXPOSE 3000

CMD ["./server"]
