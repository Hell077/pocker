FROM node:23-alpine3.20 AS builder

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build


FROM node:23-alpine3.20

WORKDIR /app
RUN npm install -g serve

COPY --from=builder /app/dist ./dist

ENV PORT=5173
EXPOSE 5173

CMD ["serve", "-s", "dist", "-l", "5173"]
