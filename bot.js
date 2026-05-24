const { default: makeWASocket, useMultiFileAuthState, Browsers } = require('@whiskeysockets/baileys');
const pino = require('pino');
const express = require('express');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
let sock;

async function connect() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
    sock = makeWASocket({ 
        auth: state, 
        logger: pino({ level: 'silent' }), 
        browser: Browsers.macOS('Desktop') 
    });
    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', (up) => { 
        if(up.connection === 'open') console.log('✅ Online'); 
    });
}

app.post('/send', async (req, res) => {
    try {
        const { jid, text } = req.body;
        await sock.sendMessage(jid, { text });
        res.send({ status: 'ok' });
    } catch (error) {
        res.status(500).send({ error: 'Falha' });
    }
});

app.listen(PORT, () => console.log('Rodando na porta ' + PORT));
connect();
