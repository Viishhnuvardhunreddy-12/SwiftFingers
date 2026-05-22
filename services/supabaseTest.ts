import { supabase } from '../lib/supabase';

/**
 * Test Supabase connection
 * Run this to verify Supabase is configured correctly
 */
export const testSupabaseConnection = async () => {
  console.log('Testing Supabase connection...');
  
  try {
    // Test 1: Check if Supabase client is initialized
    if (!supabase) {
      console.error('Supabase client not initialized');
      return false;
    }
    console.log('Supabase client initialized');

    // Test 2: Try to query users table
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Error querying users table:', error);
      return false;
    }
    
    console.log('Successfully queried users table');
    console.log('Current user count:', data);

    // Test 3: Check environment variables
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase environment variables not set');
      console.error('Missing:', {
        url: !supabaseUrl,
        key: !supabaseKey
      });
      return false;
    }
    
    console.log('Environment variables configured');
    console.log('Supabase URL:', supabaseUrl);

    return true;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return false;
  }
};

/**
 * Test user insertion (without Clerk)
 * Use this to test if RLS policies are blocking inserts
 */
export const testUserInsert = async () => {
  console.log('Testing user insert...');
  
  try {
    const testUser = {
      clerk_user_id: 'test_' + Date.now(),
      email: 'test@example.com',
      username: 'testuser',
      full_name: 'Test User'
    };

    const { data, error } = await supabase
      .from('users')
      .insert([testUser])
      .select()
      .single();

    if (error) {
      console.error('Error inserting test user:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return false;
    }

    console.log('Test user inserted successfully:', data);

    // Clean up test user
    await supabase
      .from('users')
      .delete()
      .eq('id', data.id);
    
    console.log('Test user cleaned up');

    return true;
  } catch (error) {
    console.error('Test user insert failed:', error);
    return false;
  }
};
