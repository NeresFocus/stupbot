# 🤖 Neres Focus Bot - stupbot

Backend Node.js + WebApp para Telegram do **Neres Focus Bot** - Assistente inteligente para estratégia, conteúdo, automação e otimização de negócios.

[![Deploy to GitHub Pages](https://github.com/NeresFocus/stupbot/actions/workflows/deploy-webapp.yml/badge.svg)](https://github.com/NeresFocus/stupbot/actions/workflows/deploy-webapp.yml)

## 📁 Estrutura do Projeto

```
/
├── backend/          # Backend Node.js (Express + node-telegram-bot-api)
│   ├── package.json
│   ├── index.js
│   ├── config.json
│   └── .env.example
├── webapp/           # WebApp estático para Telegram
│   ├── index.html
│   ├── app.js
│   ├── style.css
│   └── pages/        # 35+ páginas internas
├── .github/
│   └── workflows/
│       └── deploy-webapp.yml  # Deploy automático
└── README.md
```

## 🚀 Deploy Rápido

### 1️⃣ Backend (Railway/Render)

```bash
cd backend
npm install
```

Crie `.env` com:
```env
TELEGRAM_TOKEN=seu_token_aqui
USE_WEBHOOK=true
WEBHOOK_URL=https://seu-projeto.up.railway.app
PORT=3000
WEBAPP_URL=https://neresfocus.github.io/stupbot
ADMIN_CHAT_ID=seu_chat_id
BACKEND_NOTIFY_SECRET=Nq7OzYl39QuxRG8sSBZiyIUHMkC5HrvPbBKW3ce94elMkfe3shdtRSv7c7ugDG0A
```

**Configure o webhook:**
```bash
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://seu-projeto.up.railway.app/webhook"
```

### 2️⃣ WebApp (GitHub Pages) - Deploy 100% Automático!

**⚙️ Configure os Secrets do Repositório:**

1. Vá em: `Settings → Secrets and variables → Actions`
2. Adicione:
   - `BACKEND_NOTIFY_URL`: URL do backend (ex: `https://seu-projeto.up.railway.app`)
   - `BACKEND_NOTIFY_SECRET`: `Nq7OzYl39QuxRG8sSBZiyIUHMkC5HrvPbBKW3ce94elMkfe3shdtRSv7c7ugDG0A`
   - `WEBAPP_PUBLIC_URL` (opcional): URL customizada

**📄 Ative o GitHub Pages:**

1. Vá em: `Settings → Pages`
2. Source: **GitHub Actions**
3. Pronto! Qualquer push em `webapp/**` dispara deploy automático

### 3️⃣ Configure o Menu do Bot

No @BotFather:
```
/setmenubutton
@seu_bot
button_name: 📊 Abrir Painel
web_app_url: https://neresfocus.github.io/stupbot/
```

## 🔄 Como Funciona

1. **Push** em `webapp/**` → GitHub Actions
2. **Build** e deploy no GitHub Pages
3. **Notificação HTTP POST** enviada ao backend
4. **Backend** notifica admin via Telegram

### 📦 Payload da Notificação

```json
{
  "event": "webapp_deployed",
  "url": "https://neresfocus.github.io/stupbot/",
  "ref": "refs/heads/main",
  "repo": "NeresFocus/stupbot",
  "commit": "abc123...",
  "actor": "NeresFocus",
  "timestamp": "2025-12-09T20:00:00Z"
}
```

## 🔐 Segurança

⚠️ **IMPORTANTE:**
- **NUNCA** commite o arquivo `.env`
- Use `BACKEND_NOTIFY_SECRET` para validar notificações
- **Revogue imediatamente** tokens expostos e gere novos

## 📝 Comandos do Bot

- `/start` - Inicia o bot e mostra onboarding
- `/panel` - Abre o painel completo
- `/ideas` - Gera ideias rápidas
- `/help` - Mostra ajuda
- `/enable_suggestions` - Ativa sugestões inteligentes
- `/settings` - Abre configurações

## 🛠️ Desenvolvimento Local

### Backend
```bash
cd backend
npm install
npm run dev
```

### WebApp
```bash
cd webapp
python -m http.server 8000
```

## 📄 Licença

MIT

## 👤 Autor

**Neres Focus**  
GitHub: [@NeresFocus](https://github.com/NeresFocus)

---

💡 **Precisa de ajuda?** Abra uma issue!
