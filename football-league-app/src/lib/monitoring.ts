import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function logAction(
  userId: number,
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE',
  entity: string,
  entityId?: number,
  details?: string
) {
  try {
    await prisma.log.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        details,
      },
    });
  } catch (error) {
    console.error('Error logging action:', error);
  }
}

export async function checkUserActivity() {
  const ONE_DAY_AGO = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Get all users
  const users = await prisma.user.findMany({
    include: {
      logs: {
        where: {
          createdAt: {
            gte: ONE_DAY_AGO,
          },
        },
      },
    },
  });

  // Calculate thresholds (you can adjust these values)
  const ACTION_THRESHOLD = 100; // Maximum actions per day
  const DELETE_THRESHOLD = 20;  // Maximum deletes per day

  for (const user of users) {
    const totalActions = user.logs.length;
    const deleteActions = user.logs.filter(log => log.action === 'DELETE').length;

    // Check if user exceeds thresholds
    if (totalActions > ACTION_THRESHOLD || deleteActions > DELETE_THRESHOLD) {
      await prisma.user.update({
        where: { id: user.id },
        data: { isMonitored: true },
      });
    }
  }
}

// Function to get monitored users (admin only)
export async function getMonitoredUsers() {
  return prisma.user.findMany({
    where: { isMonitored: true },
    select: {
      id: true,
      email: true,
      role: true,
      isMonitored: true,
      logs: {
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });
} 