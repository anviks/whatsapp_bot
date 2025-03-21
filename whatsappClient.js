const { CHROMIUM_PATH } = require('./config');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');


const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: CHROMIUM_PATH
    ? { executablePath: CHROMIUM_PATH, args: ['--no-sandbox', '--disable-gpu'] }
    : undefined,
});

client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
});

module.exports = client;
