require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const logger = require('./src/utils/logger');
const sheets = require('./src/integrations/sheets');
const templates = require('./src/config/templates.json');

const TOKEN = process.env.TELEGRAM_TOKEN;
const USE_WEBHOOK = process.env.USE_WEBHOOK === 'true';
const WEBHOOK_URL = process.env.WEBHOOK_URL;
const PORT = process.env.PORT || 3000;

console.log('🚀 Iniciando Neres Focus Bot v2.1...');

const app = express();
app.use(bodyParser.json());

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
// MÓDULOS PRINCIPAIS
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

// ========================================
// SESSÕES DE USUÁRIO (Para wizard)
// ========================================

const userSessions = new Map();

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
// COMANDOS PRINCIPAIS
// ========================================

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  await bot.sendMessage(chatId, 
    '👋 *Bem-vindo ao Neres Focus Bot v2.1!*\n\n' +
    'Use /painel para acessar o painel interno.\n' +
    'Use /criar_planilha para criar uma planilha automatizada.\n' +
    'Use /ajuda para ver todos os comandos.',
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

// ========================================
// NOVOS COMANDOS - PLANILHAS
// ========================================

bot.onText(/\/criar_planilha/, async (msg) => {
  const chatId = msg.chat.id;

  userSessions.set(chatId, {
    state: 'choosing_template',
    data: {}
  });

  const keyboard = {
    inline_keyboard: [
      [
        { text: '📋 Leads', callback_data: 'template_leads' },
        { text: '📁 Projetos', callback_data: 'template_projetos' }
      ],
      [
        { text: '💰 Financeiro', callback_data: 'template_financeiro' }
      ]
    ]
  };

  await bot.sendMessage(chatId,
    '📊 *Criar Nova Planilha*\n\n' +
    'Escolha um template:\n\n' +
    '📋 Leads - Para gerenciar leads\n' +
    '📁 Projetos - Para acompanhar projetos\n' +
    '💰 Financeiro - Para controlar financeiro',
    { parse_mode: 'Markdown', reply_markup: keyboard }
  );
});

bot.onText(/\/add_linha/, async (msg) => {
  const chatId = msg.chat.id;
  const session = userSessions.get(chatId);

  if (!session || !session.data.sheetId) {
    await bot.sendMessage(chatId, 
      '❌ Nenhuma planilha ativa.\n' +
      'Use /criar_planilha primeiro.'
    );
    return;
  }

  userSessions.set(chatId, {
    ...session,
    state: 'awaiting_data'
  });

  await bot.sendMessage(chatId,
    '📝 *Adicionar Linha*\n\n' +
    'Envie os dados no formato:\n\n' +
    'João, joao@email.com, 11999999999, Site, Novo, 5000\n\n' +
    '_Não esqueça de separar com vírgulas!_',
    { parse_mode: 'Markdown' }
  );
});

bot.onText(/\/buscar/, async (msg) => {
  const chatId = msg.chat.id;
  const session = userSessions.get(chatId);

  if (!session || !session.data.sheetId) {
    await bot.sendMessage(chatId,
      '❌ Nenhuma planilha ativa.\n' +
      'Use /criar_planilha primeiro.'
    );
    return;
  }

  userSessions.set(chatId, {
    ...session,
    state: 'awaiting_search'
  });

  await bot.sendMessage(chatId,
    '🔍 *Buscar Dados*\n\n' +
    'Digite o termo que deseja buscar:',
    { parse_mode: 'Markdown' }
  );
});

bot.onText(/\/ajuda/, async (msg) => {
  const chatId = msg.chat.id;
  await bot.sendMessage(chatId,
    '🆘 *Comandos Disponíveis*\n\n' +
    '*Painel:*\n' +
    '/painel - Abre painel com 8 módulos\n\n' +
    '*Planilhas:*\n' +
    '/criar_planilha - Criar nova planilha\n' +
    '/add_linha - Adicionar dados\n' +
    '/buscar - Consultar dados\n\n' +
    '*Outros:*\n' +
    '/ajuda - Esta mensagem',
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

  // Módulos do painel
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

  // Templates de planilha
  if (data.startsWith('template_')) {
    const templateType = data.replace('template_', '');
    const session = userSessions.get(chatId);

    if (!session) return;

    session.data.templateType = templateType;
    session.state = 'awaiting_name';

    await bot.sendMessage(chatId,
      `✅ Template: *${templates[templateType].name}*\n\n` +
      'Digite o nome da planilha:',
      { parse_mode: 'Markdown' }
    );
  }
});

// ========================================
// MENSAGENS DE TEXTO
// ========================================

bot.on('message', async (msg) => {
  if (!msg.text || msg.text.startsWith('/')) return;

  const chatId = msg.chat.id;
  const session = userSessions.get(chatId);

  if (!session) return;

  try {
    // Wizard - Aguardando nome da planilha
    if (session.state === 'awaiting_name') {
      const templateType = session.data.templateType;
      const template = templates[templateType];

      await bot.sendMessage(chatId, '⏳ Criando planilha...');

      const result = await sheets.createSpreadsheet(msg.text, template);

      session.data.sheetId = result.id;
      session.data.sheetName = template.name;
      session.state = 'idle';

      await bot.sendMessage(chatId,
        `✅ *Planilha Criada!*\n\n` +
        `📊 Nome: ${result.name}\n` +
        `🔗 [Abrir Planilha](${result.url})\n\n` +
        `Próximos passos:\n` +
        `• Use /add_linha para adicionar dados\n` +
        `• Use /buscar para consultar\n` +
        `• Use /painel para voltar`,
        { parse_mode: 'Markdown' }
      );

      logger.info(`Planilha criada: ${result.id} para ${chatId}`);
    }

    // Wizard - Aguardando dados
    if (session.state === 'awaiting_data') {
      const data = msg.text.split(',').map(s => s.trim());

      try {
        await sheets.addRow(
          session.data.sheetId,
          session.data.sheetName.split(' - ')[0],
          { data }
        );

        await bot.sendMessage(chatId, '✅ Dados adicionados com sucesso!');
        session.state = 'idle';
      } catch (err) {
        await bot.sendMessage(chatId, '❌ Erro ao adicionar dados. Verifique o formato.');
      }
    }

    // Wizard - Aguardando busca
    if (session.state === 'awaiting_search') {
      try {
        const results = await sheets.searchData(
          session.data.sheetId,
          session.data.sheetName.split(' - ')[0],
          msg.text,
          'Nome'
        );

        if (results.length === 0) {
          await bot.sendMessage(chatId, '❌ Nenhum resultado encontrado.');
        } else {
          let response = `🔍 *${results.length} Resultado(s):*\n\n`;
          results.slice(0, 5).forEach((r, i) => {
            response += `${i + 1}. ${JSON.stringify(r).substring(0, 50)}...\n`;
          });
          await bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
        }
        session.state = 'idle';
      } catch (err) {
        await bot.sendMessage(chatId, '❌ Erro na busca.');
      }
    }

  } catch (err) {
    console.error('Erro:', err);
    await bot.sendMessage(chatId, '❌ Erro ao processar comando.');
  }
});

// ========================================
// ROTAS EXPRESS
// ========================================

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    bot: 'Neres Focus Bot v2.1',
    features: ['Painel 8 módulos', 'Google Sheets integrado', 'Automação'],
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

app.listen(PORT, () => {
  console.log('✅ Servidor rodando na porta', PORT);
  console.log('🤖 Bot: ' + (USE_WEBHOOK ? 'Webhook mode' : 'Polling mode'));
  console.log('📊 Painel: 8 módulos + Google Sheets');
  console.log('\n🎉 Neres Focus Bot v2.1 PRONTO!\n');
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught exception:', err);
});
