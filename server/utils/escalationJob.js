import cron from 'node-cron';
import Case from '../models/Case.js';

const isWorkingDay = (date) => {
  const day = date.getDay();
  return day !== 0 && day !== 6;
};

const addWorkingDays = (date, days) => {
  let count = 0;
  let current = new Date(date);
  while (count < days) {
    current.setDate(current.getDate() + 1);
    if (isWorkingDay(current)) count++;
  }
  return current;
};

const runEscalationJob = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      const cases = await Case.find({
        status: { $in: ['Assigned', 'In Progress'] },
      });

      for (const c of cases) {
        const escalationDate = addWorkingDays(c.lastResponseAt, 7);
        if (new Date() >= escalationDate) {
          c.status = 'Escalated';
          await c.save();
        }
      }

      console.log('Escalation job ran successfully');
    } catch (error) {
      console.error('Escalation job error:', error.message);
    }
  });
};

export default runEscalationJob;