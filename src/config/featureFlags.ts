export interface FeatureFlags {
  dominoScanner: boolean
}

const getEnv = (): Record<string, string | undefined> => {
  try {
    return (import.meta as unknown as { env?: Record<string, string> }).env ?? {}
  } catch {
    return {}
  }
}

export const featureFlags: FeatureFlags = {
  // Domino Scanner disabled by default in production unless explicitly enabled via env var
  dominoScanner: getEnv().VITE_FF_DOMINO_SCANNER === "true",
}

export const isFeatureEnabled = (flag: keyof FeatureFlags): boolean => {
  return featureFlags[flag] ?? false
}
