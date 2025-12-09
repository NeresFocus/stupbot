#!/bin/bash

# ============================================
# 🤖 NERES FOCUS BOT - SCRIPT DE SETUP
# ============================================
# Script para configuração e inicialização automática
# Autor: Neres Focus
# Repositório: https://github.com/NeresFocus/stupbot
# ============================================

set -e  # Para em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Banner
echo ""
echo "${PURPLE}╔════════════════════════════════════════╗${NC}"
echo "${PURPLE}║   🤖 NERES FOCUS BOT - SETUP          ║${NC}"
echo "${PURPLE}╔════════════════════════════════════════╗${NC}"
echo ""

# Função de log
log_info() {
    echo "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo "${RED}❌ $1${NC}"
}

# Verifica Node.js
check_node() {
    log_info "Verificando Node.js..."
    if ! command -v node &> /dev/null; then
        log_error "Node.js não encontrado!"
        echo "Instale Node.js: https://nodejs.org/"
        exit 1
    fi
    NODE_VERSION=$(node --version)
    log_success "Node.js encontrado: $NODE_VERSION"
}

# Verifica npm
check_npm() {
    log_info "Verificando npm..."
    if ! command -v npm &> /dev/null; then
        log_error "npm não encontrado!"
        exit 1
    fi
    NPM_VERSION=$(npm --version)
    log_success "npm encontrado: v$NPM_VERSION"
}

# Instala dependências do backend
install_dependencies() {
    log_info "Instalando dependências do backend..."
    cd backend
    npm install
    cd ..
    log_success "Dependências instaladas!"
}

# Cria arquivo .env
create_env_file() {
    log_info "Configurando variáveis de ambiente..."

    if [ -f "backend/.env" ]; then
        log_warning "Arquivo .env já existe!"
        read -p "Deseja recriar? (s/N): " RECREATE
        if [[ ! $RECREATE =~ ^[Ss]$ ]]; then
            log_info "Mantendo .env existente"
            return
        fi
    fi

    echo ""
    echo "${YELLOW}════════════════════════════════════════${NC}"
    echo "${YELLOW}  CONFIGURAÇÃO DO BOT${NC}"
    echo "${YELLOW}════════════════════════════════════════${NC}"
    echo ""

    # Solicita informações
    read -p "📱 Token do Bot (de @BotFather): " BOT_TOKEN
    read -p "🌐 URL do Backend (ex: https://seu-projeto.up.railway.app): " BACKEND_URL
    read -p "💬 Seu Chat ID (opcional, obtenha em @userinfobot): " ADMIN_CHAT_ID

    # Define valores padrão
    WEBHOOK_MODE="true"
    PORT="3000"
    WEBAPP_URL="https://neresfocus.github.io/stupbot"
    NOTIFY_SECRET="Nq7OzYl39QuxRG8sSBZiyIUHMkC5HrvPbBKW3ce94elMkfe3shdtRSv7c7ugDG0A"

    # Cria arquivo .env
    cat > backend/.env << EOF
# ========================================
# NERES FOCUS BOT - CONFIGURAÇÕES
# Gerado automaticamente por start.sh
# Data: $(date)
# ========================================

# Token do Bot
TELEGRAM_TOKEN=$BOT_TOKEN

# Modo de operação
USE_WEBHOOK=$WEBHOOK_MODE

# URL do backend
WEBHOOK_URL=$BACKEND_URL

# Porta do servidor
PORT=$PORT

# URL do WebApp
WEBAPP_URL=$WEBAPP_URL

# Chat ID do admin
ADMIN_CHAT_ID=$ADMIN_CHAT_ID

# Token de segurança para notificações
BACKEND_NOTIFY_SECRET=$NOTIFY_SECRET
EOF

    log_success "Arquivo .env criado!"
}

# Configura webhook
setup_webhook() {
    log_info "Configurando webhook no Telegram..."

    # Carrega variáveis do .env
    source backend/.env

    WEBHOOK_ENDPOINT="${WEBHOOK_URL}/webhook"

    log_info "Setando webhook: $WEBHOOK_ENDPOINT"

    RESPONSE=$(curl -s "https://api.telegram.org/bot${TELEGRAM_TOKEN}/setWebhook?url=${WEBHOOK_ENDPOINT}")

    if echo "$RESPONSE" | grep -q '"ok":true'; then
        log_success "Webhook configurado com sucesso!"
    else
        log_error "Falha ao configurar webhook"
        echo "$RESPONSE"
    fi
}

# Testa conexão com bot
test_bot_connection() {
    log_info "Testando conexão com o bot..."

    source backend/.env

    RESPONSE=$(curl -s "https://api.telegram.org/bot${TELEGRAM_TOKEN}/getMe")

    if echo "$RESPONSE" | grep -q '"ok":true'; then
        BOT_USERNAME=$(echo "$RESPONSE" | grep -o '"username":"[^"]*"' | cut -d'"' -f4)
        log_success "Bot conectado: @$BOT_USERNAME"
    else
        log_error "Falha ao conectar com o bot"
        echo "$RESPONSE"
        exit 1
    fi
}

# Inicia o bot
start_bot() {
    log_info "Iniciando bot..."
    echo ""
    echo "${GREEN}════════════════════════════════════════${NC}"
    echo "${GREEN}  🚀 BOT INICIADO COM SUCESSO!${NC}"
    echo "${GREEN}════════════════════════════════════════${NC}"
    echo ""
    log_info "Pressione Ctrl+C para parar"
    echo ""

    cd backend
    npm start
}

# Menu principal
show_menu() {
    echo ""
    echo "${BLUE}Escolha uma opção:${NC}"
    echo "1) 🔧 Setup completo (recomendado para primeira vez)"
    echo "2) 🚀 Apenas iniciar bot"
    echo "3) 🔄 Reconfigurar webhook"
    echo "4) 📦 Reinstalar dependências"
    echo "5) ✏️  Editar .env"
    echo "6) 🧪 Testar conexão"
    echo "7) 🚪 Sair"
    echo ""
    read -p "Opção: " OPTION

    case $OPTION in
        1)
            check_node
            check_npm
            install_dependencies
            create_env_file
            test_bot_connection
            setup_webhook
            start_bot
            ;;
        2)
            if [ ! -f "backend/.env" ]; then
                log_error "Arquivo .env não encontrado! Execute o setup completo primeiro."
                exit 1
            fi
            start_bot
            ;;
        3)
            setup_webhook
            ;;
        4)
            install_dependencies
            ;;
        5)
            if command -v nano &> /dev/null; then
                nano backend/.env
            elif command -v vim &> /dev/null; then
                vim backend/.env
            else
                log_error "Editor não encontrado. Edite manualmente: backend/.env"
            fi
            ;;
        6)
            test_bot_connection
            ;;
        7)
            log_info "Saindo..."
            exit 0
            ;;
        *)
            log_error "Opção inválida!"
            show_menu
            ;;
    esac
}

# Verifica se é primeira execução
if [ ! -f "backend/.env" ]; then
    log_warning "Primeira execução detectada!"
    log_info "Vou fazer o setup completo automaticamente..."
    sleep 2
    check_node
    check_npm
    install_dependencies
    create_env_file
    test_bot_connection
    setup_webhook
    start_bot
else
    show_menu
fi
