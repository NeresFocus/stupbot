# 🔧 GUIA DE TROUBLESHOOTING

## Problema: Bot não responde

### PASSO 1: Testar conexão básica

No terminal do Railway (ou local):

```bash
cd backend
node test-bot.js
```

Isso vai mostrar se o bot consegue conectar com o Telegram.

### PASSO 2: Verificar Webhook

Acesse:
```
https://api.telegram.org/botSEU_TOKEN/getWebhookInfo
```

**Se `url` estiver vazia:**
```bash
curl "https://api.telegram.org/botSEU_TOKEN/setWebhook?url=https://stupbot-production.up.railway.app/webhook"
```

### PASSO 3: Verificar Logs

Railway → View Logs

Procure por:
- ✅ "Servidor porta 3000"
- ✅ "Webhook configurado"
- ❌ Erros em vermelho

### PASSO 4: Testar Backend

Acesse:
```
https://stupbot-production.up.railway.app/health
```

Deve retornar JSON com status "healthy"

### PASSO 5: Modo Polling (Teste)

Temporariamente, no Railway Variables:
```
USE_WEBHOOK=false
```

Redeploy e teste se bot responde.

Se responder em polling mas não em webhook, o problema é o webhook!

## Soluções Comuns

### Bot responde em polling mas não em webhook
- Configure webhook: setWebhook
- Verifique WEBHOOK_URL está correto
- Certifique-se que Railway está acessível

### Bot não responde nem em polling
- Token está errado
- Token foi revogado
- Verificar variável TELEGRAM_TOKEN

### Backend não inicia
- Verificar logs do Railway
- Erro de sintaxe no código
- Dependências faltando

### Webhook retorna erro
- URL incorreta
- Backend não acessível
- Certificado SSL (Railway cuida disso)

## Contato

Se nenhuma solução funcionar, verifique:
1. Logs completos do Railway
2. getWebhookInfo retorno completo
3. Variáveis de ambiente
