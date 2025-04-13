# ---------- STAGE 1: builder ----------
FROM golang:1.24.2-alpine AS builder

WORKDIR /app

COPY go.mod ./
COPY go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/main.go

# ---------- STAGE 2: atlas-only ----------
FROM alpine:latest AS atlas
RUN apk add --no-cache curl

RUN curl -sSf https://atlasgo.sh | sh -s -- -y --to /usr/local/bin

RUN atlas version

# ---------- STAGE 3: final ----------
FROM alpine:latest

WORKDIR /root/

# Бинарник сервера
COPY --from=builder /app/server .

# Бинарник atlas
COPY --from=atlas /usr/local/bin/atlas /usr/local/bin/atlas

# Копируем миграции и конфиг Atlas (если нужно)
COPY --from=builder /app/database ./database/
COPY --from=builder /app/atlas.hcl ./

ENV PORT=3000
EXPOSE 3000

CMD ["./server"]
