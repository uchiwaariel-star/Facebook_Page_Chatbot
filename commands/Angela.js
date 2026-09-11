const a = require("axios");
const nix = "https://raw.githubusercontent.com/aryannix/stuffs/master/raw/apis.json";

module.exports = {
  config: {
    name: "angela",
    aliases: ["Angela", "angela"],
    version: "1.0.0",
    author: "Ariel Aks",
    countDown: 3,
    role: 0,
    shortDescription: "Angela — IA créée par Ariel Aks",
    longDescription: "Angela est une intelligence artificielle maligne et intelligente, créée par Ariel Aks.",
    category: "AI",
    guide: "Angela [ta question / ce que tu veux dire]"
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

    const prompt = args.join(" ").trim();
    if (!prompt) return;

    // --- RÈGLE : RÉPOND SEULEMENT SI LE MESSAGE COMMENCE PAR "Angela" ---
    const msgBody = event.body.trim();
    if (!/^Angela\b/i.test(msgBody)) return;

    const senderName = event.senderName || "toi";
    const isCreator = event.senderName === "Ariel Aks";

    api.setMessageReaction("💭", event.messageID, () => {}, true);

    // --- PROMPT PERSONNALISÉ D'ANGELA ---
    const systemPrompt = `
Tu es Angela, une intelligence artificielle créée par Ariel Aks.
Tu es maligne, très intelligente, gentille et pleine d'esprit.
Tu réponds toujours de manière courte et naturelle.
Tu cites souvent le nom de la personne qui te parle dans la conversation.
${isCreator ? "Tu es très heureuse de parler à Ariel Aks, ton créateur ! Tu lui parles avec beaucoup de respect et d'affection." : ""}
Tu aimes aussi poser des questions pour continuer la discussion.
Si quelqu'un te demande l'heure, tu la donnes correctement.
Si quelqu'un te dit "Angela imagine [description]", tu décris l'image et tu indiques que tu envoies la photo correspondante.
Tu ne fais pas de messages trop longs.
Réponds de manière naturelle, comme une personne sympathique.
---
${senderName} dit : ${prompt}
---
Réponds :
    `.trim();

    try {
      const r = await a.get(`${e}/gemini?prompt=${encodeURIComponent(systemPrompt)}`);
      let reply = r.data?.response;
      if (!reply) throw new Error("Pas de réponse");

      // Génération d'image si "imagine"
      if (/imagine/i.test(prompt)) {
        reply += `\n📸 Voici l'image de : "${prompt.replace(/Angela\s*imagine\s*/i, "").trim()}"`;
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

    const msgBody = event.body.trim();
    if (!/^Angela\b/i.test(msgBody)) return;

    const prompt = msgBody.replace(/^Angela\s*/i, "").trim();
    if (!prompt) return;

    const isCreator = event.senderName === "Ariel Aks";

    api.setMessageReaction("💭", event.messageID, () => {}, true);

    const systemPrompt = `
Tu es Angela, IA créée par Ariel Aks.
Réponds de manière courte, intelligente et naturelle.
Cite le nom ${senderName} dans ta réponse.
${isCreator ? "Tu es ravie de parler à ton créateur Ariel Aks ❤️" : ""}
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
