type SupabaseMutationResult<T> = {
  data: T | null;
  error: unknown;
};

export function getSupabaseErrorMessage(error: unknown): string {
  if (!error) return 'Supabase request failed.';
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null) {
    const candidate = error as { message?: unknown; details?: unknown; hint?: unknown; code?: unknown };
    const parts = [candidate.message, candidate.details, candidate.hint, candidate.code]
      .filter(Boolean)
      .map(String);
    if (parts.length > 0) return parts.join(' ');
  }
  return String(error);
}

export async function requireSupabaseResult<T>(
  promise: PromiseLike<SupabaseMutationResult<T>>,
  fallbackMessage = 'Supabase request failed.',
): Promise<T | null> {
  const { data, error } = await promise;
  if (error) {
    throw new Error(getSupabaseErrorMessage(error) || fallbackMessage);
  }
  return data;
}

export async function requireSupabaseWrite<T>(
  promise: PromiseLike<SupabaseMutationResult<T>>,
  fallbackMessage = 'Supabase write failed.',
): Promise<T | null> {
  return requireSupabaseResult(promise, fallbackMessage);
}
