import { db } from './client';
import { habits, categories, habitLogs, targets } from './schema';

export async function seedIfEmpty() {
  const existing = await db.select().from(habits);
  if (existing.length > 0) return;

  await db.insert(categories).values([
    { name: 'Fitness', color: '#22C55E' },
    { name: 'Learning', color: '#3B82F6' },
  ]);

  await db.insert(habits).values([
    { name: 'Morning Run', categoryId: 1 },
    { name: 'Read Book', categoryId: 2 },
  ]);

  await db.insert(habitLogs).values([
    { habitId: 1, date: '2026-04-01', count: 1 },
    { habitId: 2, date: '2026-04-01', count: 2 },
  ]);

  await db.insert(targets).values([
    { habitId: 1, type: 'weekly', value: 5 },
  ]);
}