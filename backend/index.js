require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const MessageHandler = require('./src/utils/messageHandler');
const AgentRouter = require('./src/modules/agentRouter');
const logger = require('./src/utils/logger');

const TOKEN = process.env.TELEGRAM_TOKEN;
const USE_WEBHOOK = process.env.USE_WEBHOOK === 'true';
const WEBHOOK_URL = process.env.WEBHOOK_URL;
const PORT = process.env.PORT || 3000;

console.log('🚀 Iniciando Neres Focus Bot...');
console.log('Modo:', USE_WEBHOOK ? 'WEBHOOK' : 'POLLING');

// Express
const app = express();
app.use(bodyParser.json());

// Bot
let bot;
if (USE_WEBHOOK) {
  bot = new TelegramBot(TOKEN);
  bot.setWebHook(`${WEBHOOK_URL}/webhook`)
    .then(() => logger.success('Webhook configurado'))
    .catch(err => logger.error('Erro webhook:', err));
} else {
  bot = new TelegramBot(TOKEN, { polling: true });
  logger.success('Polling iniciado');
}

// Inicializa roteador de agentes
const agentRouter = new AgentRouter(bot);

// ========================================
// PAINEL - 8 MÓDULOS
// ========================================

const MODULES = [
  { id: 'leads', name: '🔹 Leads e Vendas', number: 1 },
  { id: 'projetos', name: '📁 Projetos e Entregas', number: 2 },
  { id: 'operacoes', name: '🤖 Operações & Automação', number: 3 },
  { id: 'financeiro', name: '💰 Financeiro', number: 4 },
  { id: 'marketing', name: '📢 Marketing', number: 5 },
  { id: 'clientes', name: '👤 Clientes Ativos', number: 6 },
  { id: 'documentos', name: '📑 Documentos', number: 7 },
  { id: 'ia', name: '🧠 IA & Insights', number: 8 }
];

function buildPanelKeyboard() {
  const buttons = [];

  for (let i = 0; i < MODULES.length; i += 2) {
    const row = [];
    row.push({
      text: MODULES[i].name,
      callback_data: `mod_${MODULES[i].id}`
    });

    if (i + 1 < MODULES.length) {
      row.push({
        text: MODULES[i + 1].name,
        callback_data: `mod_${MODULES[i + 1].id}`
      });
    }

    buttons.push(row);
  }

  return { inline_keyboard: buttons };
}

// ========================================
// COMANDOS
// ========================================

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const msgConfig = MessageHandler.get('MSG_START');
  await bot.sendMessage(chatId, msgConfig.text, { parse_mode: msgConfig.parse_mode });
});

bot.onText(/\/menu/, async (msg) => {
  const chatId = msg.chat.id;
  const msgConfig = MessageHandler.get('MSG_MENU');
  await bot.sendMessage(chatId, msgConfig.text, { parse_mode: msgConfig.parse_mode });
});

bot.onText(/\/painel/, async (msg) => {
  const chatId = msg.chat.id;
  const msgConfig = MessageHandler.get('MSG_PANEL');
  await bot.sendMessage(chatId, msgConfig.text, {
    parse_mode: msgConfig.parse_mode,
    reply_markup: buildPanelKeyboard()
  });
});

bot.onText(/\/ideas/, async (msg) => {
  const chatId = msg.chat.id;
  const msgConfig = MessageHandler.get('MSG_IDEAS');
  await bot.sendMessage(chatId, msgConfig.text, { parse_mode: msgConfig.parse_mode });
});

bot.onText(/\/enable_suggestions/, async (msg) => {
  const chatId = msg.chat.id;
  const msgConfig = MessageHandler.get('MSG_SUGGESTIONS_ON');
  await bot.sendMessage(chatId, msgConfig.text, { parse_mode: msgConfig.parse_mode });
});

