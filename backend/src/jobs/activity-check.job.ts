import cron from 'node-cron';
import { checkWeeklyActivity } from '../services/activity.service';

export function startActivityCheckJob() {
  const cronExpr = process.env.ACTIVITY_CHECK_CRON || '0 0 * * 0';
  cron.schedule(cronExpr, async () => {
    console.log('Running weekly activity check...');
    try {
      await checkWeeklyActivity();
      console.log('Activity check completed');
    } catch (err) {
      console.error('Activity check failed:', err);
    }
  });
  console.log(`Activity check job scheduled: ${cronExpr}`);
}

export async function runActivityCheckManually() {
  await checkWeeklyActivity();
}
