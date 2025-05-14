import { checkUserActivity } from './monitoring';

// Configuration for the monitoring scheduler
const SCHEDULER_CONFIG = {
  // Interval between monitoring runs (in milliseconds)
  interval: 15 * 60 * 1000, // 15 minutes (for testing)
  isRunning: false,
  timer: null as NodeJS.Timeout | null,
};

/**
 * Starts the background monitoring process
 */
export function startMonitoringScheduler() {
  if (SCHEDULER_CONFIG.isRunning) {
    console.log('Monitoring scheduler is already running');
    return;
  }

  console.log('Starting monitoring scheduler...');
  
  // Run monitoring immediately
  checkUserActivity().catch(error => {
    console.error('Error in scheduled monitoring:', error);
  });
  
  // Schedule periodic monitoring
  SCHEDULER_CONFIG.timer = setInterval(() => {
    console.log('[MONITORING] Running scheduled check...');
    checkUserActivity().catch(error => {
      console.error('Error in scheduled monitoring:', error);
    });
  }, SCHEDULER_CONFIG.interval);
  
  SCHEDULER_CONFIG.isRunning = true;
  console.log(`Monitoring scheduler started with interval: ${SCHEDULER_CONFIG.interval / 60000} minutes`);
}

/**
 * Stops the background monitoring process
 */
export function stopMonitoringScheduler() {
  if (!SCHEDULER_CONFIG.isRunning || !SCHEDULER_CONFIG.timer) {
    console.log('Monitoring scheduler is not running');
    return;
  }
  
  clearInterval(SCHEDULER_CONFIG.timer);
  SCHEDULER_CONFIG.timer = null;
  SCHEDULER_CONFIG.isRunning = false;
  console.log('Monitoring scheduler stopped');
}

/**
 * Returns the current status of the monitoring scheduler
 */
export function getMonitoringSchedulerStatus() {
  return {
    isRunning: SCHEDULER_CONFIG.isRunning,
    interval: SCHEDULER_CONFIG.interval,
    intervalMinutes: SCHEDULER_CONFIG.interval / 60000,
  };
} 