import { supabase } from './supabaseClient';

export async function inserirUsuario({ id, name, email, username }: { id: string, name: string, email: string, username: string }) {
  return await supabase.from('usuarios').insert([
    { id, nome: name, email, username }
  ]);
}
