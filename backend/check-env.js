// Verifica variáveis de ambiente
require('dotenv').config();

console.log('🔍 VERIFICANDO CONFIGURAÇÃO...');
console.log('================================');

const required = ['TELEGRAM_TOKEN', 'USE_WEBHOOK', 'PORT'];
const optional = ['WEBHOOK_URL', 'ADMIN_CHAT_ID', 'BACKEND_NOTIFY_SECRET'];

console.log('\n✅ Variáveis OBRIGATÓRIAS:');
required.forEach(key => {
  const value = process.env[key];
  if (value) {
    console.log(`  ✓ ${key}: ${key === 'TELEGRAM_TOKEN' ? '***' : value}`);
  } else {
    console.log(`  ✗ ${key}: FALTANDO`);
  }
});

console.log('\n📋 Variáveis OPCIONAIS:');
optional.forEach(key => {
  const value = process.env[key];
  if (value) {
    console.log(`  ✓ ${key}: ${key.includes('SECRET') || key.includes('TOKEN') ? '***' : value}`);
  } else {
    console.log(`  - ${key}: não definido`);
  }
});

console.log('\n================================');
console.log('Verificação concluída!\n');
