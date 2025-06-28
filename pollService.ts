import { CHAT_ID, POLL_CRON } from './config.js';
import schedule from 'node-schedule';
import { getCurrentTime, getTomorrowDate, getTomorrowWeekday } from './helpers.js';
import client from './whatsappClient.js';
import _ from 'lodash';
import chalk from 'chalk';
import { Poll } from './whatsappWrapper.js';
import type { PollVote } from 'whatsapp-web.js';
import type { HopitudeTimetable, VoteHistory } from './types.js';


let latestPollId: string | null = null;
const voteHistory: VoteHistory = new Map();

/** Fetch available time slots for tomorrow */
const getPollOptions = async () => {
  const tomorrow = getTomorrowDate().getTime();
  let response = await fetch(`https://admin.hopitude.com/api/v1/calendar/workout-events/club/66/?from=${tomorrow}&to=${tomorrow}`);
  let responseJson: HopitudeTimetable = await response.json();

  const availableTimes = responseJson.events
    .filter(x => x.title.toLowerCase().includes('ball games'))
    .map(x => x.start_time);

  return _.intersection(availableTimes, ['10:00', '12:00', '14:00']);  // No one goes at 08:00
};

/** Converts vote history to a format suitable for displaying poll results */
const getPollResults = (voteHistory: VoteHistory) => {
  const results: { [key: string]: string[] } = {
    '10:00': [],
    '12:00': [],
    '14:00': [],
  };

  for (const { name, selection } of voteHistory.values()) {
    for (const option of selection) {
      results[option].push(name);
    }
  }

  return results;
};

/** Formats and prints poll results */
const displayPollResults = (voteHistory: VoteHistory) => {
  const pollResults = getPollResults(voteHistory);
  console.log(chalk.blueBright('Latest poll results:'));
  for (const [time, voters] of Object.entries(pollResults)) {
    console.log(`${chalk.yellow('*')} ${time}: ${voters.join(', ')}`);
  }
  console.log();
};

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
      messageSecret: undefined,  // Assigned type requires this to be specified
    });

    const message = await client.sendMessage(volleyballGroup.id._serialized, poll);
    console.log(getCurrentTime());
    console.log(chalk.bold.green(`Sent a poll for ${poll.pollName}\n`));

    latestPollId = message.id.id;
    voteHistory.clear();

    // Required to receive vote updates
    await client.interface.openChatWindow(volleyballGroup.id._serialized);
  });
};

client.on('vote_update', async (vote: PollVote) => {
  // Ensure the vote is from the latest poll
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
