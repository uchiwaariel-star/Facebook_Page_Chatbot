const axios = require('axios');

module.exports = {
  name: 'angela',
  aliases: ['ai', 'chat', 'gpt'],
  description: 'Discuter avec Angela — Intelligence Artificielle',
  author: 'Ariel Aks Otaku',
  async execute(senderId, args, pageAccessToken, sendMessage) {
    const prompt = args.join(' ');
    
    if (!prompt) {
      return sendMessage(senderId, { 
        text: "🤖 Bonjour ! Je suis Angela, créée par Ariel Aks Otaku.\nPose-moi une question ou parle-moi ! 😊" 
      }, pageAccessToken);
    }

    try {
      // ✅ NOUVELLE API — gratuite et fonctionnelle
      const apiUrl = `https://delfaapiai.vercel.app/ai/chatgptfree?q=${encodeURIComponent(prompt)}`;
      const response = await axios.get(apiUrl, { timeout: 15000 });
      
      // Récupérer la réponse (selon format de l'API)
      const reponse = response.data.reponse || response.data.message || response.data.result || JSON.stringify(response.data);
      
      sendMessage(senderId, { text: `🤖 Angela :\n${reponse}` }, pageAccessToken);
      
    } catch (error) {
      console.error('Erreur API :', error.message);
      sendMessage(senderId, { 
        text: "😅 Désolée, j'ai un petit problème de connexion... Réessaie dans un instant ! 🙏" 
      }, pageAccessToken);
    }
  }
};
