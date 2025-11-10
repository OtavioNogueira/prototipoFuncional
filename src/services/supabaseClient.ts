import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uatrfvuybjbrspdukvme.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhdHJmdnV5YmpicnNwZHVrdm1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MzEyNzksImV4cCI6MjA3ODEwNzI3OX0.xypgOjrqm7lxmkjmMryMdRVjy3AGtW1r3--Tu0WPBDA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
