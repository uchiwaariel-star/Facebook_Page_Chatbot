const express = require('express');
const { readFile, readdir, watch } = require('fs/promises');
const { join, resolve } = require('path');
const { handleMessage } = require('./handles/handleMessage');
const { handlePostback } = require('./handles/handlePostback');
const fetch = require('node-fetch'); // ✅ Ajouté ! Manquait → erreur fetch

const app = express();

// 🔑 TES RÉGLAGES — IMPORTANT !
const VERIFY_TOKEN = 'Angela123'; // ⚠️ IDENTIQUE à Meta !
const COMMANDS_PATH = join(__dirname, 'commands');
const GRAPH_API = 'https://graph.facebook.com/v23.0'; // ✅ Corrigé — enlevé /me
let PAGE_ACCESS_TOKEN;

app.use(express.json({ limit: '10mb' }));

// 📥 Charger le jeton depuis token.txt
const loadToken = async () => {
  try {
    PAGE_ACCESS_TOKEN = (await readFile('token.txt', 'utf8')).trim();
    console.log('✅ Jeton chargé');
  } catch (e) {
    console.error('❌ Impossible de lire token.txt:', e.message);
    throw new Error('Crée un fichier token.txt avec ton jeton !');
  }
};

// 📞 Appel API Facebook corrigé
const apiCall = async (endpoint, data) => {
  const url = `${GRAPH_API}${endpoint}?access_token=${encodeURIComponent(PAGE_ACCESS_TOKEN)}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  const result = await response.json();
  if (!response.ok) {
    console.error('❌ Erreur API:', result.error);
    throw new Error(`API Error: ${response.status} — ${result.error?.message}`);
  }
  return result;
};

// 🗑️ Supprimer le menu existant
const clearMenu = async () => {
  try {
    await fetch(`${GRAPH_API}/me/messenger_profile?access_token=${encodeURIComponent(PAGE_ACCESS_TOKEN)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: ['persistent_menu', 'get_started'] })
    });
  } catch (e) {
    console.log('ℹ️ Menu déjà vide ou erreur ignorée');
  }
};

// 📋 Configurer le menu
const setupMenu = async () => {
  try {
    await clearMenu();
    
    const menuItems = [{
      type: 'postback',
      title: 'Aide',
      payload: 'CMD_HELP'
    }];
    
    await apiCall('/me/messenger_profile', {
      get_started: { payload: 'GET_STARTED' },
      persistent_menu: [{
        locale: 'default',
        composer_input_disabled: false,
        call_to_actions: menuItems
      }]
    });

    console.log(`✅ Menu configuré`);
  } catch (e) {
    console.error('❌ Menu setup failed:', e.message);
  }
};

// 👀 Surveiller les commandes
const startWatcher = async () => {
  try {
    const watcher = watch(COMMANDS_PATH);
    for await (const { eventType, filename } of watcher) {
      if (eventType === 'change' && filename?.endsWith('.js')) setupMenu();
    }
  } catch (e) {
    console.log('ℹ️ Surveillance des commandes arrêtée');
  }
};

// ✅ WEBHOOK — VÉRIFICATION (c'est ce que Meta attend !)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ WEBHOOK VÉRIFIÉ PAR META !');
    return res.status(200).send(challenge);
  }
  console.log('❌ Vérification webhook échouée — Token reçu:', token, 'Attendu:', VERIFY_TOKEN);
  res.sendStatus(403);
});

// 📨 RECEVOIR LES MESSAGES
app.post('/webhook', (req, res) => {
  if (req.body.object !== 'page') return res.sendStatus(404);
  
  req.body.entry?.forEach(entry => 
    entry.messaging?.forEach(event => {
      if (event.message) handleMessage(event, PAGE_ACCESS_TOKEN);
      else if (event.postback) handlePostback(event, PAGE_ACCESS_TOKEN);
    })
  );
  
  res.status(200).send('EVENT_RECEIVED');
});

// 🚀 DÉMARRAGE
const start = async () => {
  try {
    await loadToken();
    const PORT = process.env.PORT || 3000;
    
    app.listen(PORT, () => {
      console.log(`🚀 Serveur sur port ${PORT}`);
      setupMenu();
      startWatcher();
    });
  } catch (e) {
    console.error('❌ Échec démarrage:', e.message);
    process.exit(1);
  }
};

start();
