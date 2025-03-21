import { schedulePoll } from './pollService.js';
import client from './whatsappClient.js';


client.on('ready', async () => {
  console.log('✅  Bot is ready!\n');
  await schedulePoll();
});

client.initialize();
