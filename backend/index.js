require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const logger = require('./src/utils/logger');
const PanelManager = require('./src/modules/panelManager');

const TOKEN = process.env.TELEGRAM_TOKEN;
const USE_WEBHOOK = process.env.USE_WEBHOOK === 'true';
const WEBHOOK_URL = process.env.WEBHOOK_URL;
const PORT = process.env.PORT || 3000;

const app = express();
app.use(bodyParser.json());

// Inicializa bot
let bot;
if (USE_WEBHOOK) {
  bot = new TelegramBot(TOKEN, { webHook: { port: PORT } });
  bot.setWebHook(`${WEBHOOK_URL}/webhook`);
  logger.success('Webhook configurado');
} else {
  bot = new TelegramBot(TOKEN, { polling: true });
  logger.success('Polling iniciado');
}

// Inicializa PanelManager
const panelManager = new PanelManager(bot);

// Comandos
bot.onText(/\/painel/, async (msg) => {
  const chatId = msg.chat.id;

  if (!panelManager.isAuthorized(chatId)) {
    return bot.sendMessage(chatId, '❌ Acesso não autorizado');
  }

  await panelManager.showMainPanel(chatId);
});

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  await bot.sendMessage(chatId, `
👋 *Bem-vindo ao Neres Focus Bot!*

Use /painel para acessar o painel interno.
Use /ajuda para ver comandos disponíveis.
  `, { parse_mode: 'Markdown' });
});

bot.onText(/\/ajuda/, async (msg) => {
  const chatId = msg.chat.id;
  await bot.sendMessage(chatId, `
🆘 *Comandos Disponíveis*

/painel - Abre o painel interno
/status - Status do sistema
/ajuda - Esta mensagem

*Painel Interno:*
8 módulos disponíveis
48 ações automatizadas
Integrado com IA e automações
  `, { parse_mode: 'Markdown' });
});

// Callback queries (botões)
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  await bot.answerCallbackQuery(query.id);

  if (data === 'panel_main') {
    await panelManager.showMainPanel(chatId);
  } else if (data.startsWith('panel_module_')) {
    const moduleId = data.replace('panel_module_', '');
    await panelManager.showModule(chatId, moduleId);
  } else if (data.startsWith('action_')) {
    const parts = data.split('_');
    const moduleId = parts[1];
    const actionId = parts[2];
    await panelManager.executeAction(chatId, moduleId, actionId);
  }
});

// Routes
app.get('/', (req, res) => res.json({ status: 'ok', bot: 'Neres Focus Bot' }));
app.get('/health', (req, res) => res.json({ status: 'healthy', uptime: process.uptime() }));

if (USE_WEBHOOK) {
  app.post('/webhook', (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  });
}

app.post('/deploy-hook', async (req, res) => {
  try {
    const token = req.get('X-Deploy-Token');
    if (process.env.BACKEND_NOTIFY_SECRET && token !== process.env.BACKEND_NOTIFY_SECRET) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const payload = req.body;
    logger.info('Deploy received:', payload);

    if (payload.event === 'webapp_deployed' && process.env.ADMIN_CHAT_ID) {
      const msg = `🚀 Deploy Concluído!\n📦 ${payload.repo}\n🌐 ${payload.url}`;
      await bot.sendMessage(process.env.ADMIN_CHAT_ID, msg);
    }

    res.json({ ok: true });
  } catch (err) {
    logger.error('Deploy hook error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  logger.success(`✅ Servidor porta ${PORT}`);
  logger.info(`🤖 Modo: ${USE_WEBHOOK ? 'WEBHOOK' : 'POLLING'}`);
  logger.info('📊 Painel interno: /painel');
});
