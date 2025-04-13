FROM golang:1.24.2-alpine AS builder

WORKDIR /app

COPY go.mod ./
COPY go.sum ./
RUN go mod download

RUN apk add --no-cache curl && \
    curl -sSf https://atlasgo.sh | sh -s -- -y && \
    cp /root/bin/atlas /usr/local/bin/atlas || cp /root/.local/bin/atlas /usr/local/bin/atlas

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/main.go

FROM alpine:latest

WORKDIR /root/
COPY --from=builder /app/server .

ENV PORT=3000
EXPOSE 3000

CMD ["./server"]
