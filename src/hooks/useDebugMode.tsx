import { useState, useEffect } from 'react';

export function useDebugMode() {
  const [isDebugMode, setIsDebugMode] = useState(false);

  useEffect(() => {
    // Ativar modo debug se estiver em desenvolvimento
    if (import.meta.env.DEV) {
      setIsDebugMode(true);
      console.log('🐛 Modo debug ativado - ambiente de desenvolvimento');
    }

    // Permitir ativação manual via localStorage
    const debugFlag = localStorage.getItem('psico-debug');
    if (debugFlag === 'true') {
      setIsDebugMode(true);
      console.log('🐛 Modo debug ativado manualmente');
    }

    // Função global para ativar/desativar debug
    (window as any).toggleDebug = () => {
      const newMode = !isDebugMode;
      setIsDebugMode(newMode);
      localStorage.setItem('psico-debug', newMode.toString());
      console.log(`🐛 Modo debug ${newMode ? 'ativado' : 'desativado'} via comando`);
    };

    // Log de informações úteis
    console.log('📱 Informações do sistema:', {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screen: {
        width: screen.width,
        height: screen.height,
        availWidth: screen.availWidth,
        availHeight: screen.availHeight
      },
      window: {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight
      }
    });

  }, [isDebugMode]);

  return {
    isDebugMode,
    toggleDebugMode: () => setIsDebugMode(!isDebugMode),
    logError: (error: any, context?: string) => {
      if (isDebugMode) {
        console.group(`❌ Erro${context ? ` em ${context}` : ''}`);
        console.error('Erro:', error);
        console.trace('Stack trace');
        console.groupEnd();
      }
    },
    logInfo: (message: string, data?: any) => {
      if (isDebugMode) {
        console.log(`ℹ️ ${message}`, data || '');
      }
    },
    logWarning: (message: string, data?: any) => {
      if (isDebugMode) {
        console.warn(`⚠️ ${message}`, data || '');
      }
    }
  };
}