const config = require('../../config.json');

class KeyboardBuilder {
  buildPanelKeyboard() {
    const modules = config.panel.modules || [];
    const keyboard = modules.map(m => ([{
      text: m.name,
      callback_data: `module:${m.id}`
    }]));

    keyboard.push([{ text: '🤖 Sugestões', callback_data: 'action:suggestions' }]);
    keyboard.push([{ text: '⚙️ Config', callback_data: 'settings:main' }]);

    return { inline_keyboard: keyboard };
  }
}

module.exports = KeyboardBuilder;
