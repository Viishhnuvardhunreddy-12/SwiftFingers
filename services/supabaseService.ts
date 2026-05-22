import { supabase } from '../lib/supabase';
import type { UserResource } from '@clerk/types';

/**
 * Sync Clerk user to Supabase
 * Called when user signs up or signs in
 */
export const syncUserToSupabase = async (clerkUser: UserResource) => {
    try {
        const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('clerk_user_id', clerkUser.id)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            // PGRST116 = no rows returned (user doesn't exist yet)
            console.error('Error fetching user:', fetchError);
            throw fetchError;
        }

        const userData = {
            clerk_user_id: clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress || '',
            username: clerkUser.username || clerkUser.firstName || 'User',
            full_name: clerkUser.fullName || null,
        };

        if (existingUser) {
            // Update existing user
            const { error: updateError } = await supabase
                .from('users')
                .update(userData)
                .eq('clerk_user_id', clerkUser.id);

            if (updateError) {
                console.error('Error updating user:', updateError);
                throw updateError;
            }

            console.log('User updated in Supabase:', clerkUser.id);
            return existingUser.id;
        } else {
            // Insert new user
            const { data: newUser, error: insertError } = await supabase
                .from('users')
                .insert([userData])
                .select()
                .single();

            if (insertError) {
                console.error('Error inserting user:', insertError);
                throw insertError;
            }

            console.log('User created in Supabase:', clerkUser.id);
            return newUser.id;
        }
    } catch (error) {
        console.error('Failed to sync user to Supabase:', error);
        throw error;
    }
};

/**
 * Get Supabase user ID from Clerk user ID
 */
export const getSupabaseUserId = async (clerkUserId: string): Promise<string | null> => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id')
            .eq('clerk_user_id', clerkUserId)
            .single();

        if (error) {
            console.error('Error fetching Supabase user ID:', error);
            return null;
        }

        return data?.id || null;
    } catch (error) {
        console.error('Failed to get Supabase user ID:', error);
        return null;
    }
};

/**
 * Save typing session to Supabase
 */
export const saveSessionToSupabase = async (
    clerkUserId: string,
    sessionData: {
        wpm: number;
        accuracy: number;
        score: number;
        durationSeconds: number;
        gameType: string;
        difficulty: string;
        charErrors: Record<string, number>;
    }
) => {
    console.log('Saving session to Supabase...', {
        clerkUserId,
        wpm: sessionData.wpm,
        accuracy: sessionData.accuracy,
        gameType: sessionData.gameType
    });

    try {
        // Get Supabase user ID
        const supabaseUserId = await getSupabaseUserId(clerkUserId);

        if (!supabaseUserId) {
            console.error('Supabase user not found for Clerk ID:', clerkUserId);
            console.error('Make sure user was synced to Supabase first');
            return null;
        }

        console.log('Found Supabase user ID:', supabaseUserId);

        // Insert session
        const { data, error } = await supabase
            .from('typing_sessions')
            .insert([
                {
                    user_id: supabaseUserId,
                    wpm: sessionData.wpm,
                    accuracy: sessionData.accuracy,
                    score: sessionData.score,
                    duration_seconds: sessionData.durationSeconds,
                    game_type: sessionData.gameType,
                    difficulty: sessionData.difficulty,
                    char_errors: sessionData.charErrors,
                },
            ])
            .select()
            .single();

        if (error) {
            console.error('Error saving session to Supabase:', error);
            console.error('Error details:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            throw error;
        }

        console.log('Session saved to Supabase successfully!', {
            sessionId: data.id,
            wpm: data.wpm,
            accuracy: data.accuracy
        });
        return data;
    } catch (error) {
        console.error('Failed to save session to Supabase:', error);
        throw error;
    }
};

/**
 * Get user's typing sessions from Supabase
 */
export const getUserSessions = async (clerkUserId: string, limit = 100) => {
    try {
        const supabaseUserId = await getSupabaseUserId(clerkUserId);

        if (!supabaseUserId) {
            return [];
        }

        const { data, error } = await supabase
            .from('typing_sessions')
            .select('*')
            .eq('user_id', supabaseUserId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching sessions:', error);
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error('Failed to get user sessions:', error);
        return [];
    }
};

/**
 * Get user statistics
 */
export const getUserStats = async (clerkUserId: string) => {
    try {
        const { data, error } = await supabase
            .from('user_stats')
            .select('*')
            .eq('clerk_user_id', clerkUserId)
            .single();

        if (error) {
            console.error('Error fetching user stats:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Failed to get user stats:', error);
        return null;
    }
};

/**
 * Get leaderboard (top WPM by difficulty)
 */
export const getLeaderboard = async (difficulty?: string, limit = 10) => {
    try {
        let query = supabase
            .from('leaderboard_wpm')
            .select('*')
            .limit(limit);

        if (difficulty) {
            query = query.eq('difficulty', difficulty);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching leaderboard:', error);
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error('Failed to get leaderboard:', error);
        return [];
    }
};
