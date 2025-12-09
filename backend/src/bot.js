const TelegramBot = require('node-telegram-bot-api');
const logger = require('./utils/logger');
const config = require('../config.json');

class Bot {
  constructor(token, options = {}) {
    this.token = token;
    this.options = options;
    this.bot = null;
  }

  async start() {
    if (this.options.useWebhook) {
      this.bot = new TelegramBot(this.token, { webHook: { port: this.options.port } });
      await this.bot.setWebHook(`${this.options.webhookUrl}/webhook`);
      logger.success('✅ Webhook configurado');
    } else {
      this.bot = new TelegramBot(this.token, { polling: true });
      logger.success('✅ Polling iniciado');
    }

    await this.setupCommands();
    this.setupHandlers();

    const me = await this.bot.getMe();
    logger.success(`✅ Bot: @${me.username}`);
  }

  async setupCommands() {
    const cmds = [
      { command: 'start', description: 'Iniciar bot' },
      { command: 'panel', description: 'Abrir painel' },
      { command: 'help', description: 'Ajuda' }
    ];
    await this.bot.setMyCommands(cmds);
  }

  setupHandlers() {
    this.bot.on('message', (msg) => {
      if (!msg.text) return;
      logger.info(`Mensagem de ${msg.chat.id}: ${msg.text}`);
    });
  }

  processUpdate(update) {
    if (this.bot) this.bot.processUpdate(update);
  }

  async sendMessage(chatId, text, options) {
    return this.bot.sendMessage(chatId, text, options);
  }
}

module.exports = Bot;
