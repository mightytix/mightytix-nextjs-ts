export function getSessionStorage(key: string, defaultValue = ''): unknown {
  const stored = sessionStorage.getItem(key);
  if (!stored) {
    return defaultValue;
  }

  return JSON.parse(stored);
}

export function setSessionStorage(key: string, value: unknown) {
  return sessionStorage.setItem(key, JSON.stringify(value));
}

export function removeSessionStorage(key: string) {
  return sessionStorage.removeItem(key);
}
