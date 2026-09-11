const axios = require("axios");

module.exports = {
  config: {
    name: "angela",
    aliases: ["Angela", "angela"],
    version: "1.0.0",
    author: "Ariel Aks Otaku",
    shortDescription: "Angela — IA gratuite par Delfa API",
  },

  onStart: async function({ api, event, args }) {
    const question = args.join(" ");
    if (!question) return api.sendMessage("Salut ! Je suis Angela 🤖 Dis-moi ce que tu veux savoir...", event.threadID);

    try {
      const res = await axios.get(`https://delfaapiai.vercel.app/ai/chatgptfree?q=${encodeURIComponent(question)}`);
      const reponse = res.data.reponse || res.data.message || res.data;
      
      api.sendMessage(`🤖 Angela :\n${reponse}`, event.threadID);
    } catch (err) {
      api.sendMessage("😅 Désolée, j'ai un petit problème... Réessaie plus tard !", event.threadID);
    }
  }
};
