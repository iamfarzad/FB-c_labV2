import cron from 'node-cron';
import { cleanupOldFiles } from './storage-cleanup';

// Schedule cleanup to run every hour
const CRON_SCHEDULE = '0 * * * *'; // Every hour at minute 0
const EXPIRATION_TIME_MS = 60 * 60 * 1000; // 1 hour in milliseconds

console.log('🚀 Starting Supabase Storage Cleanup Scheduler');
console.log(`⏰ Scheduled to run every hour at minute 0`);

// Schedule the cleanup task
const task = cron.schedule(CRON_SCHEDULE, async () => {
  const startTime = new Date();
  console.log(`\n🔄 [${startTime.toISOString()}] Starting storage cleanup...`);
  
  try {
    await cleanupOldFiles(EXPIRATION_TIME_MS);
    const endTime = new Date();
    const duration = (endTime.getTime() - startTime.getTime()) / 1000;
    console.log(`✅ [${endTime.toISOString()}] Cleanup completed in ${duration.toFixed(2)}s`);
  } catch (error) {
    console.error(`❌ [${new Date().toISOString()}] Cleanup failed:`, error);
  }
}, {
  timezone: 'UTC'
});

// Handle process termination
const shutdown = async () => {
  console.log('\n🛑 Shutting down cleanup scheduler...');
  task.stop();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Log when the task is starting
console.log('🏃 Scheduler is running. Press Ctrl+C to stop.');

// Run immediately on startup (optional)
// Uncomment the line below if you want to run the cleanup immediately when the scheduler starts
// cleanupOldFiles(EXPIRATION_TIME_MS).catch(console.error);
