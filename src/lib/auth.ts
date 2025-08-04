export interface AuthState {
  isAuthenticated: boolean;
  credentials: {
    username: string;
    password: string;
  } | null;
}

const AUTH_STORAGE_KEY = 'qa_admin_auth';

export const authStorage = {
  save: (credentials: { username: string; password: string }) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(credentials));
  },
  
  load: (): { username: string; password: string } | null => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  },
  
  clear: () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
};

export const createBasicAuthHeader = (username: string, password: string): string => {
  return `Basic ${btoa(`${username}:${password}`)}`;
};