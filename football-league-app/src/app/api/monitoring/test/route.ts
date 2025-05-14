import { NextResponse } from 'next/server';
import { checkUserActivity } from '@/lib/monitoring';
import { getMonitoringSchedulerStatus, startMonitoringScheduler, stopMonitoringScheduler } from '@/lib/monitoring-scheduler';

// GET /api/monitoring/test - Run a manual monitoring check for testing
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'start') {
      startMonitoringScheduler();
      return NextResponse.json({ 
        message: 'Monitoring scheduler started', 
        status: getMonitoringSchedulerStatus()
      });
    } else if (action === 'stop') {
      stopMonitoringScheduler();
      return NextResponse.json({ 
        message: 'Monitoring scheduler stopped', 
        status: getMonitoringSchedulerStatus()
      });
    } else if (action === 'status') {
      return NextResponse.json({ 
        status: getMonitoringSchedulerStatus(),
        serverTime: new Date().toISOString()
      });
    } else {
      console.log('[TEST] Running manual monitoring check...');
      await checkUserActivity();
      return NextResponse.json({ 
        message: 'Manual monitoring check completed', 
        time: new Date().toISOString(),
        status: getMonitoringSchedulerStatus()
      });
    }
  } catch (error) {
    console.error('Error in test monitoring endpoint:', error);
    return NextResponse.json({ 
      error: 'Error running monitoring check',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 