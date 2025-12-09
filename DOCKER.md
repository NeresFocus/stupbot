# 🐳 Guia Docker - Neres Focus Bot

Este guia explica como usar Docker para rodar o Neres Focus Bot localmente ou em produção.

## 🚀 Início Rápido

### 1. Clone o repositório:
```bash
git clone https://github.com/NeresFocus/stupbot.git
cd stupbot
```

### 2. Configure as variáveis:
```bash
cp backend/.env.example backend/.env
nano backend/.env  # Configure suas variáveis
```

### 3. Build e execute:
```bash
docker-compose up -d
```

Pronto! O bot está rodando em `http://localhost:3000`

---

## 📦 Comandos Docker

### Build da imagem:
```bash
docker build -t neres-focus-bot .
```

### Executar container:
```bash
docker run -d \
  --name neres-focus-bot \
  -p 3000:3000 \
  --env-file backend/.env \
  neres-focus-bot
```

### Ver logs:
```bash
docker logs -f neres-focus-bot
```

### Parar container:
```bash
docker stop neres-focus-bot
```

### Remover container:
```bash
docker rm neres-focus-bot
```

---

## 🔧 Docker Compose

### Iniciar serviços:
```bash
docker-compose up -d
```

### Parar serviços:
```bash
docker-compose down
```

### Ver logs:
```bash
docker-compose logs -f bot
```

### Rebuild:
```bash
docker-compose up -d --build
```

### Ver status:
```bash
docker-compose ps
```

---

## 🌐 Deploy em Produção

### Railway:
1. Conecte o repositório ao Railway
2. Railway detecta automaticamente o Dockerfile
3. Configure as variáveis de ambiente
4. Deploy automático!

### Render:
1. New → Web Service
2. Selecione Docker
3. Configure variáveis
4. Deploy

### Fly.io:
```bash
fly launch
fly deploy
```

---

## 🔐 Variáveis de Ambiente

Certifique-se de configurar no `backend/.env`:

```env
TELEGRAM_TOKEN=seu_token_aqui
USE_WEBHOOK=true
WEBHOOK_URL=https://seu-dominio.com
PORT=3000
ADMIN_CHAT_ID=seu_chat_id
BACKEND_NOTIFY_SECRET=Nq7OzYl39QuxRG8sSBZiyIUHMkC5HrvPbBKW3ce94elMkfe3shdtRSv7c7ugDG0A
```

---

## 📊 Monitoramento

### Verificar saúde do container:
```bash
docker exec neres-focus-bot curl http://localhost:3000/health
```

### Ver uso de recursos:
```bash
docker stats neres-focus-bot
```

---

## 🐛 Troubleshooting

### Container não inicia:
```bash
docker logs neres-focus-bot
```

### Variáveis não carregam:
Verifique se o arquivo `.env` existe e está correto:
```bash
cat backend/.env
```

### Porta já em uso:
Mude a porta no `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Host:Container
```

---

## 🔄 Desenvolvimento com Hot Reload

Para desenvolvimento com auto-reload:

1. Modifique `docker-compose.yml`:
```yaml
command: npm run dev  # Requer nodemon
```

2. Inicie:
```bash
docker-compose up
```

Agora o bot recarrega automaticamente ao salvar arquivos!

---

## 📁 Estrutura da Imagem

```
/app/
└── backend/
    ├── index.js
    ├── config.json
    ├── package.json
    └── node_modules/
```

Imagem final: ~150MB (otimizada com multi-stage build)

---

## 🆘 Suporte

Problemas? Abra uma issue: https://github.com/NeresFocus/stupbot/issues
