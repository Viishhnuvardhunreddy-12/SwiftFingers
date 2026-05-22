import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { syncUserToSupabase } from '../services/supabaseService';

/**
 * Hook to automatically sync Clerk user to Supabase
 * Call this in your main App component
 */
export const useSupabaseSync = () => {
  const { user, isLoaded } = useUser();
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  useEffect(() => {
    const syncUser = async () => {
      if (isLoaded && user) {
        console.log('Starting user sync to Supabase...', {
          userId: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          username: user.username
        });
        
        setSyncStatus('syncing');
        
        try {
          const supabaseUserId = await syncUserToSupabase(user);
          setSyncStatus('success');
          console.log('User synced to Supabase successfully!', {
            clerkUserId: user.id,
            supabaseUserId: supabaseUserId
          });
        } catch (error) {
          setSyncStatus('error');
          console.error('Failed to sync user to Supabase:', error);
          
          // Log more details about the error
          if (error instanceof Error) {
            console.error('Error details:', {
              message: error.message,
              stack: error.stack
            });
          }
          
          // Don't throw - app should still work even if sync fails
        }
      } else if (isLoaded && !user) {
        console.log('No user signed in, skipping Supabase sync');
      }
    };

    syncUser();
  }, [user, isLoaded]);

  return { user, isLoaded, syncStatus };
};
