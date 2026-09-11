const axios = require('axios');

module.exports = {
  name: 'angela',
  aliases: ['ai', 'chat', 'gpt', 'bot'],
  description: "Discuter avec Angela — Intelligence Artificielle créée par Ariel Aks Otaku",
  usage: "angela [question]\nOu écrivez directement votre message",
  author: "Ariel Aks Otaku",

  async execute(senderId, messageText, pageAccessToken, sendMessage) {
    // 🔑 Si pas de texte → message d'accueil
    if (!messageText || messageText.trim() === '') {
      return sendMessage(senderId, {
        text: `🤖 Bonjour ! Je suis Angela, créée par Ariel Aks Otaku 👑
Je suis là pour discuter, répondre à tes questions et t'aider ! 😊

💡 Tu peux simplement me parler, pas besoin de commande spéciale.`
      }, pageAccessToken);
    }

    const prompt = messageText.trim();

    // ⏳ Message d'attente
    sendMessage(senderId, { text: "🤖 Angela réfléchit... ⏳" }, pageAccessToken);

    try {
      // 🌐 API IA gratuite — fonctionnelle !
      const apiUrl = `https://delfaapiai.vercel.app/ai/chatgptfree?q=${encodeURIComponent(prompt)}`;
      
      const response = await axios.get(apiUrl, {
        timeout: 20000,
        headers: { 'Accept': 'application/json' }
      });

      // 📝 Récupérer la réponse (adapté au format de l'API)
      let reponse = "";
      if (response.data) {
        reponse = response.data.reponse 
               || response.data.message 
               || response.data.answer 
               || response.data.content
               || JSON.stringify(response.data);
      }

      // ✅ Envoyer la réponse
      sendMessage(senderId, {
        text: `🤖 Angela :\n${reponse}`
      }, pageAccessToken);

    } catch (error) {
      console.error("❌ Erreur IA :", error.message);
      
      sendMessage(senderId, {
        text: "😅 Désolée, j'ai un petit problème de connexion... Réessaie dans un instant ! 🙏"
      }, pageAccessToken);
    }
  }
};
