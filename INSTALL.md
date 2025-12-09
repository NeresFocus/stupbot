# 🚀 Instalação Rápida - Neres Focus Bot

## Método 1: Setup Automático (Recomendado)

### 1. Clone o repositório:
```bash
git clone https://github.com/NeresFocus/stupbot.git
cd stupbot
```

### 2. Dê permissão de execução ao script:
```bash
chmod +x start.sh
```

### 3. Execute o script:
```bash
./start.sh
```

O script vai:
- ✅ Verificar dependências (Node.js, npm)
- ✅ Instalar pacotes necessários
- ✅ Solicitar informações do bot
- ✅ Criar arquivo `.env` automaticamente
- ✅ Configurar webhook
- ✅ Testar conexão
- ✅ Iniciar o bot

### 4. Informações necessárias:
Tenha em mãos:
- 📱 **Token do Bot** (obtenha com [@BotFather](https://t.me/BotFather))
- 🌐 **URL do Backend** (ex: `https://seu-projeto.up.railway.app`)
- 💬 **Seu Chat ID** (opcional, obtenha com [@userinfobot](https://t.me/userinfobot))

---

## Método 2: Setup Manual

### 1. Clone e instale:
```bash
git clone https://github.com/NeresFocus/stupbot.git
cd stupbot/backend
npm install
```

### 2. Crie o arquivo `.env`:
```bash
cp .env.example .env
nano .env  # ou seu editor favorito
```

### 3. Configure as variáveis:
```env
TELEGRAM_TOKEN=seu_token_aqui
WEBHOOK_URL=https://seu-projeto.up.railway.app
ADMIN_CHAT_ID=seu_chat_id
```

### 4. Configure o webhook:
```bash
curl "https://api.telegram.org/bot<SEU_TOKEN>/setWebhook?url=https://seu-projeto.up.railway.app/webhook"
```

### 5. Inicie o bot:
```bash
npm start
```

---

## 🐳 Método 3: Docker (Em breve)

```bash
docker-compose up -d
```

---

## 📋 Menu do Script

Quando você executa `./start.sh`, você verá:

```
1) 🔧 Setup completo (recomendado para primeira vez)
2) 🚀 Apenas iniciar bot
3) 🔄 Reconfigurar webhook
4) 📦 Reinstalar dependências
5) ✏️  Editar .env
6) 🧪 Testar conexão
7) 🚪 Sair
```

---

## ⚠️ Resolução de Problemas

### Erro: "Node.js não encontrado"
Instale Node.js: https://nodejs.org/

### Erro: "Permission denied"
```bash
chmod +x start.sh
```

### Erro: "Webhook failed"
Verifique se a URL do backend está acessível e termina com `/webhook`

### Erro: "Token inválido"
Gere um novo token com @BotFather usando `/newbot`

---

## 🔐 Segurança

⚠️ **NUNCA** commite o arquivo `.env` no Git!  
⚠️ **REVOGUE IMEDIATAMENTE** tokens expostos publicamente  
⚠️ Use `BACKEND_NOTIFY_SECRET` para validar notificações

---

## 💡 Dicas

- Use `npm run dev` para desenvolvimento (com nodemon)
- Logs ficam em `logs/` (se configurado)
- Para parar o bot: `Ctrl+C`

---

## 📞 Suporte

Problemas? Abra uma issue: https://github.com/NeresFocus/stupbot/issues
