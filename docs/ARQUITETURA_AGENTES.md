# 🧠 **ARQUITETURA DE AGENTES – Neres Focus Bot**

**Diagrama lógico, configuração YAML e padrões de roteamento.**

---

## 📊 1. Diagrama Lógico da Arquitetura

```
┌──────────────┐
│ Usuário/Chat │
└──────┬───────┘
       │  Mensagem / comando
       ▼
 ┌──────────────┐
 │  Router /    │   ←  Núcleo de decisão
 │  Núcleo de   │      (classificação + roteamento)
 │  Intenções   │
 └──────┬───────┘
        │  Identifica "intenção" ou "contexto"
        ▼
 ┌──────────────┐   ┌─────────────────────┐
 │  Agente:     │   │  Agente:            │
 │  Social      │   │  Estratégia         │
 │  Media Pro   │   │  Master             │
 └──────┬───────┘   └────────┬────────────┘
        │                      │
        ▼                      ▼
 ┌──────────────┐         ┌──────────────┐
 │  Agente:     │         │  Agente:     │
 │  Automação / │         │  Copywriter  │
 │  Operacional │         │  Premium     │
 └──────┬───────┘         └────────┬─────┘
        │                        │
        ▼                        ▼
 ┌──────────────┐         ┌──────────────┐
 │  Agente:     │         │  Agente:     │
 │  Financeiro  │         │  Fallback /  │
 │  Expert      │         │  Generalista │
 └──────────────┘         └──────────────┘
                      (caso nenhuma intenção específica seja reconhecida)
```

---

## 🔄 Fluxo Básico

1. **Usuário envia mensagem** → vai para o **Router / Núcleo de Intenções**.
2. **O Router analisa** via NLP ou regras (intenção, contexto, comandos) e roteia para o agente mais adequado.
3. **Cada Agente trata** de um domínio de funções (conteúdo, estratégia, automação, copywriting, finanças, fallback).
4. **Se nenhum agente especializado** for identificado, o agente **Fallback / Generalista** responde com dúvida/solicitação de clarificação.

---

## 🛠️ Módulos Comuns a Todos os Agentes

* **Contexto e histórico da conversa** (memória de sessão)
* **Acesso à base de templates / prompts / fluxos**
* **Integrações externas** (Sheets, Notion, Drive, etc), conforme configuração do usuário
* **Configurações** (idioma, nível de sugestões, preferências)

---

## 📋 2. Representação em YAML (Topologia + Roteamento)

```yaml
bot:
  name: "Neres Focus Bot"
  version: "1.0.0"
  router:
    type: "intent_classification"
    model: "nlp_classifier"  # Pode ser Hugging Face, OpenAI, ou custom
    intents_map:
      "social_media": 
        keywords: ["social", "post", "instagram", "facebook", "reels", "tiktok", "conteúdo"]
        confidence_threshold: 0.75
      "strategy": 
        keywords: ["plano de marketing", "funil", "estratégia", "negócio", "360", "diagnóstico"]
        confidence_threshold: 0.70
      "automation": 
        keywords: ["fluxo", "automatizar", "n8n", "processo", "operação", "workflow"]
        confidence_threshold: 0.72
      "copywriting": 
        keywords: ["copy", "texto persuasivo", "landing", "headline", "persuasão", "vendas"]
        confidence_threshold: 0.75
      "finance": 
        keywords: ["financeiro", "fluxo de caixa", "projeção", "indicadores", "DRE", "cash flow"]
        confidence_threshold: 0.70
      "help": 
        keywords: ["ajuda", "/help", "comandos", "como usar", "instruções"]
        confidence_threshold: 0.80
      "panel": 
        keywords: ["/panel", "painel", "menu", "ferramentas", "o que você pode fazer"]
        confidence_threshold: 0.85
    default_intent: "fallback"

  agents:
    - key: "social_media_pro"
      name: "Social Media Pro"
      icon: "📲"
      description: "Gerador de conteúdo social e análises"
      capabilities:
        - gerar_posts
        - gerar_reels
        - calendário_social
        - análise_audience
        - trend_monitoring
      templates_path: "prompts/social_media/"
      tools:
        - google_trends
        - instagram_analytics
        - scheduler
      memory_requirement: "session_context"

    - key: "strategy_master"
      name: "Estratégia Master"
      icon: "🎯"
      description: "Planejamento estratégico e análise de negócio"
      capabilities:
        - plano_360
        - funil_vendas
        - diagnóstico_negócio
        - estratégia_conteudo
        - plano_acao
      templates_path: "prompts/strategy/"
      tools:
        - analytics_engine
        - market_research
        - swot_analyzer
      memory_requirement: "user_context"

    - key: "automation_engine"
      name: "Automação / Operacional"
      icon: "⚙️"
      description: "Criação de fluxos e processos automatizados"
      capabilities:
        - gerar_fluxos_n8n
        - rotas_operacionais
        - processos_lean
        - mapeamento_operacional
        - arquitetura_sistemas
      templates_path: "prompts/automation/"
      tools:
        - n8n_api
        - process_mapper
        - workflow_designer
      memory_requirement: "technical_context"

    - key: "copywriter_premium"
      name: "Copywriter Premium"
      icon: "✍️"
      description: "Copywriting persuasivo e conteúdo de venda"
      capabilities:
        - copy_persuasiva
        - script_vídeo
        - landing_page
        - copy_vendas
        - headlines
        - subject_lines
      templates_path: "prompts/copywriting/"
      tools:
        - swipe_file_analyzer
        - conversion_tracker
        - ab_test_optimizer
      memory_requirement: "session_context"

    - key: "finance_expert"
      name: "Financeiro Expert"
      icon: "💰"
      description: "Análise financeira e projeções"
      capabilities:
        - projeção_financeira
        - dre_generator
        - análise_indicadores
        - estratégia_caixa
        - fluxo_caixa
        - análise_viabilidade
      templates_path: "prompts/finance/"
      tools:
        - excel_api
        - financial_calc_engine
        - scenario_planner
      memory_requirement: "business_context"

    - key: "fallback"
      name: "Fallback / Generalista"
      icon: "🤖"
      description: "Resposta padrão para intenções não reconhecidas"
      capabilities:
        - pedir_clarificação
        - oferecer_menu
        - sugerir_alternativas
        - histórico_conversas
      templates_path: "prompts/fallback/"
      memory_requirement: "minimal"

  shared_modules:
    context_manager:
      type: "memory_manager"
      storage: "redis"  # ou "postgresql", "mongodb"
      ttl: 3600  # 1 hora
      include:
        - user_id
        - conversation_history
        - user_preferences
        - agent_state

    template_repository:
      type: "prompt_store"
      source: "github_raw"  # ou "local_file", "s3"
      refresh_interval: 3600
      structure:
        - social_media/
        - strategy/
        - automation/
        - copywriting/
        - finance/
        - fallback/

    integration_manager:
      type: "connector_hub"
      integrations:
        - google_sheets
        - notion
        - google_drive
        - slack
        - discord
        - n8n
      config_source: "user_settings"
      auth_method: "oauth2"

    config_manager:
      type: "preferences_store"
      storage: "database"
      settings:
        - language: "pt_BR"
        - suggestion_level: 1-5
        - agent_personalization
        - integration_configs

  routing_logic:
    primary: "intent_classification"
    fallback: "keyword_matching"
    confidence_threshold: 0.65
    retry_strategy: "escalate_to_fallback"
    timeout: 30  # segundos
    max_attempts: 2

  logging:
    level: "INFO"
    format: "json"
    handlers:
      - console
      - file
      - external_monitoring
```

