const { schedulePoll } = require('./pollService');
const client = require('./whatsappClient');


client.on('ready', async () => {
  console.log('✅  Bot is ready!\n');
  await schedulePoll();
});

client.initialize();
