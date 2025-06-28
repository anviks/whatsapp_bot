import _ from 'lodash';
import chalk from 'chalk';
import { HopitudeTimetable, VoteHistory } from './types.js';


const getCurrentTime = () => chalk.grey(`[${new Date().toLocaleTimeString('et-EE')}]`);

const getTomorrowDate = () => {
  const nextDay = new Date();
  nextDay.setDate(nextDay.getDate() + 1);
  return nextDay;
};

const getTomorrowWeekday = () =>
  getTomorrowDate().toLocaleDateString('en-US', { weekday: 'long' });

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


export { getTomorrowWeekday, getPollOptions, displayPollResults, getCurrentTime };
