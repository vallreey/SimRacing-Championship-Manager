import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'apexsim_supabase_url';
const STORAGE_KEY_KEY = 'apexsim_supabase_anon_key';

let cachedClient: SupabaseClient | null = null;
let cachedUrl = '';
let cachedKey = '';

export function getStoredSupabaseCredentials(): { url: string; anonKey: string } {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_URL) || '' : '';
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_KEY) || '' : '';

  return {
    url: storedUrl || envUrl,
    anonKey: storedKey || envKey,
  };
}

export function saveStoredSupabaseCredentials(url: string, anonKey: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_URL, url.trim());
    localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
  }
  // Reset cache
  cachedClient = null;
}

export function clearStoredSupabaseCredentials(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_KEY);
  }
  cachedClient = null;
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getStoredSupabaseCredentials();

  if (!url || !anonKey) {
    return null;
  }

  if (cachedClient && cachedUrl === url && cachedKey === anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    cachedUrl = url;
    cachedKey = anonKey;
    return cachedClient;
  } catch (error) {
    console.warn('Failed to initialize Supabase client:', error);
    return null;
  }
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{
  success: boolean;
  message: string;
  tablesFound: string[];
}> {
  if (!url || !anonKey) {
    return {
      success: false,
      message: 'Supabase URL and Anon Key are required.',
      tablesFound: [],
    };
  }

  try {
    const testClient = createClient(url.trim(), anonKey.trim());
    const expectedTables = ['drivers', 'tracks', 'cars', 'race_sessions'];
    const tablesFound: string[] = [];

    // Attempt pinging tables
    for (const table of expectedTables) {
      try {
        const { error } = await testClient.from(table).select('id').limit(1);
        if (!error) {
          tablesFound.push(table);
        }
      } catch {
        // table might not exist yet
      }
    }

    if (tablesFound.length > 0) {
      return {
        success: true,
        message: `Successfully connected to Supabase! Detected tables: ${tablesFound.join(', ')}.`,
        tablesFound,
      };
    } else {
      // Check auth health
      const { error: authError } = await testClient.auth.getSession();
      if (!authError) {
        return {
          success: true,
          message: 'Connected to Supabase project! Schema tables not detected yet; execute the SQL schema in the SQL tab to create tables.',
          tablesFound: [],
        };
      }
      return {
        success: false,
        message: 'Could not connect. Please check your Supabase Project URL and Anon Key.',
        tablesFound: [],
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Connection failed. Verify your Supabase URL formatting.',
      tablesFound: [],
    };
  }
}
