import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Database configuration and connection management
 */

let supabaseClient: SupabaseClient | null = null;

/**
 * Initialize Supabase client with environment variables
 */
export function initializeSupabase(): SupabaseClient {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'SUPABASE_URL and SUPABASE_KEY environment variables are required. ' +
      'Please set them in your environment or .env file.'
    );
  }

  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false, // Server-side doesn't need session persistence
      },
    });
    
    console.log('✓ Supabase client initialized successfully');
  }

  return supabaseClient;
}

/**
 * Get Supabase client
 * Initializes the client if not already done
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    return initializeSupabase();
  }
  return supabaseClient;
}

