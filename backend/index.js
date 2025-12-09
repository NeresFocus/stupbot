require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');

// Configuração
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
    .then(() => console.log('✅ Webhook configurado'))
    .catch(err => console.error('❌ Erro webhook:', err));
} else {
  bot = new TelegramBot(TOKEN, { polling: true });
  console.log('✅ Polling iniciado');
}

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
  await bot.sendMessage(chatId, 
    '👋 *Bem-vindo ao Neres Focus Bot!*\n\n' +
    'Use /painel para acessar o painel interno.\n' +
    'Use /ajuda para ver comandos disponíveis.',
    { parse_mode: 'Markdown' }
  );
});

bot.onText(/\/painel/, async (msg) => {
  const chatId = msg.chat.id;

  let message = '📊 *PAINEL CENTRAL — NERES FOCUS*\n\n';
  message += 'Escolha um módulo:\n\n';

  MODULES.forEach(m => {
    message += `${m.number}️⃣ ${m.name}\n`;
  });

  message += '\n_Clique em um módulo abaixo_';

  await bot.sendMessage(chatId, message, {
    parse_mode: 'Markdown',
    reply_markup: buildPanelKeyboard()
  });
});

bot.onText(/\/ajuda/, async (msg) => {
  const chatId = msg.chat.id;
  await bot.sendMessage(chatId,
    '🆘 *Comandos Disponíveis*\n\n' +
    '/painel - Abre o painel interno (8 módulos)\n' +
    '/ajuda - Esta mensagem\n' +
    '/status - Status do sistema\n\n' +
    '*Painel Interno:*\n' +
    '• 8 módulos disponíveis\n' +
    '• 48 ações automatizadas\n' +
    '• Integrado com IA e automações',
    { parse_mode: 'Markdown' }
  );
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
      await bot.sendMessage(chatId,
        `${module.name}\n\n` +
        '⚙️ *Módulo em desenvolvimento*\n\n' +
        'Em breve todas as funcionalidades estarão disponíveis!',
        { parse_mode: 'Markdown' }
      );
    }
  }
});

// ========================================
// ROTAS EXPRESS
// ========================================

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    bot: 'Neres Focus Bot',
    version: '2.0',
    uptime: process.uptime()
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
      console.error('Erro webhook:', err);
      res.sendStatus(500);
    }
  });
}

// Deploy hook
app.post('/deploy-hook', async (req, res) => {
  try {
    const token = req.get('X-Deploy-Token');
    if (process.env.BACKEND_NOTIFY_SECRET && token !== process.env.BACKEND_NOTIFY_SECRET) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const payload = req.body;
    console.log('Deploy recebido:', payload);

    if (payload.event === 'webapp_deployed' && process.env.ADMIN_CHAT_ID) {
      await bot.sendMessage(
        process.env.ADMIN_CHAT_ID,
        `🚀 *Deploy Concluído!*\n\n📦 ${payload.repo}\n🌐 ${payload.url}`,
        { parse_mode: 'Markdown' }
      );
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('Deploy hook error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ========================================
// START SERVER
// ========================================

app.listen(PORT, () => {
  console.log('✅ Servidor rodando na porta', PORT);
  console.log('🤖 Bot:', USE_WEBHOOK ? 'Webhook mode' : 'Polling mode');
  console.log('📊 Painel: 8 módulos ativos');
});

// Tratamento de erros
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught exception:', err);
});
