# 🤖 Backend - Neres Focus Bot

## 📦 Estrutura

```
backend/
├── index.js           # Servidor principal
├── config.json        # Configurações
├── package.json       # Dependências
└── src/
    ├── bot.js        # Classe do bot
    └── utils/
        ├── logger.js
        └── keyboardBuilder.js
```

## 🚀 Instalação

```bash
cd backend
npm install
cp .env.example .env
# Configure o .env
npm start
```

## 🔧 Variáveis de Ambiente

- `TELEGRAM_TOKEN` - Token do bot
- `USE_WEBHOOK` - true/false
- `WEBHOOK_URL` - URL do backend
- `PORT` - Porta (padrão: 3000)
- `ADMIN_CHAT_ID` - Seu chat ID
- `BACKEND_NOTIFY_SECRET` - Token de segurança

## 📝 Desenvolvimento

```bash
npm run dev  # Com nodemon
```

## 🐳 Docker

```bash
docker-compose up
```
