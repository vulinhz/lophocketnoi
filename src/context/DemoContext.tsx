import React, { createContext, useContext, useEffect, useState } from 'react';
import type { DemoAccount, DemoDatabaseState } from '../types/domain';
import { demoStorageService } from '../services/demoStorageService';
import { demoAuthService } from '../services/demoAuthService';
import { aiService, type AiServiceStatus } from '../services/aiService';

interface DemoContextValue {
  db: DemoDatabaseState;
  currentUser: DemoAccount | null;
  aiStatus: AiServiceStatus;
  loginWithCredentials: (
    email: string,
    password: string,
  ) => { ok: true; account: DemoAccount } | { ok: false; error: string };
  quickLogin: (accountId: string) => void;
  logout: () => void;
  resetDemoData: () => void;
  refreshAiStatus: () => Promise<void>;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<DemoDatabaseState>(() =>
    demoStorageService.getState(),
  );
  const [currentUser, setCurrentUser] = useState<DemoAccount | null>(() =>
    demoAuthService.getCurrentUser(),
  );
  const [aiStatus, setAiStatus] = useState<AiServiceStatus>({
    geminiAvailable: false,
    checked: false,
    model: 'gemini-4-hydrogen',
  });

  useEffect(() => {
    const unsubStorage = demoStorageService.subscribe(() => {
      setDb(demoStorageService.getState());
    });
    const unsubAuth = demoAuthService.subscribe(() => {
      setCurrentUser(demoAuthService.getCurrentUser());
    });
    aiService.checkStatus().then(setAiStatus).catch(() => {});
    return () => {
      unsubStorage();
      unsubAuth();
    };
  }, []);

  const loginWithCredentials = (email: string, password: string) => {
    return demoAuthService.loginWithCredentials(email, password);
  };

  const quickLogin = (accountId: string) => {
    demoAuthService.quickLoginById(accountId);
  };

  const logout = () => {
    demoAuthService.logout();
  };

  const resetDemoData = () => {
    demoStorageService.resetDemoData();
  };

  const refreshAiStatus = async () => {
    const next = await aiService.checkStatus(true);
    setAiStatus(next);
  };

  return (
    <DemoContext.Provider
      value={{
        db,
        currentUser,
        aiStatus,
        loginWithCredentials,
        quickLogin,
        logout,
        resetDemoData,
        refreshAiStatus,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) {
    throw new Error('useDemo must be used within DemoProvider');
  }
  return ctx;
}
