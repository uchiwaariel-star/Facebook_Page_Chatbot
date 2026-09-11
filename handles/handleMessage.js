const angelaCmd = require('../commands/angela');
const helpCmd = require('../commands/help');

// Liste des commandes existantes
const commands = {
  help: helpCmd,
  angela: angelaCmd,
  ai: angelaCmd,
  chat: angelaCmd
};

module.exports = async function handleMessage(event, pageAccessToken) {
  const senderId = event.sender.id;
  const messageText = event.message?.text?.trim() || '';

  // 📨 Fonction d'envoi de message
  const sendMessage = (id, message) => {
    return fetch(`https://graph.facebook.com/v23.0/${id}/messages?access_token=${encodeURIComponent(pageAccessToken)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: { id },
        message
      })
    });
  };

  // 🔍 Détecter si c'est une commande
  const lowerText = messageText.toLowerCase();
  let cmdFound = false;

  for (const [cmdName, cmdModule] of Object.entries(commands)) {
    if (lowerText.startsWith(cmdName + ' ') || lowerText === cmdName) {
      cmdFound = true;
      const args = messageText.slice(cmdName.length).trim();
      await cmdModule.execute(senderId, args, pageAccessToken, sendMessage);
      break;
    }
  }

  // 🤖 SI PAS DE COMMANDE → ANGELA RÉPOND AUTOMATIQUEMENT !
  if (!cmdFound && !event.message.is_echo) {
    await angelaCmd.execute(senderId, messageText, pageAccessToken, sendMessage);
  }
};
