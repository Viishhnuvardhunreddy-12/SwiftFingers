import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';

/**
 * Custom hook that wraps Clerk's authentication
 * Provides user info and auth state for the app
 */
export const useAuth = () => {
  const { isSignedIn, user, isLoaded } = useUser();
  const { signOut } = useClerkAuth();

  return {
    isSignedIn: isSignedIn ?? false,
    isLoading: !isLoaded,
    user: user ? {
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress,
      username: user.username || user.firstName || 'User',
      fullName: user.fullName,
      imageUrl: user.imageUrl,
    } : null,
    signOut,
  };
};
