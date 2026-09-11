const fs = require('fs');
const path = require('path');
const { sendMessage } = require('../handles/sendMessage');

// 📋 Catégories — ajoute tes commandes ici quand tu en crées !
const commandCategories = {
  "🤖 | 𝙸𝚗𝚝𝚎𝚕𝚕𝚒𝚐𝚎𝚗𝚌𝚎 𝙰𝚛𝚝𝚒𝚏𝚒𝚌𝚒𝚎𝚕𝚕𝚎": ['angela', 'ai'],
  "🖼 | 𝙶𝚎𝚗𝚎𝚛𝚊𝚝𝚒𝚘𝚗 𝙳'𝙸𝚖𝚊𝚐𝚎𝚜": ['imagegen', 'pinterest', 'imagine'],
  "🎧 | 𝙼𝚞𝚜𝚒𝚚𝚞𝚎 & 𝙲𝚑𝚊𝚗𝚜𝚘𝚗𝚜": ['lyrics', 'music'],
  "🎮 | 𝙹𝚎𝚞𝚡 & 𝙳𝚒𝚟𝚎𝚛𝚝𝚒𝚜𝚜𝚎𝚖𝚎𝚗𝚝": ['jeux', 'quiz'],
  "👥 | 𝙰𝚞𝚝𝚛𝚎𝚜": ['help', 'allgroupe']
};

module.exports = {
  name: 'help',
  aliases: ['cmds', 'commandes', 'aide'],
  description: 'Affiche toutes les commandes disponibles d\'Angela',
  usage: 'help\nhelp [nom de la commande]',
  author: 'Ariel Aks Otaku',

  execute(senderId, args, pageAccessToken) {
    const commandsDir = path.join(__dirname, '../commands');
    const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));

    // Charger une commande pour vérifier
    const loadCommand = (file) => {
      try {
        return require(path.join(commandsDir, file));
      } catch (err) {
        console.log(`Erreur chargement ${file}:`, err.message);
        return null;
      }
    };

    // 📌 Si on demande une commande spécifique : help angela
    if (args.length > 0) {
      const searchName = args[0].toLowerCase();
      const foundCmd = commandFiles
        .map(loadCommand)
        .filter(Boolean)
        .find(cmd => 
          cmd.name.toLowerCase() === searchName ||
          (cmd.aliases && cmd.aliases.some(alias => alias.toLowerCase() === searchName))
        );

      if (foundCmd) {
        return sendMessage(senderId, {
          text: `━━━━━━━━━━━━━━━━━━━━
🤖 𝙰𝚗𝚐𝚎𝚕𝚊 — 𝙲𝚘𝚖𝚖𝚊𝚗𝚍𝚎 𝙳𝚎𝚝𝚊𝚒𝚕𝚜
━━━━━━━━━━━━━━━━━━━━
📌 Nom : ${foundCmd.name}
📝 Description : ${foundCmd.description || 'Aucune description'}
⌨️ Utilisation : ${foundCmd.usage || 'utilisez simplement la commande'}
✍️ Auteur : ${foundCmd.author || 'Ariel Aks Otaku'}
━━━━━━━━━━━━━━━━━━━━`
        }, pageAccessToken);
      } else {
        return sendMessage(senderId, {
          text: `❌ Commande "${searchName}" introuvable.\nTape "help" pour voir la liste complète.`
        }, pageAccessToken);
      }
    }

    // 📌 Afficher TOUTES les commandes par catégorie
    let message = `━━━━━━━━━━━━━━━━━━━━
🤖 𝙰𝚗𝚐𝚎𝚕𝚊 — 𝙻𝚒𝚜𝚝𝚎 𝙳𝚎𝚜 𝙲𝚘𝚖𝚖𝚊𝚗𝚍𝚎𝚜
👑 Créée par Ariel Aks Otaku
━━━━━━━━━━━━━━━━━━━━\n`;

    // Vérifie quelles commandes existent réellement
    const existingCommands = commandFiles.map(f => f.replace('.js', '').toLowerCase());

    Object.entries(commandCategories).forEach(([category, cmds]) => {
      message += `\n╭─━━━━━━━━━━━━━━━─╮\n│ ${category}\n`;
      cmds.forEach(cmd => {
        const status = existingCommands.includes(cmd.toLowerCase()) ? '✅' : '⭕';
        message += `│ ${status} ${cmd}\n`;
      });
      message += `╰─━━━━━━━━━━━━━━━─╯`;
    });

    message += `\n━━━━━━━━━━━━━━━━━━━━
💡 Tape :
👉 help [nom] pour détails
👉 Exemple : help angela
━━━━━━━━━━━━━━━━━━━━`;

    sendMessage(senderId, { text: message }, pageAccessToken);
  }
};
