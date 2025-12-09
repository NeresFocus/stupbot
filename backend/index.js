/**
 * Neres Focus Bot - Backend (Node.js)
 * index.js - Express + node-telegram-bot-api
 */

require('dotenv').config();
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');

const CONFIG = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

const TOKEN = process.env.TELEGRAM_TOKEN;
if (!TOKEN) {
  console.error('❌ ERRO: Defina a variável TELEGRAM_TOKEN no .env');
  process.exit(1);
}

const USE_WEBHOOK = (process.env.USE_WEBHOOK === 'true');
const WEBHOOK_URL = process.env.WEBHOOK_URL || '';
const PORT = process.env.PORT || 3000;

const app = express();
app.use(bodyParser.json());

let bot;

// ========================================
// INICIALIZAÇÃO DO BOT
// ========================================

if (USE_WEBHOOK) {
  bot = new TelegramBot(TOKEN, { webHook: { port: PORT }});
  const hookUrl = `${WEBHOOK_URL}/webhook`;
  bot.setWebHook(hookUrl).then(() => {
    console.log('✅ Webhook configurado:', hookUrl);
  }).catch(err => {
    console.error('❌ Erro ao setar webhook:', err.message);
  });

  app.post('/webhook', (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  });
} else {
  bot = new TelegramBot(TOKEN, { polling: true });
  console.log('🔄 Bot rodando em polling mode');
}

// ========================================
// FUNÇÕES UTILITÁRIAS
// ========================================

async function registerCommands() {
  try {
    const commands = [];
    const cmdMap = CONFIG.commands || {};
    for (const [cmd, desc] of Object.entries(cmdMap)) {
      const name = cmd.startsWith('/') ? cmd.slice(1) : cmd;
      commands.push({ command: name, description: desc });
    }
    await bot.setMyCommands(commands);
    console.log('✅ Comandos registrados:', commands.map(c => c.command).join(', '));
  } catch (err) {
    console.error('❌ Erro ao registrar comandos:', err.message);
  }
}

function buildPanelKeyboard() {
  const modules = CONFIG.panel.modules || [];
  const keyboard = modules.map(module => ([{
    text: module.name,
    callback_data: `module:${module.id}`
  }]));
  keyboard.push([{ text: '🤖 Ativar Sugestões', callback_data: 'action:enable_suggestions' }]);
  keyboard.push([{ text: '⚙️ Configurações', callback_data: 'open:settings' }]);
  return { reply_markup: { inline_keyboard: keyboard } };
}

// ========================================
// HANDLERS DO BOT
// ========================================

async function handleStart(msg, startParam) {
  const chatId = msg.chat.id;
  if (!startParam) {
    await bot.sendMessage(chatId, CONFIG.onboarding.welcome_message, {
      reply_markup: {
        keyboard: [
          ['/panel', '/ideas', '/help'],
          ['/enable_suggestions', '/settings']
        ],
        resize_keyboard: true,
        one_time_keyboard: false
      }
    });
    return;
  }

  if (startParam === 'panel' || startParam === 'panel_suggestions') {
    await bot.sendMessage(chatId, CONFIG.panel.title || 'Painel', buildPanelKeyboard());
    if (startParam === 'panel_suggestions') {
      await bot.sendMessage(chatId, '🔮 Sugestões Inteligentes ativadas!');
    }
    return;
  }

  await bot.sendMessage(chatId, `Payload: ${startParam}. Use /help para instruções.`);
}

// ========================================
// CALLBACK QUERIES (BOTÕES INLINE)
// ========================================

bot.on('callback_query', async (callbackQuery) => {
  const data = callbackQuery.data;
  const chatId = callbackQuery.message.chat.id;

  try {
    if (data.startsWith('module:')) {
      const moduleId = data.split(':')[1];
      const module = (CONFIG.panel.modules || []).find(m => m.id === moduleId);
      if (!module) {
        await bot.answerCallbackQuery(callbackQuery.id, { text: 'Módulo não encontrado.' });
        return;
      }
      const actionsText = module.actions.map((a, i) => `${i+1}. ${a}`).join('\n');
      await bot.sendMessage(chatId, `📁 ${module.name}\n\nAções:\n${actionsText}`);
      await bot.answerCallbackQuery(callbackQuery.id);
      return;
    }

    if (data === 'action:enable_suggestions') {
      await bot.sendMessage(chatId, '🔮 Sugestões Inteligentes ativadas!');
      await bot.answerCallbackQuery(callbackQuery.id, { text: 'Sugestões ativadas' });
      return;
    }

    if (data === 'open:settings') {
      await bot.sendMessage(chatId, '⚙️ Configurações. Envie /settings para editar.');
      await bot.answerCallbackQuery(callbackQuery.id);
      return;
    }

    await bot.answerCallbackQuery(callbackQuery.id, { text: 'Ação executada.' });
  } catch (err) {
    console.error('❌ Erro no callback_query:', err);
  }
});

