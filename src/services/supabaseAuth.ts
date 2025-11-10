import { supabase } from './supabaseClient';

export async function signUp(email: string, password: string) {
  return await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      emailRedirectTo: undefined,
      // Não requer confirmação de email
    }
  });
}

export async function signIn(email: string, password: string) {
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return await supabase.auth.signOut();
}

export function getUser() {
  return supabase.auth.getUser();
}
