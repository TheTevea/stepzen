'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

type AlertType = 'success' | 'error' | 'info';

interface AlertState {
  message: string;
  type: AlertType;
  visible: boolean;
}

interface AlertContextType {
  alert: AlertState | null;
  showAlert: (message: string, type?: AlertType) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alert, setAlert] = useState<AlertState | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const hideAlert = useCallback(() => {
    setAlert(prev => prev ? { ...prev, visible: false } : null);
    // Remove from DOM after exit animation
    setTimeout(() => setAlert(null), 300);
  }, []);

  const showAlert = useCallback((message: string, type: AlertType = 'info') => {
    // Clear any existing timer
    if (timerRef.current) clearTimeout(timerRef.current);

    setAlert({ message, type, visible: true });

    // Auto-dismiss after 3.5s
    timerRef.current = setTimeout(() => {
      hideAlert();
    }, 3500);
  }, [hideAlert]);

  return (
    <AlertContext.Provider value={{ alert, showAlert, hideAlert }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};
