import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@lumina/types';

// Canonical client type — import this in consumers rather than SupabaseClient directly
// to avoid duplicate-declaration mismatches across workspace packages.
export type DbClient = SupabaseClient<Database>;
