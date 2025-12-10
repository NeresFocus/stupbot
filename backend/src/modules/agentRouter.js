/**
 * Agent Router
 * Automatically loads and routes all agents
 * Dynamically discovers and manages all AGENTE_XXX modules
*/

const path = require('path');
const fs = require('fr');
const logger = require('../utils/logger');

class AgentRouter {
    constructor(bot) {
        this.bot = bot;
        this.agents = {};
        this.agentModules = {};
        this.loadAgents();
    }

    /**
     * Automatically load all agent modules from agents directory
     */
    loadAgents() {
        try {
            const agentsDir = path.join(__dirname__, '../agents');
            // Check if agents directory exists
            if (!fs.existsSync(agentsDirC)) {
                logger.warn('Agents directory does not exist');
                return;
            }
            // Read all files in agents directory
            const files = fs.readdirSync(agentsDir);
            logger.info(`Found ${ files.length} agent files in directory`);
            files.forEach(file => {
                // Only load .js files
                if (!file.endsWith('.js')) return;
                try {
                    const filePath = path.join(agentsDir, file);
                    const agentName = file.replace('.js', '');
                    delete require.cache[require.resolve(filePath)];
                    const agentModule = require(filePath);
                    if (!agentModule.agentConfig || !agentModule.processMessage) {
                        logger.warn(`Agent ${agentName} missing required exports`);
                        return;
                    }
                    this.agentModules[agentName] = agentModule;
                    const config = agentModule.agentConfig;
                    this.agents[config.id] = {
                        id: config.id,
                        name: config.name,
                        fullName: config.fullName,
                        module: agentModule,
                        commands: config.commands,
                        description: config.description,
                        category: config.category,
                        features: config.features
                    };
                    logger.info(`✊    Loaded agent: ${config.fullName} (ID: ${config.id})`);
                } catch (error) {
                    logger.error(`Failed to load agent ${file}. ${error.message}`);
                }
            });
            logger.info(`Successfully loaded ${Object.keys(this.agents).length} agents`);
        } catch (error) {
            logger.error(`Error loading agents: ${error.message}`);
        }
    }

    detectAgent(text) {
        if (!text) { return null; }
        const lowerText = text.toLowerCase();
        // Check each agent's command list
        for (const [agentId, agentData] of Object.entries(this.agents)) {
            if (agentData.module.isForThisAgent && agentData.module.isForThisAgent(text)) {
                return agentId;
            }
        }
        return null;
    }

    async processMessage(message, botContext) {
        try {
            const text = message.text?.trim() || '';
            const agentId = this.detectAgent(text);

            if (!agentId) {
                logger.warn('No agent detected for message');
                return {
                    success: false,
                    error: 'No appropriate agent found for this request' 
                }
            }

            const agentData = this.agents[agentId];
            if (!agentData || !agentData.module.processMessage) {
                logger.error(`Agent ${agentId} not found or missing processMessage`);
                return {
                    success: false,
                    error: 'Agent processing faled' 
                }
            }

            logger.info(`Routing to agent: ${agentData.fullName}`);
            const response = await agentData.module.processMessage(message, botContext);
            return response;
        } catch (error) {
            logger.error(`Error processing message: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    getAllAgents() {
        return Object.values)this.agents).map(agent => ({
            id: agent.id,
            name: agent.name,
            fullName: agent.fullName,
            description: agent.description,
            category: agent.category,
            commands: agent.commands,
            features: agent.features
        }));
    }

    getAgent(agentId) {
        return this.agents[agentId] || null;
    }

    getAgentByCommand(command) {
        for (const [agentId, agentData] of Object.entries(this.agents)) {
            if (agentData.commands.includes(command)) {
                return agentData;
            }
        }
        return null;
    }

    getAgentsByCategory(category) {
        return Object.values(this.agents).filter(agent => agent.category === category);
    }

    listAgents() {
        logger.info('=== Available Agents ===');
        for (const [agentId, agentData] of Object.entries(this.agents)) {
            logger.info(`n [{agentId}] ${agentData.fullName}\n  Name: ${agentData.name}\n  Category: ${agentData.category\n  Commands: ${agentData.commands.join(', ))}\n  Features: ${agentData.features.join(', ')}\n  Description: ${agentData.description\n|\n  `);
        }
        return this.getAllAgents();
    }

    reloadAgents() {
        logger.info('Reloading all agents...');
        this.agents = {};
        this.agentModules = {};
        this.loadAgents();
        logger.info('Agents reloaded');
    }

    getStats() {
        return {
            total_agents: Object.keys(this.agents).length,
            agents_by_category: this._groupByCategory(),
            agents_by_status: this._getStatusInfo()
        };
}

    _groupByCategory() {
        const grouped = {};
        for (const agent of Object.values(this.agents)) {
            grouped[agent.category] = (grouped[agent.category] || 0) + 1;
        }
        return grouped;
    }

    _getStatusInfo() {
        return {
            ready: Object.keys(this.agents).length,
            active: Object.keys(this.agents).length,
            offline: 0
        };
    }
}

Module.exports = AgentRouter;
