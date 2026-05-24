const { default: makeWASocket, useMultiFileAuthState, Browsers } = require('@whiskeysockets/baileys');
const pino = require('pino');
const express = require('express');
const app = express();

const PORT = process.env.PORT || 8080;

async function startBot() {
    console.log('--- Iniciando o Bot ---');
    
    // Cria a pasta de sessão automaticamente
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
    
    const sock = makeWASocket({ 
        auth: state,
        logger: pino({ level: 'silent' }), // Deixamos silent para não poluir o log
        browser: Browsers.macOS('Desktop')
    });

    sock.ev.on('creds.update', saveCreds);
    
    sock.ev.on('connection.update', (update) => {
        const { connection, qr } = update;
        
        if (qr) {
            console.log('--- QR CODE GERADO ---');
            console.log('Copie este link e cole no navegador para ver o QR Code:');
            console.log('https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=' + encodeURIComponent(qr));
        }
        
        if (connection === 'open') {
            console.log('✅ Bot conectado com sucesso!');
        } else if (connection === 'close') {
            console.log('Conexão fechada, reiniciando...');
            startBot();
        }
    });
}

app.get('/', (req, res) => res.send('Bot online!'));
app.listen(PORT, () => {
    console.log('Servidor rodando na porta ' + PORT);
    startBot();
});
