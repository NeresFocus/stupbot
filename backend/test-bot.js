require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

console.log('\n🔍 TESTANDO BOT...');
console.log('==================');

// Verificar token
const TOKEN = process.env.TELEGRAM_TOKEN;
if (!TOKEN) {
  console.log('❌ TELEGRAM_TOKEN não definido!');
  process.exit(1);
}

console.log('✅ Token encontrado:', TOKEN.substring(0, 10) + '...');

// Criar bot em polling para teste
const bot = new TelegramBot(TOKEN, { polling: true });

console.log('✅ Bot criado!');
console.log('⏳ Aguardando getMe...');

// Testar conexão
bot.getMe()
  .then(info => {
    console.log('\n✅ BOT CONECTADO COM SUCESSO!');
    console.log('==================');
    console.log('Nome:', info.first_name);
    console.log('Username:', '@' + info.username);
    console.log('ID:', info.id);
    console.log('\n✅ TUDO OK! O bot está funcionando.');
    console.log('\nProblema pode ser:');
    console.log('1. Webhook não configurado');
    console.log('2. USE_WEBHOOK=true mas webhook não setado');
    console.log('\nSolução: Execute setWebhook novamente!');
    process.exit(0);
  })
  .catch(err => {
    console.log('\n❌ ERRO AO CONECTAR!');
    console.log('==================');
    console.log('Erro:', err.message);
    console.log('\nPossíveis causas:');
    console.log('1. Token inválido');
    console.log('2. Token revogado');
    console.log('3. Sem internet');
    process.exit(1);
  });

// Testar mensagem
bot.on('message', (msg) => {
  console.log('📨 Mensagem recebida:', msg.text);
  bot.sendMessage(msg.chat.id, '✅ Bot está funcionando!');
});

console.log('\n✅ Aguardando mensagens...');
console.log('Envie /start para o bot no Telegram!\n');