// ========================================
// MENSAGENS DE TEXTO (COMANDOS)
// ========================================

bot.on('message', async (msg) => {
  if (!msg.text) return;

  const chatId = msg.chat.id;
  const text = msg.text.trim();

  if (text.startsWith('/start')) {
    const parts = text.split(' ');
    const payload = parts.length > 1 ? parts[1] : null;
    await handleStart(msg, payload);
    return;
  }

  switch (text.toLowerCase()) {
    case '/panel':
    case '/painel':
      await bot.sendMessage(chatId, CONFIG.panel.title || 'Painel', buildPanelKeyboard());
      return;

    case '/help':
    case '/ajuda':
      await bot.sendMessage(chatId,
        `🆘 Ajuda:\nUse /panel para abrir o painel.\nUse /ideas para gerar ideias.\nUse /enable_suggestions para ativar sugestões.`
      );
      return;

    case '/enable_suggestions':
      await bot.sendMessage(chatId, '🔮 Sugestões Inteligentes ativadas!');
      return;

    case '/ideas':
      await bot.sendMessage(chatId, `Aqui vão 3 ideias rápidas de conteúdo:\n1) Post sobre dor do cliente\n2) Case de sucesso\n3) CTA oferecendo diagnóstico`);
      return;

    case '/reset':
      await bot.sendMessage(chatId, '⚠️ Configurações reiniciadas para o padrão.');
      return;

    default:
      if (/sugest/i.test(text) || /sugira/i.test(text)) {
        await bot.sendMessage(chatId, '🔎 Gerando sugestões...\n1) Post sobre dor do cliente\n2) Case de sucesso\n3) CTA oferecendo diagnóstico');
        return;
      }

      await bot.sendMessage(chatId, `Recebi: "${text}". Use /help para ver comandos.`);
      return;
  }
});

// ========================================
// ENDPOINT PARA NOTIFICAÇÕES DE DEPLOY
// ========================================

app.post('/deploy-hook', async (req, res) => {
  try {
    const token = req.get('X-Deploy-Token');
    const expectedToken = process.env.BACKEND_NOTIFY_SECRET;

    if (expectedToken && token !== expectedToken) {
      console.warn('⚠️ Deploy hook: Token inválido');
      return res.status(401).json({ error: 'Token inválido' });
    }

    const payload = req.body;
    console.log('✅ Deploy hook recebido:', JSON.stringify(payload, null, 2));

    // Notificar admin via Telegram
    if (payload.event === 'webapp_deployed' && process.env.ADMIN_CHAT_ID) {
      const message = `🚀 *Deploy Concluído!*\n\n` +
        `📦 Repositório: ${payload.repo}\n` +
        `🌐 URL: ${payload.url}\n` +
        `👤 Por: ${payload.actor}\n` +
        `🕐 ${payload.timestamp}`;

      try {
        await bot.sendMessage(process.env.ADMIN_CHAT_ID, message, { parse_mode: 'Markdown' });
      } catch (err) {
        console.error('❌ Erro ao enviar notificação Telegram:', err.message);
      }
    }

    res.json({ 
      ok: true, 
      received: payload.event,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('❌ Erro no deploy-hook:', err);
    res.status(500).json({ error: err.message });
  }
});

// ========================================
// ENDPOINTS EXPRESS
// ========================================

app.get('/', (req, res) => res.send('🤖 Neres Focus Bot Backend — OK'));
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

app.post('/admin/send', async (req, res) => {
  const { chatId, text } = req.body;
  if (!chatId || !text) return res.status(400).json({ error: 'chatId e text são obrigatórios' });
  try {
    await bot.sendMessage(chatId, text);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================================
// INICIALIZAÇÃO
// ========================================

registerCommands();

app.listen(PORT, () => {
  console.log(`✅ Express rodando na porta ${PORT}`);
  console.log(`🤖 Bot iniciado em modo: ${USE_WEBHOOK ? 'WEBHOOK' : 'POLLING'}`);
});
