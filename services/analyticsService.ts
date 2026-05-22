import { getUserSessions } from './supabaseService';
import { getDailyActivity as getLocalDailyActivity, getWeakestKeys as getLocalWeakestKeys } from './historyService';
import { DailyStats, WeakKeyStats } from '../types';

/**
 * Get daily activity from Supabase (for signed-in users) or localStorage (for anonymous)
 */
export const getDailyActivityFromSupabase = async (clerkUserId: string): Promise<DailyStats[]> => {
  try {
    console.log('Fetching daily activity from Supabase for user:', clerkUserId);
    
    const sessions = await getUserSessions(clerkUserId, 1000);
    
    if (!sessions || sessions.length === 0) {
      console.log('No sessions found in Supabase, falling back to localStorage');
      return getLocalDailyActivity(clerkUserId);
    }

    console.log(`Found ${sessions.length} sessions in Supabase`);

    // Group by date
    const dailyMap: Record<string, number> = {};

    // Initialize last 7 days with 0
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dailyMap[dateStr] = 0;
    }

    // Sum up duration from Supabase sessions
    sessions.forEach(session => {
      const dateStr = new Date(session.created_at).toISOString().split('T')[0];
      if (dailyMap[dateStr] !== undefined) {
        dailyMap[dateStr] += session.duration_seconds;
      } else if (new Date(dateStr) > new Date(new Date().setDate(new Date().getDate() - 7))) {
        dailyMap[dateStr] = (dailyMap[dateStr] || 0) + session.duration_seconds;
      }
    });

    const result = Object.entries(dailyMap).map(([date, seconds]) => ({
      date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      minutes: parseFloat((seconds / 60).toFixed(1))
    }));

    console.log('Daily activity calculated:', result);
    return result;
  } catch (error) {
    console.error('Error fetching daily activity from Supabase:', error);
    // Fallback to localStorage
    return getLocalDailyActivity(clerkUserId);
  }
};

/**
 * Get weakest keys from Supabase (for signed-in users) or localStorage (for anonymous)
 */
export const getWeakestKeysFromSupabase = async (clerkUserId: string): Promise<WeakKeyStats[]> => {
  try {
    console.log('Fetching weak keys from Supabase for user:', clerkUserId);
    
    const sessions = await getUserSessions(clerkUserId, 1000);
    
    if (!sessions || sessions.length === 0) {
      console.log('No sessions found in Supabase, falling back to localStorage');
      return getLocalWeakestKeys(clerkUserId);
    }

    console.log(`Found ${sessions.length} sessions in Supabase`);

    // Aggregate char errors
    const errorMap: Record<string, number> = {};

    sessions.forEach(session => {
      if (session.char_errors && typeof session.char_errors === 'object') {
        Object.entries(session.char_errors).forEach(([char, count]) => {
          errorMap[char] = (errorMap[char] || 0) + (count as number);
        });
      }
    });

    const result = Object.entries(errorMap)
      .map(([char, count]) => ({ char, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    console.log('Weak keys calculated:', result);
    return result;
  } catch (error) {
    console.error('Error fetching weak keys from Supabase:', error);
    // Fallback to localStorage
    return getLocalWeakestKeys(clerkUserId);
  }
};
