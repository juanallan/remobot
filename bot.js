const { default: makeWASocket, useMultiFileAuthState, Browsers } = require('@whiskeysockets/baileys');
const pino = require('pino');
const express = require('express');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
let sock;

async function connect() {
    console.log('--- Iniciando conexão com WhatsApp ---');
    try {
        const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
        sock = makeWASocket({ 
            auth: state, 
            printQRInTerminal: true, 
            logger: pino({ level: 'silent' }), 
            browser: Browsers.macOS('Desktop') 
        });
        
        sock.ev.on('creds.update', saveCreds);
        sock.ev.on('connection.update', (up) => { 
            console.log('Status da conexão:', up);
            if(up.connection === 'open') console.log('✅ Online'); 
        });
    } catch (e) {
        console.log('Erro na função connect:', e);
    }
}

app.listen(PORT, () => {
    console.log('Servidor web rodando na porta ' + PORT);
    connect(); // Chama a conexão aqui
});
