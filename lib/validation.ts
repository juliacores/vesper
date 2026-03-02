const VALID_PERSONAS = ['Lucien', 'Kai', 'Jiro'] as const;
const MAX_VIBE_LENGTH = 100;
const MAX_PREFERENCE_STRING = 500;
const MAX_TRIGGERS = 20;
const MAX_TRIGGER_LENGTH = 100;

type ValidationResult =
  | { valid: true; persona: string; vibe: string; userPreferences: Record<string, any> }
  | { valid: false; error: string };

export function validateGenerationInput(body: any): ValidationResult {
  const { persona, vibe, userPreferences } = body ?? {};

  if (!persona || typeof persona !== 'string') {
    return { valid: false, error: 'persona is required' };
  }

  if (!VALID_PERSONAS.includes(persona as any)) {
    return { valid: false, error: `persona must be one of: ${VALID_PERSONAS.join(', ')}` };
  }

  if (!vibe || typeof vibe !== 'string') {
    return { valid: false, error: 'vibe is required' };
  }

  if (vibe.length > MAX_VIBE_LENGTH) {
    return { valid: false, error: `vibe must be at most ${MAX_VIBE_LENGTH} characters` };
  }

  const prefs = userPreferences ?? {};

  if (prefs.dynamic && typeof prefs.dynamic === 'string' && prefs.dynamic.length > MAX_PREFERENCE_STRING) {
    return { valid: false, error: 'dynamic preference is too long' };
  }
  if (prefs.tone && typeof prefs.tone === 'string' && prefs.tone.length > MAX_PREFERENCE_STRING) {
    return { valid: false, error: 'tone preference is too long' };
  }
  if (prefs.psychology && typeof prefs.psychology === 'string' && prefs.psychology.length > MAX_PREFERENCE_STRING) {
    return { valid: false, error: 'psychology preference is too long' };
  }
  if (prefs.triggers && Array.isArray(prefs.triggers)) {
    if (prefs.triggers.length > MAX_TRIGGERS) {
      return { valid: false, error: `triggers cannot exceed ${MAX_TRIGGERS} items` };
    }
    for (const t of prefs.triggers) {
      if (typeof t !== 'string' || t.length > MAX_TRIGGER_LENGTH) {
        return { valid: false, error: 'each trigger must be a string under 100 characters' };
      }
    }
  }

  return { valid: true, persona, vibe, userPreferences: prefs };
}

export function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs = 30_000
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timeout)
  );
}
