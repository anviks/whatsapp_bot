const { CHAT_ID, POLL_CRON } = require('./config');
const schedule = require('node-schedule');
const { getPollOptions, getTomorrowWeekday, displayPollResults } = require('./helpers');
const { Poll } = require('whatsapp-web.js');
const client = require('./whatsappClient');
const _ = require('lodash');
const chalk = require('chalk');


let latestPollId = null;
const voteHistory = new Map();

const schedulePoll = async () => {
  const contacts = await client.getContacts();
  const volleyballGroup = contacts.find(contact => contact.id.user === CHAT_ID);
  if (!volleyballGroup) {
    console.error('Volleyball group not found!');
    return;
  }

  schedule.scheduleJob(POLL_CRON, async () => {
    const pollOptions = await getPollOptions();
    if (pollOptions.length === 0) return;

    const poll = new Poll(getTomorrowWeekday(), pollOptions, {
      allowMultipleAnswers: true,
      messageSecret: null,
    });

    const message = await client.sendMessage(volleyballGroup.id._serialized, poll);
    latestPollId = message.id.id;
    voteHistory.clear();

    await client.interface.openChatWindow(volleyballGroup.id._serialized);
  });
};

client.on('vote_update', async (vote) => {
  if (vote.parentMessage.id.id !== latestPollId) return;

  let previousVote = voteHistory.get(vote.voter);
  if (!previousVote) {
    const name = await client.getContactById(vote.voter);
    previousVote = { name: name.name, selection: [] };
  }

  const newSelection = vote.selectedOptions.map((x) => x.name);
  const addedVotes = _.difference(newSelection, previousVote.selection);
  const removedVotes = _.difference(previousVote.selection, newSelection);

  // Log vote update timestamp
  console.log(chalk.grey(`[${new Date().toLocaleTimeString()}]`));

  if (addedVotes.length) {
    console.log(chalk.bgGreen(`+ ${previousVote.name} voted for ${vote.parentMessage.body} ${addedVotes}`));
  }

  if (removedVotes.length) {
    console.log(chalk.bgRed(`- ${previousVote.name} removed vote from ${vote.parentMessage.body} ${removedVotes}`));
  }

  voteHistory.set(vote.voter, { ...previousVote, selection: newSelection });

  displayPollResults(voteHistory);
});

module.exports = { latestPollId, schedulePoll };