bot.onText(/\/disable_suggestions/, async (msg) => {
  const chatId = msg.chat.id;
  const msgConfig = MessageHandler.get('MSG_SUGGESTIONS_OFF');
  await bot.sendMessage(chatId, msgConfig.text, { parse_mode: msgConfig.parse_mode });
});

bot.onText(/\/settings/, async (msg) => {
  const chatId = msg.chat.id;
  const msgConfig = MessageHandler.get('MSG_SETTINGS');
  await bot.sendMessage(chatId, msgConfig.text, { parse_mode: msgConfig.parse_mode });
});

bot.onText(/\/ajuda|^\/help/, async (msg) => {
  const chatId = msg.chat.id;
  const msgConfig = MessageHandler.get('MSG_HELP');
  await bot.sendMessage(chatId, msgConfig.text, { parse_mode: msgConfig.parse_mode });
});

bot.onText(/\/reset/, async (msg) => {
  const chatId = msg.chat.id;
  const msgConfig = MessageHandler.get('MSG_RESET');
  await bot.sendMessage(chatId, msgConfig.text, { parse_mode: msgConfig.parse_mode });
});

// ========================================
// CALLBACK QUERIES (Botões)
// ========================================

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  await bot.answerCallbackQuery(query.id);

  if (data.startsWith('mod_')) {
    const moduleId = data.replace('mod_', '');
    const module = MODULES.find(m => m.id === moduleId);

    if (module) {
      const msg = `${module.name}\n\n⚙️ *Módulo em desenvolvimento*\n\nEm breve todas as funcionalidades estarão disponíveis!`;
      await bot.sendMessage(chatId, msg, { parse_mode: 'Markdown' });
    }
  }
});

// ========================================
// MENSAGENS LIVRES (Roteamento de Agentes)
// ========================================

bot.on('message', async (msg) => {
  if (!msg.text || msg.text.startsWith('/')) return;

  const chatId = msg.chat.id;
  const text = msg.text;

  logger.info(`Mensagem de ${chatId}: ${text}`);

  // Roteia para agente apropriado
  await agentRouter.routeMessage(chatId, text);
});

// ========================================
// ROTAS EXPRESS
// ========================================

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    bot: 'Neres Focus Bot',
    version: '2.0',
    uptime: process.uptime(),
    messages: 18,
    agents: 5,
    modules: 8
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

if (USE_WEBHOOK) {
  app.post('/webhook', (req, res) => {
    try {
      bot.processUpdate(req.body);
      res.sendStatus(200);
    } catch (err) {
      logger.error('Erro webhook:', err);
      res.sendStatus(500);
    }
  });
}

app.post('/deploy-hook', async (req, res) => {
  try {
    const token = req.get('X-Deploy-Token');
    if (process.env.BACKEND_NOTIFY_SECRET && token !== process.env.BACKEND_NOTIFY_SECRET) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const payload = req.body;
    logger.info('Deploy recebido:', payload);

    if (payload.event === 'webapp_deployed' && process.env.ADMIN_CHAT_ID) {
      const msg = `🚀 *Deploy Concluído!*\n\n📦 ${payload.repo}\n🌐 ${payload.url}`;
      await bot.sendMessage(process.env.ADMIN_CHAT_ID, msg, { parse_mode: 'Markdown' });
    }

    res.json({ ok: true });
  } catch (err) {
    logger.error('Deploy hook error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ========================================
// START SERVER
// ========================================

app.listen(PORT, () => {
  logger.success(`✅ Servidor rodando na porta ${PORT}`);
  logger.info(`🤖 Bot: ${USE_WEBHOOK ? 'Webhook mode' : 'Polling mode'}`);
  logger.info('📊 Painel: 8 módulos ativos');
  logger.info('🧠 Agentes: 5 inteligentes');
  logger.info('📝 Mensagens: 18 customizadas');
});

// Tratamento de erros
process.on('unhandledRejection', (err) => {
  logger.error('❌ Unhandled rejection:', err);
});

process.on('uncaughtException', (err) => {
  logger.error('❌ Uncaught exception:', err);
});