---

## 🧠 Explicações-chave

| Conceito | Descrição |
|----------|-----------|
| **router.intents_map** | Mapeia palavras-chave comuns ou padrões de comando a intenções. |
| **default_intent** | Define o agente fallback caso nenhuma intenção especializada seja reconhecida. |
| **agent.key** | Identificador único do agente (usado internamente para roteamento). |
| **agent.capabilities** | Lista de funções que o agente pode executar. |
| **shared_modules** | Funcionalidades comuns a todos os agentes (contexto, templates, integrações, configurações). |
| **confidence_threshold** | Nível mínimo de confiança da classificação para aceitar uma intenção. |
| **memory_requirement** | Tipo de contexto que o agente precisa manter (session, user, technical, business). |

---

## 📦 3. Fluxo de Decisão (Pseudocódigo)

```python
def route_message(user_message: str, user_context: dict) -> dict:
    """
    Roteia a mensagem do usuário para o agente mais apropriado.
    """

    # 1. Classificar intenção
    intent, confidence = classify_intent(user_message)

    # 2. Validar confiança
    if confidence < CONFIDENCE_THRESHOLD:
        agent = agents["fallback"]
        return agent.handle(user_message, user_context)

    # 3. Mapear intenção a agente
    agent_key = intents_map.get(intent)
    agent = agents.get(agent_key)

    if agent is None:
        agent = agents["fallback"]

    # 4. Enriquecer contexto
    enriched_context = context_manager.get_session_context(user_context)

    # 5. Executar agente
    response = agent.handle(user_message, enriched_context)

    # 6. Registrar interação
    log_interaction(user_message, intent, agent.key, response)

    return response
```

---

## 🎯 4. Considerações e Próximos Passos

### ✅ Benefícios do Design

- **Escalabilidade**: Adicione novos agentes (SEO Expert, Analytics, Atendimento) apenas estendendo a lista em `agents`.
- **Separação de Responsabilidades**: Cada agente cuida de um domínio específico.
- **Reutilização de Módulos**: Context, templates, integrações compartilhadas.
- **Facilidade de Manutenção**: Configuração centralizada em YAML.

### 🚀 Próximas Implementações

1. **NLP Classifier**: Treinar ou integrar modelo (HuggingFace, OpenAI GPT, etc).
2. **Memory/Redis**: Implementar armazenamento de contexto de sessão.
3. **Template Repository**: Organizar prompts em GitHub/S3 e auto-recarregar.
4. **Integration Hub**: Conectar com Sheets, Notion, Drive, n8n, etc.
5. **Logging & Monitoring**: Rastrear performance, erros, intent misclassification.
6. **A/B Testing**: Testar diferentes rotas de classificação para otimizar acurácia.

---

## 🔗 Arquivos Relacionados

- [`MENSAGENS_INTERNAS.md`](./MENSAGENS_INTERNAS.md) — Templates de mensagens do bot.
- [`CONFIG_INTEGRAÇÕES.md`](./CONFIG_INTEGRAÇÕES.md) — Setup de integrações externas (em progresso).

---

**Versão:** 1.0  
**Última atualização:** Dezembro 2025  
**Status:** Arquitetura Definida, Pronto para Implementação
