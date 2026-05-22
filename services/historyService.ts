
import { DailyStats, WeakKeyStats } from "../types";

const STORAGE_KEY = 'swiftfingers_history_v1';

interface SessionRecord {
  timestamp: number;
  durationSeconds: number;
  charErrors: Record<string, number>;
}

/**
 * Save session data to localStorage
 * For signed-in users, this will be synced to Supabase in the future
 * For anonymous users, data stays local
 */
export const saveSessionData = (durationSeconds: number, charErrors: Record<string, number>, userId?: string) => {
  try {
    // Use user-specific key if authenticated, otherwise use default
    const storageKey = userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY;
    
    const existingData = localStorage.getItem(storageKey);
    const history: SessionRecord[] = existingData ? JSON.parse(existingData) : [];
    
    history.push({
      timestamp: Date.now(),
      durationSeconds,
      charErrors
    });

    // Optional: Limit history size to last 1000 sessions to prevent overflow
    if (history.length > 1000) {
        history.shift();
    }

    localStorage.setItem(storageKey, JSON.stringify(history));
    
    // TODO: If userId exists, also sync to Supabase
    // await syncToSupabase(userId, history);
  } catch (error) {
    console.error("Failed to save session history", error);
  }
};

export const getDailyActivity = (userId?: string): DailyStats[] => {
  try {
    const storageKey = userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY;
    const existingData = localStorage.getItem(storageKey);
    if (!existingData) return [];
    
    const history: SessionRecord[] = JSON.parse(existingData);
    const dailyMap: Record<string, number> = {};

    // Initialize last 7 days with 0
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        dailyMap[dateStr] = 0;
    }

    // Sum up duration
    history.forEach(session => {
        const dateStr = new Date(session.timestamp).toISOString().split('T')[0];
        // Only include if it's within our tracked range (or if we want all time, simply add)
        // Here we just map what we have.
        if (dailyMap[dateStr] !== undefined) {
             dailyMap[dateStr] += session.durationSeconds;
        } else if (new Date(dateStr) > new Date(new Date().setDate(new Date().getDate() - 7))) {
             // Handle edge case where initialized map might miss today if timezone shift
             dailyMap[dateStr] = (dailyMap[dateStr] || 0) + session.durationSeconds;
        }
    });

    return Object.entries(dailyMap).map(([date, seconds]) => ({
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }), // Mon, Tue
        minutes: parseFloat((seconds / 60).toFixed(1))
    }));
  } catch (error) {
    console.error("Failed to get daily activity", error);
    return [];
  }
};

export const getWeakestKeys = (userId?: string): WeakKeyStats[] => {
  try {
    const storageKey = userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY;
    const existingData = localStorage.getItem(storageKey);
    if (!existingData) return [];
    
    const history: SessionRecord[] = JSON.parse(existingData);
    const errorMap: Record<string, number> = {};

    history.forEach(session => {
        Object.entries(session.charErrors).forEach(([char, count]) => {
            errorMap[char] = (errorMap[char] || 0) + count;
        });
    });

    return Object.entries(errorMap)
        .map(([char, count]) => ({ char, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8); // Top 8 weak keys
  } catch (error) {
    console.error("Failed to get weak keys", error);
    return [];
  }
};
