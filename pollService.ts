import { CHAT_ID, POLL_CRON } from './config.js';
import schedule from 'node-schedule';
import { displayPollResults, getCurrentTime, getPollOptions, getTomorrowWeekday } from './helpers.js';
import client from './whatsappClient.js';
import _ from 'lodash';
import chalk from 'chalk';
import { Poll } from './whatsappWrapper.js';


let latestPollId: string | null = null;
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
      messageSecret: undefined
    });

    const message = await client.sendMessage(volleyballGroup.id._serialized, poll);
    console.log(getCurrentTime());
    console.log(chalk.bold.green(`Sent a poll for ${poll.pollName}\n`));

    latestPollId = message.id.id;
    voteHistory.clear();

    await client.interface.openChatWindow(volleyballGroup.id._serialized);
  });
};

client.on('vote_update', async (vote) => {
  if (vote.parentMessage.id.id !== latestPollId) return;

  let previousVote = voteHistory.get(vote.voter);
  if (!previousVote) {
    const contact = await client.getContactById(vote.voter);
    const contactName = contact.name || contact.pushname;
    previousVote = { name: contactName, selection: [] };
  }

  const newSelection = vote.selectedOptions.map((x) => x.name);
  const addedVotes = _.difference(newSelection, previousVote.selection);
  const removedVotes = _.difference(previousVote.selection, newSelection);

  console.log(getCurrentTime());

  if (addedVotes.length) {
    console.log(chalk.bgGreen(`+ ${previousVote.name} voted for ${vote.parentMessage.body} ${addedVotes}`));
  }

  if (removedVotes.length) {
    console.log(chalk.bgRed(`- ${previousVote.name} removed vote from ${vote.parentMessage.body} ${removedVotes}`));
  }

  voteHistory.set(vote.voter, { ...previousVote, selection: newSelection });

  displayPollResults(voteHistory);
});

export { latestPollId, schedulePoll };
