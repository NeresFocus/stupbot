/**
 * Gerenciador de Mensagens
 * Centraliza todas as mensagens do bot
 */

const messages = require('../config/messages.json');

class MessageHandler {
  static get(messageKey) {
    if (!messages[messageKey]) {
      console.warn(`Mensagem não encontrada: ${messageKey}`);
      return { text: 'Mensagem indisponível', parse_mode: 'Markdown' };
    }
    return messages[messageKey];
  }

  static format(messageKey, params = {}) {
    const msg = this.get(messageKey);
    let text = msg.text;

    // Substituir parâmetros
    for (const [key, value] of Object.entries(params)) {
      text = text.replace(`{${key}}`, value);
    }

    return {
      ...msg,
      text
    };
  }

  static async send(bot, chatId, messageKey, options = {}) {
    const msg = this.get(messageKey);
    return bot.sendMessage(chatId, msg.text, {
      parse_mode: msg.parse_mode,
      ...options
    });
  }

  static async sendFormatted(bot, chatId, messageKey, params = {}, options = {}) {
    const msg = this.format(messageKey, params);
    return bot.sendMessage(chatId, msg.text, {
      parse_mode: msg.parse_mode,
      ...options
    });
  }
}

module.exports = MessageHandler;
