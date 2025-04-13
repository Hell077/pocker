# ---------- STAGE 1: builder ----------
FROM golang:1.24.2-alpine AS builder

WORKDIR /app

COPY go.mod ./
COPY go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/main.go

FROM alpine:latest

WORKDIR /root/

# Сервер
COPY --from=builder /app/server .

# Atlas CLI
COPY --from=atlas /usr/local/bin/atlas /usr/local/bin/atlas

COPY --from=builder /app/apps/Backend/packages/database ./database/
COPY --from=builder /app/apps/Backend/packages/atlas.hcl ./


ENV PORT=3000
EXPOSE 3000

CMD ["./server"]


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
