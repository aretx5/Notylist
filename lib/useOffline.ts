import { useState, useEffect } from 'react';
import { isOfflineMode, setOfflineMode } from './offlineStorage';

export function useOffline() {
  const [offline, setOffline] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setOffline(isOfflineMode());
    setIsOnline(navigator.onLine);

    const handleOnline  = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggle = (enabled: boolean) => {
    setOfflineMode(enabled);
    setOffline(enabled);
  };

  return { offline, isOnline, toggle };
}
