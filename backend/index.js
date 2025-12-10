require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const MessageHandler = require('./src/utils/messageHandler');
const AgentRouter = require('./src/modules/agentRouter');
const logger = require('./src/utils/logger');

// =======================
// CONFIGURAÇÃO
// =======================
const TOKEN = process.env.TELEGRAM_TOKEN;
const USE_WEBHOOK = process.env.USE_WEBHOOK === 'true';
const WEBHOOK_URL = process.env.WEBHOOK_URL;
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// Validação de variáveis de ambiente
if (!TOKEN) {
  logger.error('🚫 TELEGRAM_TOKEN não definido!');
  process.exit(1);
}

console.log('🤖 Iniciando Neres Focus Bot Avançado...');
console.log('Modo:', USE_WEBHOOK ? 'WEBHOOK' : 'POLLING');

// =======================
// CONEXÃO MONGODB (opcional)
// =======================
if (MONGO_URI) {
  mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => logger.success('✅ MongoDB conectado'))
    .catch(err => {
      logger.error('💥 MongoDB falhou:', err.message);
      logger.warn('⚠️  Continuando sem persistência de dados');
    });
}

// =======================
// SCHEMA DE MENSAGENS (se MongoDB estiver ativo)
// =======================
let MessageModel;
if (MONGO_URI) {
  const MessageSchema = new mongoose.Schema({
    chatId: Number,
    userId: Number,
    username: String,
    message: String,
    agent: String,
    timestamp: { type: Date, default: Date.now }
  });
  MessageModel = mongoose.model('Message', MessageSchema);
}

// =======================
// EXPRESS + SEGURANÇA
// =======================
const app = express();
app.use(helmet());
app.use(bodyParser.json());

// Rate Limiter
const limiter = rateLimit({
  windowMs: 10 * 1000, // 10 segundos
  max: 10, // 10 requisições por IP por 10s
});
app.use(limiter);

// =======================
// BOT TELEGRAM
// =======================
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

// =======================
// AGENT ROUTER STATEFUL
// =======================
const agentRouter = new AgentRouter(bot, { stateful: true });
logger.info(`🧠 Total de agentes carregados: ${agentRouter.getAllAgents().length}`);
agentRouter.listAgents();

// =======================
// HEALTH CHECK DE AGENTES
// =======================
async function checkAgentsHealth() {
  const agents = agentRouter.getAllAgents();
  for (let agent of agents) {
    try {
      const status = await agent.healthCheck?.();
      if (!status?.ok) {
        logger.warn(`⚠️  Agente ${agent.id} fora do ar`);
      }
    } catch (err) {
      logger.error(`💥 Health check falhou para ${agent.id}:`, err.message);
    }
  }
}
setInterval(checkAgentsHealth, 5 * 60 * 1000); // A cada 5 minutos

// =======================
// PAINEL - 8 MÓDULOS
// =======================
const MODULES = [
  { id: 'leads', name: '💰 Leads e Vendas', number: 1 },
  { id: 'projetos', name: '🎯 Projetos e Entregas', number: 2 },
  { id: 'operacoes', name: '⚙️  Operações & Automação', number: 3 },
  { id: 'financeiro', name: '💳 Financeiro', number: 4 },
  { id: 'marketing', name: '📊 Marketing', number: 5 },
  { id: 'clientes', name: '👥 Clientes Ativos', number: 6 },
  { id: 'documentos', name: '📄 Documentos', number: 7 },
  { id: 'ia', name: '🧠 IA & Insights', number: 8 }
];

function buildPanelKeyboard() {
  const buttons = [];
  for (let i = 0; i < MODULES.length; i += 2) {
    const row = [
      { text: MODULES[i].name, callback_data: `mod_${MODULES[i].id}` }
    ];
    if (i + 1 < MODULES.length) {
      row.push({ text: MODULES[i + 1].name, callback_data: `mod_${MODULES[i + 1].id}` });
    }
    buttons.push(row);
  }
  return { inline_keyboard: buttons };
}

