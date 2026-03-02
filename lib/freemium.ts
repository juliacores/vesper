import { SupabaseClient } from '@supabase/supabase-js';

const FREE_GENERATION_LIMIT = 3;

type FreemiumCheck =
  | { allowed: true; used: number; limit: number }
  | { allowed: false; used: number; limit: number; error: string };

export async function checkAndIncrementFreemium(
  supabase: SupabaseClient,
  userId: string
): Promise<FreemiumCheck> {
  const { data: userData, error: fetchError } = await supabase
    .from('users')
    .select('is_premium, free_generations_used')
    .eq('id', userId)
    .single();

  if (fetchError || !userData) {
    return {
      allowed: false,
      used: 0,
      limit: FREE_GENERATION_LIMIT,
      error: 'Could not verify account status.',
    };
  }

  if (userData.is_premium) {
    return { allowed: true, used: userData.free_generations_used ?? 0, limit: FREE_GENERATION_LIMIT };
  }

  const used = userData.free_generations_used ?? 0;

  if (used >= FREE_GENERATION_LIMIT) {
    return {
      allowed: false,
      used,
      limit: FREE_GENERATION_LIMIT,
      error: 'limit_reached',
    };
  }

  const { error: updateError } = await supabase
    .from('users')
    .update({ free_generations_used: used + 1 })
    .eq('id', userId);

  if (updateError) {
    return {
      allowed: false,
      used,
      limit: FREE_GENERATION_LIMIT,
      error: 'Failed to update usage counter.',
    };
  }

  return { allowed: true, used: used + 1, limit: FREE_GENERATION_LIMIT };
}
