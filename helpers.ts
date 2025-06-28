import chalk from 'chalk';


const getCurrentTime = () => chalk.grey(`[${new Date().toLocaleTimeString('et-EE')}]`);

const getTomorrowDate = () => {
  const nextDay = new Date();
  nextDay.setDate(nextDay.getDate() + 1);
  return nextDay;
};

const getTomorrowWeekday = () =>
  getTomorrowDate().toLocaleDateString('en-US', { weekday: 'long' });


export { getCurrentTime, getTomorrowDate, getTomorrowWeekday };