// =======================
// COMANDOS TELEGRAM
// =======================
bot.setMyCommands([
  { command: 'start', description: 'Iniciar bot' },
  { command: 'painel', description: 'Abrir painel de módulos' },
  { command: 'menu', description: 'Mostrar menu principal' },
  { command: 'ideias', description: 'Ver ideias e sugestões' },
  { command: 'settings', description: 'Configurações' },
  { command: 'help', description: 'Ajuda e suporte' }
]);

// Handler de comandos
const commandHandler = async (msg, type) => {
  const chatId = msg.chat.id;
  const msgConfig = MessageHandler.get(type);
  await bot.sendMessage(chatId, msgConfig.text, { parse_mode: msgConfig.parse_mode });
};

// Registro de comandos
bot.onText(/\/start/, msg => commandHandler(msg, 'MSG_START'));
bot.onText(/\/menu/, msg => commandHandler(msg, 'MSG_MENU'));
bot.onText(/\/painel/, async (msg) => {
  const chatId = msg.chat.id;
  const msgConfig = MessageHandler.get('MSG_PAINEL');
  await bot.sendMessage(chatId, msgConfig.text, {
    parse_mode: msgConfig.parse_mode,
    reply_markup: buildPanelKeyboard()
  });
});
bot.onText(/\/ideias/, msg => commandHandler(msg, 'MSG_IDEAS'));
bot.onText(/\/enable_suggestions/, msg => commandHandler(msg, 'MSG_SUGGESTIONS_ON'));
bot.onText(/\/disable_suggestions/, msg => commandHandler(msg, 'MSG_SUGGESTIONS_OFF'));
bot.onText(/\/settings/, msg => commandHandler(msg, 'MSG_SETTINGS'));
bot.onText(/\/ajuda|^\/help/, msg => commandHandler(msg, 'MSG_HELP'));
bot.onText(/\/reset/, msg => commandHandler(msg, 'MSG_RESET'));

// =======================
// CALLBACK QUERY HANDLER
// =======================
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  await bot.answerCallbackQuery(query.id);

  if (data.startsWith('mod_')) {
    const moduleId = data.replace('mod_', '');
    const module = MODULES.find(m => m.id === moduleId);
    if (module) {
      const msg = `${module.name}\n\n🚀 *Módulo em desenvolvimento*\n\nEm breve todas as funcionalidades estarão disponíveis!`;
      await bot.sendMessage(chatId, msg, { parse_mode: 'Markdown' });
    }
  } else if (data.startsWith('custom_')) {
    await bot.sendMessage(chatId, `Callback personalizado: ${data}`);
  }
});

// =======================
// MENSAGENS LIVRES - ROTEAMENTO AGENTES
// =======================
bot.on('message', async (msg) => {
  if (!msg.text || msg.text.startsWith('/')) return;

  const chatId = msg.chat.id;
  const userId = msg.from?.id;
  const text = msg.text;

  logger.info(`Mensagem de ${chatId}: ${text}`);

  try {
    // Processar mensagem com Agent Router
    const response = await agentRouter.processMessage(msg, {
      bot,
      chatId,
      user: msg.from,
      timestamp: new Date().toISOString()
    });

    // Salvar histórico no MongoDB (se disponível)
    if (MessageModel && userId) {
      try {
        await MessageModel.create({
          chatId,
          userId,
          username: msg.from?.username,
          message: text,
          agent: response?.agentId || 'none'
        });
      } catch (dbErr) {
        logger.warn('⚠️  Erro ao salvar mensagem no MongoDB:', dbErr.message);
      }
    }

    // Responder ao usuário
    if (response?.success && response.message) {
      await bot.sendMessage(chatId, response.message, { parse_mode: 'Markdown' });
    } else if (!response?.success) {
      const errorMsg = MessageHandler.get('MSG_ERROR');
      await bot.sendMessage(chatId, errorMsg.text, { parse_mode: errorMsg.parse_mode });
    }
  } catch (error) {
    logger.error('Erro ao processar mensagem:', error);
    const errorMsg = MessageHandler.get('MSG_ERROR');
    await bot.sendMessage(chatId, errorMsg.text, { parse_mode: errorMsg.parse_mode });
  }
});

// =======================
// ROTAS EXPRESS
// =======================

