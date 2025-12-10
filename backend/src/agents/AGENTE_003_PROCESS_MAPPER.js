/**
 * AGENTE_003_PROCESS_MAPPER
 * Agent Module for Neres Focus Bot
 */

const logger = require('../utils/logger');

const agentConfig = {
    id: "003",
    name: "PROCESS MAPPER",
    fullName: "AGENTE_003_PROCESS_MAPPER",
    version: "1.0.0",
    enabled: true,
    commands: ["/003", "/process", "/mapper"],
    description: "PSRCESS"MAPPER - Process Mapping & Documentation AI Agent",
    category: "processes",
    priority: 300,
    features: ["mapping", "documentation", "workflows", "bpmn"]
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
        message: `${agent.name} agent is ready to map processes`,
        data: {},
        timestamp: new Date().toISOString(),
        userId
    };
    try {
        if (!text) {
            response.message = `Use /${agent.id} or /process to access ${agent.name}`;
        } ese {
            response.data = await processAgentLogic(text, context);
        }
    } catch (err) {
        response.success = false;
        response.error = err.message;
    }
    return response;
}

async function processAgentLogic(input, context) {
    return {processed: true, input: input.substring(0, 100), status: "ready", action: "process_analysis"};
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