/**
 * Roteador de Agentes
 * Identifica qual agente usar baseado no contexto
 */

const MessageHandler = require('../utils/messageHandler');
const logger = require('../utils/logger');

class AgentRouter {
  constructor(bot) {
    this.bot = bot;
    this.agents = {
      social: { name: 'Social Media Pro', msg: 'MSG_AGENT_SOCIAL' },
      strategy: { name: 'Estratégia Master', msg: 'MSG_AGENT_STRATEGY' },
      automation: { name: 'Automação', msg: 'MSG_AGENT_AUTOMATION' },
      copy: { name: 'Copywriter', msg: 'MSG_AGENT_COPY' },
      finance: { name: 'Financeiro', msg: 'MSG_AGENT_FINANCE' }
    };
  }

  /**
   * Detecta qual agente usar baseado no texto
   */
  detectAgent(text) {
    const lower = text.toLowerCase();

    // Mapeamento de palavras-chave para agentes
    if (lower.includes('instagram') || lower.includes('reels') || lower.includes('posts') || lower.includes('tiktok')) {
      return 'social';
    }

    if (lower.includes('estratégia') || lower.includes('planejamento') || lower.includes('plano')) {
      return 'strategy';
    }

    if (lower.includes('automação') || lower.includes('n8n') || lower.includes('fluxo') || lower.includes('workflow')) {
      return 'automation';
    }

    if (lower.includes('copy') || lower.includes('venda') || lower.includes('headline') || lower.includes('landing')) {
      return 'copy';
    }

    if (lower.includes('financeiro') || lower.includes('dre') || lower.includes('caixa') || lower.includes('lucro')) {
      return 'finance';
    }

    return null;
  }

  /**
   * Ativa agente apropriado
   */
  async activateAgent(chatId, agentKey) {
    const agent = this.agents[agentKey];

    if (!agent) {
      await MessageHandler.send(this.bot, chatId, 'MSG_ERROR');
      return;
    }

    logger.info(`Agente ativado: ${agent.name}`);
    await MessageHandler.send(this.bot, chatId, agent.msg);
  }

  /**
   * Processa mensagem e roteia para agente
   */
  async routeMessage(chatId, text) {
    const agent = this.detectAgent(text);

    if (agent) {
      await MessageHandler.send(this.bot, chatId, 'MSG_PROCESSING');
      // Pequeno delay para efeito visual
      await new Promise(resolve => setTimeout(resolve, 1000));
      await this.activateAgent(chatId, agent);
    } else {
      await MessageHandler.send(this.bot, chatId, 'MSG_ERROR');
    }
  }

  /**
   * Lista todos os agentes disponíveis
   */
  async listAgents(chatId) {
    let text = '🧩 **Agentes Disponíveis**\n\n';

    for (const [key, agent] of Object.entries(this.agents)) {
      text += `• ${agent.name}\n`;
    }

    await this.bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
  }
}

module.exports = AgentRouter;