// Rota principal
app.get('/', (req, res) => res.json({
  status: 'ok',
  bot: 'Neres Focus Bot Avançado',
  version: '3.0',
  uptime: process.uptime(),
  agents: agentRouter.getAllAgents().length,
  modules: MODULES.length,
  mongo: !!MONGO_URI
}));

// Health check
app.get('/health', (req, res) => res.json({
  status: 'healthy',
  uptime: process.uptime(),
  memory: process.memoryUsage(),
  agents: agentRouter.getAllAgents().length
}));

// Métricas (se MongoDB estiver ativo)
app.get('/metrics', async (req, res) => {
  if (!MessageModel) {
    return res.json({ error: 'MongoDB não está configurado' });
  }

  try {
    const totalMessages = await MessageModel.countDocuments();
    const users = await MessageModel.distinct('userId');
    const messagesPerUser = await MessageModel.aggregate([
      { $group: { _id: "$userId", count: { $sum: 1 } } }
    ]);

    res.json({
      totalMessages,
      totalUsers: users.length,
      messagesPerUser
    });
  } catch (err) {
    logger.error('Erro métricas:', err);
    res.status(500).json({ error: err.message });
  }
});

// Gerenciamento de agentes
app.get('/agents', (req, res) => res.json({
  total: agentRouter.getAllAgents().length,
  agents: agentRouter.getAllAgents(),
  stats: agentRouter.getStats()
}));

app.get('/agents/:id', (req, res) => {
  const agent = agentRouter.getAgent(req.params.id);
  agent ? res.json(agent) : res.status(404).json({ error: 'Agent not found' });
});

app.post('/agents/reload', (req, res) => {
  try {
    agentRouter.reloadAgents();
    res.json({
      ok: true,
      message: 'Agents reloaded',
      count: agentRouter.getAllAgents().length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Webhook para Telegram
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

// Deploy hook com segurança
app.post('/deploy-hook', async (req, res) => {
  try {
    const token = req.get('X-Deploy-Token');
    if (process.env.BACKEND_NOTIFY_SECRET && token !== process.env.BACKEND_NOTIFY_SECRET) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const payload = req.body;
    logger.info('Deploy recebido:', payload);

    if (payload.event === 'webapp_deployed' && process.env.ADMIN_CHAT_ID) {
      const msg = `🎉 *Deploy Concluído!*\n\n📦 ${payload.repo}\n🔗 ${payload.url}`;
      await bot.sendMessage(process.env.ADMIN_CHAT_ID, msg, { parse_mode: 'Markdown' });
    }

    res.json({ ok: true });
  } catch (err) {
    logger.error('Deploy hook error:', err);
    res.status(500).json({ error: err.message });
  }
});

// =======================
// INÍCIO DO SERVIDOR
// =======================
app.listen(PORT, () => {
  logger.success(`🤖 Servidor rodando na porta ${PORT}`);
  logger.info(`📡 Bot: ${USE_WEBHOOK ? 'Webhook mode' : 'Polling mode'}`);
  logger.info(`🔧 Painel: ${MODULES.length} módulos ativos`);
  logger.info(`🧠 Agentes: ${agentRouter.getAllAgents().length} inteligentes`);
  logger.info(`💬 Mensagens: ${Object.keys(MessageHandler.getAll()).length} customizadas`);
  logger.info(`🗄️  MongoDB: ${MONGO_URI ? 'Ativo' : 'Desativado'}`);
});

// =======================
// TRATAMENTO DE ERROS GLOBAIS
// =======================
process.on('unhandledRejection', async (err) => {
  logger.error('💥 Unhandled rejection:', err);
  if (process.env.ADMIN_CHAT_ID) {
    try {
      await bot.sendMessage(process.env.ADMIN_CHAT_ID, `💥 Unhandled rejection: ${err.message}`);
    } catch (botErr) {
      logger.error('Erro ao notificar admin:', botErr);
    }
  }
});

process.on('uncaughtException', async (err) => {
  logger.error('💥 Uncaught exception:', err);
  if (process.env.ADMIN_CHAT_ID) {
    try {
      await bot.sendMessage(process.env.ADMIN_CHAT_ID, `💥 Uncaught exception: ${err.message}`);
    } catch (botErr) {
      logger.error('Erro ao notificar admin:', botErr);
    }
  }
});
