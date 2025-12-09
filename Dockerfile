# ------------------------
# ETAPA 1 — Build Node
# ------------------------
FROM node:18 AS builder
WORKDIR /app
COPY backend ./backend
RUN cd backend && npm install

# ------------------------
# ETAPA 2 — Imagem final
# ------------------------
FROM node:18
WORKDIR /app
COPY --from=builder /app/backend ./backend
CMD ["node", "backend/index.js"]
