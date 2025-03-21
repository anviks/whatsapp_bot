import { CHROMIUM_PATH } from './config.js';
import qrcode from 'qrcode-terminal';
import { Client, LocalAuth } from './whatsappWrapper.js';


const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: CHROMIUM_PATH
    ? { executablePath: CHROMIUM_PATH, args: ['--no-sandbox', '--disable-gpu'] }
    : undefined,
});

client.on('qr', (qr: any) => {
  qrcode.generate(qr, { small: true });
});

export default client;
