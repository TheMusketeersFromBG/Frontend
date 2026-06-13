import AsyncStorage from '@react-native-async-storage/async-storage';

// Backend base URL. Override via EXPO_PUBLIC_API_URL for devices/emulators that
// can't reach 127.0.0.1 (e.g. EXPO_PUBLIC_API_URL=http://10.0.2.2:8000 on the
// Android emulator, or http://<lan-ip>:8000 on a physical device).
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000';

const ACCESS_TOKEN_KEY = 'aisi_access_token';
const REFRESH_TOKEN_KEY = 'aisi_refresh_token';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function getAccessToken(): Promise<string | null> {
  return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
}

export async function setTokens(accessToken: string, refreshToken: string): Promise<void> {
  await AsyncStorage.multiSet([
    [ACCESS_TOKEN_KEY, accessToken],
    [REFRESH_TOKEN_KEY, refreshToken],
  ]);
  notifyAuthChange();
}

export async function clearTokens(): Promise<void> {
  await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
  notifyAuthChange();
}

// Lets data hooks re-fetch whenever the user logs in, logs out or registers,
// without having to thread an `isLoggedIn` flag through every hook.
type AuthListener = () => void;
const authListeners = new Set<AuthListener>();

export function subscribeAuthChange(listener: AuthListener): () => void {
  authListeners.add(listener);
  return () => authListeners.delete(listener);
}

function notifyAuthChange(): void {
  authListeners.forEach((listener) => listener());
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) {
      await clearTokens();
      return null;
    }
    const data = await res.json();
    await setTokens(data.access_token, data.refresh_token);
    return data.access_token as string;
  } catch {
    return null;
  }
}

interface ApiRequestOptions {
  method?: string;
  body?: unknown;
  /** Set to false for endpoints that don't require (or must not send) a bearer token. Default true. */
  auth?: boolean;
}

export async function apiRequest<T = unknown>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = options;

  if (auth && !(await getAccessToken())) {
    throw new ApiError(401, 'Не сте влезли в профила си');
  }

  const buildHeaders = async (): Promise<Record<string, string>> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (auth) {
      const token = await getAccessToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  };

  const doFetch = () =>
    buildHeaders().then((headers) =>
      fetch(`${API_BASE_URL}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      })
    );

  let res = await doFetch();

  if (res.status === 401 && auth) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }
    const newToken = await refreshPromise;
    if (newToken) res = await doFetch();
  }

  if (!res.ok) {
    let detail = res.statusText || `HTTP ${res.status}`;
    try {
      const data = await res.json();
      if (data?.detail) detail = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
    } catch {
      // response had no JSON body
    }
    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
