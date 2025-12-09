const modulesConfig = require('../config/modules.json');
const logger = require('../utils/logger');

class PanelManager {
  constructor(bot) {
    this.bot = bot;
    this.modules = modulesConfig.modules;
    this.userSessions = new Map();
  }

  isAuthorized(userId) {
    const settings = modulesConfig.settings;
    if (!settings.authorized_users || settings.authorized_users.length === 0) return true;
    return settings.authorized_users.includes(userId);
  }

  async showMainPanel(chatId) {
    const keyboard = this.buildMainPanelKeyboard();

    let message = '📊 *PAINEL CENTRAL — NERES FOCUS*\n\n';
    message += 'Escolha um módulo:\n\n';

    this.modules.forEach(m => {
      message += `${m.number}️⃣ ${m.name}\n`;
    });

    message += '\n_Envie o número ou clique no botão_';

    await this.bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });

    logger.info(`Painel aberto por ${chatId}`);
  }

  buildMainPanelKeyboard() {
    const buttons = [];

    for (let i = 0; i < this.modules.length; i += 2) {
      const row = [];
      const m1 = this.modules[i];
      row.push({
        text: `${m1.name}`,
        callback_data: `panel_module_${m1.id}`
      });

      if (i + 1 < this.modules.length) {
        const m2 = this.modules[i + 1];
        row.push({
          text: `${m2.name}`,
          callback_data: `panel_module_${m2.id}`
        });
      }

      buttons.push(row);
    }

    buttons.push([
      { text: '❓ Ajuda', callback_data: 'panel_help' },
      { text: '⚙️ Config', callback_data: 'panel_settings' }
    ]);

    return { inline_keyboard: buttons };
  }

  async showModule(chatId, moduleId) {
    const module = this.modules.find(m => m.id === moduleId);

    if (!module) {
      await this.bot.sendMessage(chatId, '❌ Módulo não encontrado');
      return;
    }

    const keyboard = this.buildModuleKeyboard(module);

    let message = `${module.name.toUpperCase()}\n\n`;
    message += 'Escolha uma ação:\n\n';

    module.actions.forEach((a, i) => {
      message += `${i + 1}. ${a.name}\n`;
    });

    await this.bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });

    logger.info(`Módulo ${moduleId} aberto por ${chatId}`);
  }

  buildModuleKeyboard(module) {
    const buttons = module.actions.map(action => [{
      text: action.name,
      callback_data: `action_${module.id}_${action.id}`
    }]));

    buttons.push([
      { text: '🔙 Voltar', callback_data: 'panel_main' }
    ]);

    return { inline_keyboard: buttons };
  }

  async executeAction(chatId, moduleId, actionId) {
    const module = this.modules.find(m => m.id === moduleId);
    if (!module) return;

    const action = module.actions.find(a => a.id === actionId);
    if (!action) return;

    logger.info(`Ação ${actionId} do módulo ${moduleId} por ${chatId}`);

    await this.bot.sendMessage(
      chatId,
      `⚙️ Executando: *${action.name}*\n\n_Funcionalidade em desenvolvimento..._`,
      { parse_mode: 'Markdown' }
    );
  }
}

module.exports = PanelManager;
