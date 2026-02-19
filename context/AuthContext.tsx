import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string) => Promise<void>;
  signup: (email: string, name: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage on mount
    const storedUser = localStorage.getItem('stepzen_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string) => {
    // Simulate API call delay
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        // Simple mock: use the part before @ as the name
        const name = email.split('@')[0];
        // Capitalize first letter of name for better UX
        const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
        
        const newUser = { email, name: formattedName };
        setUser(newUser);
        localStorage.setItem('stepzen_user', JSON.stringify(newUser));
        resolve();
      }, 800);
    });
  };

  const signup = async (email: string, name: string) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const newUser = { email, name };
        setUser(newUser);
        localStorage.setItem('stepzen_user', JSON.stringify(newUser));
        resolve();
      }, 800);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('stepzen_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};