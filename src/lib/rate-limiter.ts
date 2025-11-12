import { Intervention, Reclamation } from './models';

export async function checkRateLimit(userId: string): Promise<boolean> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const interventionCount = await Intervention.countDocuments({
    userId,
    createdAt: { $gte: startOfDay }
  });

  const reclamationCount = await Reclamation.countDocuments({
    userId,
    createdAt: { $gte: startOfDay }
  });

  return (interventionCount + reclamationCount) < 15;
}
