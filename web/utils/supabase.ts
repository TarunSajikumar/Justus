// @ts-nocheck
import { createClient } from '@supabase/supabase-js';

const meta: any = (typeof import.meta !== 'undefined') ? (import.meta as any) : {};
const supabaseUrl = meta?.env?.VITE_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const supabaseKey = meta?.env?.VITE_SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');
