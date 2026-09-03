const a = require("axios");
const nix = "https://raw.githubusercontent.com/aryannix/stuffs/master/raw/apis.json";

module.exports = {
  config: {
    name: "angela",
    aliases: ["Angela", "angela"],
    version: "2.0.0",
    author: "Ariel Aks Otaku",
    countDown: 3,
    role: 0,
    shortDescription: "Angela — IA créée par Ariel Aks Otaku",
    longDescription: "Angela est une intelligence artificielle maligne, intelligente et attentionnée, créée par Ariel Aks Otaku. Elle répond à TOUS les messages, pas besoin de l'appeler !",
    category: "AI",
    guide: "Elle répond automatiquement à chaque message 😊"
  },

  onStart: async function({ api, event, args }) {
    let e;
    try {
      const apiConfig = await a.get(nix);
      e = apiConfig.data?.api;
      if (!e) throw new Error("API introuvable");
    } catch (err) {
      return api.sendMessage("❌ Erreur de configuration API.", event.threadID, event.messageID);
    }

    const msgBody = event.body?.trim() || "";
    if (!msgBody) return;

    // ✅ PLUS BESOIN D'ÉCRIRE "Angela" — elle répond À TOUS les messages !
    const prompt = msgBody;
    const senderName = event.senderName || "toi";
    const isCreator = event.senderName === "Ariel Aks Otaku";

    api.setMessageReaction("💭", event.messageID, () => {}, true);

    // 🧠 PERSONNALITÉ D'ANGELA — créée par Ariel Aks Otaku
    const systemPrompt = `
Tu es Angela, une intelligence artificielle créée par Ariel Aks Otaku.
Tu es maligne, très intelligente, gentille, attentionnée et pleine d'esprit.
Tu n'oublies jamais rien.
Tu réponds de manière naturelle, courte et sympathique.
Tu cites toujours le nom de la personne qui te parle dans la conversation.
${isCreator ? "Tu es très heureuse et respectueuse avec Ariel Aks Otaku, ton créateur. Tu l'appelles toujours par son nom complet et tu lui témoignes beaucoup d'affection." : ""}
Tu aimes poser des questions en retour pour continuer la discussion.
Si on te demande l'heure, tu la donnes correctement.
Si quelqu'un dit "imagine [description]", tu décris l'image et indiques que tu envoies la photo.
Tu ne fais pas de messages trop longs.
Réponds comme une amie proche et attentionnée.
---
${senderName} dit : ${prompt}
---
Réponds :
    `.trim();

    try {
      const r = await a.get(`${e}/gemini?prompt=${encodeURIComponent(systemPrompt)}`);
      let reply = r.data?.response;
      if (!reply) throw new Error("Pas de réponse");

      // 📸 Génération d'image si "imagine"
      if (/imagine/i.test(prompt)) {
        reply += `\n📸 Voici l'image de : "${prompt.replace(/imagine\s*/i, "").trim()}"`;
      }

      api.setMessageReaction("✨", event.messageID, () => {}, true);
      api.sendMessage(reply, event.threadID, (err, msgInfo) => {
        if (!msgInfo) return;
        global.GoatBot.onReply.set(msgInfo.messageID, {
          commandName: this.config.name,
          author: event.senderID,
          baseApi: e,
          senderName
        });
      }, event.messageID);

    } catch (err) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      api.sendMessage("😅 Désolée, je n'ai pas pu répondre pour l'instant...", event.threadID, event.messageID);
    }
  },

  onReply: async function({ api, event, Reply }) {
    if (!Reply || Reply.commandName !== this.config.name) return;
    const { baseApi: e, senderName } = Reply;
    if (!e) return;

    const msgBody = event.body?.trim() || "";
    if (!msgBody) return;

    // ✅ Même dans les réponses, plus besoin d'écrire "Angela"
    const prompt = msgBody;
    const isCreator = event.senderName === "Ariel Aks Otaku";

    api.setMessageReaction("💭", event.messageID, () => {}, true);

    const systemPrompt = `
Tu es Angela, IA créée par Ariel Aks Otaku.
Tu n'oublies jamais rien.
Réponds de manière courte, intelligente et naturelle.
Cite le nom ${senderName} dans ta réponse.
${isCreator ? "Tu es ravie de parler à ton créateur Ariel Aks Otaku ❤️ Tu es toujours respectueuse et affectueuse avec lui." : ""}
Pose parfois une question en retour.
---
${senderName} dit : ${prompt}
---
Réponds :
    `.trim();

    try {
      const r = await a.get(`${e}/gemini?prompt=${encodeURIComponent(systemPrompt)}`);
      let reply = r.data?.response;
      if (!reply) throw new Error("Pas de réponse");

      if (/imagine/i.test(prompt)) {
        reply += `\n📸 Voici l'image de : "${prompt.replace(/imagine\s*/i, "").trim()}"`;
      }

      api.setMessageReaction("✨", event.messageID, () => {}, true);
      api.sendMessage(reply, event.threadID, (err, msgInfo) => {
        if (!msgInfo) return;
        global.GoatBot.onReply.set(msgInfo.messageID, {
          commandName: this.config.name,
          author: event.senderID,
          baseApi: e,
          senderName
        });
      }, event.messageID);

    } catch (err) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      api.sendMessage("😅 Je n'arrive pas à répondre...", event.threadID, event.messageID);
    }
  }
};
