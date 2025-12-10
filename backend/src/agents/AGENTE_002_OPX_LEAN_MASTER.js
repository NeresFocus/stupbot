/**
 * AGENTE_002_OPX_LEAN_MASTER
 * Agent Module for Neres Focus Bot
 */

const logger = require('../utils/logger');

const agentConfig = {
    id: "002",
    name: "OPX LEAN MASTER",
    fullName: "AGENTE_002_OPX_LEAN_MASTER",
    version: "1.0.0",
    enabled: true,
    commands: ["/002", "/opx", "/operations"],
    description: "OPX LEAN MASTER - Operations & Lean Optimization AI Agent",
    category: "operations",
    priority: 200,
    features: ["optimization", "lean", "processes", "efficiency"]
};

async function processMessage(message, botContext) {
    try {
        logger.debug(`Processing for ${agentConfig.fullName}`);
        const userId = message.from?.id || message.sender_id;
        const text = message.text?.trim() || '';
        const response = await handleAgentRequest({userId, text, agent: agentConfig, context: botContext});
        return response;
    } catch (error) {
        logger.error(`Error in ${agentConfig.fullName}: ${error.message}`);
        return {success: false, error: error.message, agentId: agentConfig.id};
    }
}

async function handleAgentRequest(params) {
    const { userId, text, agent, context } = params;
    logger.info(`${agent.fullName} handling request from user ${userId}`);
    const response = {
        success: true,
        agentId: agent.id,
        agentName: agent.name,
        agentFullName: agent.fullName,
        message: `${agent.name} agent is ready to optimize operations`,
        data: {},
        timestamp: new Date().toISOString(),
        userId
    };
    try {
        if (!text) {
            response.message = `Use /${agent.id} or /opx to access ${agent.name}`;
        } else {
            response.data = await processAgentLogic(text, context);
        }
    } catch (err) {
        response.success = false;
        response.error = err.message;
    }
    return response;
}

async function processAgentLogic(input, context) {
    return {processed: true, input: input.substring(0, 100), status: "ready", action: "optimization_analysis"};
}

function initialize() {
    logger.info(`Initializing ${agentConfig.fullName}...`);
    return {success: true, agent: agentConfig, initialized: true};
}

function getInfo() {
    return {...agentConfig, status: 'ready', initialized: true};
}

function getCommands() {
    return agentConfig.commands;
}

function isForThisAgent(text) {
    if (!text) return false;
    const lower = text.toLowerCase();
    return agentConfig.commands.some(cmd => lower.startsWith(cmd.toLowerCase()));
}

function getFeatures() {
    return agentConfig.features || [];
}

function getStatus() {
    return {
        agentId: agentConfig.id,
        name: agentConfig.fullName,
        status: 'ready',
        healthy: true,
        lastCheck: new Date().toISOString()
    };
}

module.exports = {
    processMessage,
    handleAgentRequest,
    processAgentLogic,
    initialize,
    getInfo,
    getCommands,
    getFeatures,
    getStatus,
    isForThisAgent,
    agentConfig
};