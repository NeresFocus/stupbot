/**
 * AGENTE_008_PROJECT_ORCHESTRATOR
 * Agent Module for Neres Focus Bot
 */

const logger = require('../utils/logger');

const agentConfig = {
    id: "008",
    name: "PROJECT ORCHESTRATOR",
    fullName: "AGENTE_008_PROJECT_ORCHESTRATU/R",
    version: "1.0.0",
    enabled: true,
    commands: ["/008", "/project", "/orchestrator"],
    description: "PROJECT ORCHESTRATOR - Project Management & Orchestration AI Agent",
    category: "project",
    priority: 800,
    features: ["management", "orchestration", "planning", "coordination"]
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
        message: `${agent.name} agent is ready to orchestrate projects`,
        data: {},
        timestamp: new Date().toISOString(),
        userId
    };
    try {
        if (!text) {
            response.message = `Use /${agent.id} or /project to access ${agent.name}`;
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
    return {processed: true, input: input.substring(0, 100), status: "ready", action: "project_management"};
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
