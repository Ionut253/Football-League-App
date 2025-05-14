import { startMonitoringScheduler } from './monitoring-scheduler';

// Start the monitoring scheduler when this file is imported
console.log('Initializing user activity monitoring...');
startMonitoringScheduler();

export default { initialized: true }; 