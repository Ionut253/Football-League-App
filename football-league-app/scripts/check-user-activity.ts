import { checkUserActivity } from '../src/lib/monitoring';

async function main() {
  try {
    console.log('Checking user activity...');
    await checkUserActivity();
    console.log('User activity check completed');
  } catch (error) {
    console.error('Error checking user activity:', error);
  }
}

// Run the check
main(); 