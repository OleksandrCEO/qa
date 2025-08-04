import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authStorage, AuthState } from '@/lib/auth';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    credentials: null,
  });

  useEffect(() => {
    const stored = authStorage.load();
    if (stored) {
      setAuthState({
        isAuthenticated: true,
        credentials: stored,
      });
    }
  }, []);

  const login = (username: string, password: string) => {
    const credentials = { username, password };
    authStorage.save(credentials);
    setAuthState({
      isAuthenticated: true,
      credentials,
    });
  };

  const logout = () => {
    authStorage.clear();
    setAuthState({
      isAuthenticated: false,
      credentials: null,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};