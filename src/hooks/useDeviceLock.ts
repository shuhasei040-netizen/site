import { useState, useEffect, useCallback, useRef } from 'react';

export interface DeviceLockConfig {
  wakeLockEnabled: boolean; // Prevent device screen auto-lock / sleep
  appLockEnabled: boolean;  // Require PIN to access dashboard
  pinCode: string;          // 4-digit PIN (default "0000")
  autoLockOnBlur: boolean;  // Lock app when user switches tabs or minimizes
  lockTimeoutMinutes: number; // Lock after X minutes of inactivity (0 = disabled)
}

const DEFAULT_CONFIG: DeviceLockConfig = {
  wakeLockEnabled: true, // Default to keeping screen awake for sentinel ops
  appLockEnabled: false,
  pinCode: '1234',
  autoLockOnBlur: false,
  lockTimeoutMinutes: 0,
};

export function useDeviceLock() {
  const [config, setConfig] = useState<DeviceLockConfig>(() => {
    try {
      const saved = localStorage.getItem('aegis_device_lock_config');
      if (saved) return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
    } catch (e) {
      console.warn('Failed to parse device lock config', e);
    }
    return DEFAULT_CONFIG;
  });

  const [isWakeLockActive, setIsWakeLockActive] = useState<boolean>(false);
  const [wakeLockSupported, setWakeLockSupported] = useState<boolean>(false);
  const [isAppLocked, setIsAppLocked] = useState<boolean>(false);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  
  const wakeLockSentinelRef = useRef<any>(null);

  // Check Wake Lock support
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
      setWakeLockSupported(true);
    }
  }, []);

  // Save config changes
  useEffect(() => {
    try {
      localStorage.setItem('aegis_device_lock_config', JSON.stringify(config));
    } catch (e) {
      console.error(e);
    }
  }, [config]);

  // Request or Release Wake Lock
  const requestWakeLock = useCallback(async () => {
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) return false;
    try {
      wakeLockSentinelRef.current = await (navigator as any).wakeLock.request('screen');
      setIsWakeLockActive(true);
      wakeLockSentinelRef.current.addEventListener('release', () => {
        setIsWakeLockActive(false);
      });
      return true;
    } catch (err: any) {
      console.warn('Wake Lock request error:', err.message);
      setIsWakeLockActive(false);
      return false;
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockSentinelRef.current) {
      try {
        await wakeLockSentinelRef.current.release();
        wakeLockSentinelRef.current = null;
      } catch (err) {
        console.warn('Wake lock release error', err);
      }
      setIsWakeLockActive(false);
    }
  }, []);

  // Manage Wake Lock based on config and visibility
  useEffect(() => {
    if (config.wakeLockEnabled) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && config.wakeLockEnabled) {
        requestWakeLock();
      }
      if (document.visibilityState === 'hidden') {
        if (config.appLockEnabled && config.autoLockOnBlur) {
          setIsAppLocked(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseWakeLock();
    };
  }, [config.wakeLockEnabled, config.appLockEnabled, config.autoLockOnBlur, requestWakeLock, releaseWakeLock]);

  // Inactivity timeout checker
  useEffect(() => {
    if (!config.appLockEnabled || config.lockTimeoutMinutes <= 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedMinutes = (now - lastActivity) / (1000 * 60);
      if (elapsedMinutes >= config.lockTimeoutMinutes) {
        setIsAppLocked(true);
      }
    }, 15000);

    const recordActivity = () => setLastActivity(Date.now());
    window.addEventListener('mousemove', recordActivity);
    window.addEventListener('keydown', recordActivity);
    window.addEventListener('touchstart', recordActivity);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', recordActivity);
      window.removeEventListener('keydown', recordActivity);
      window.removeEventListener('touchstart', recordActivity);
    };
  }, [config.appLockEnabled, config.lockTimeoutMinutes, lastActivity]);

  const toggleWakeLock = async () => {
    const nextVal = !config.wakeLockEnabled;
    setConfig(prev => ({ ...prev, wakeLockEnabled: nextVal }));
    if (nextVal) {
      await requestWakeLock();
    } else {
      await releaseWakeLock();
    }
  };

  const lockAppNow = () => {
    if (config.appLockEnabled) {
      setIsAppLocked(true);
    }
  };

  const unlockApp = (pin: string) => {
    if (pin === config.pinCode) {
      setIsAppLocked(false);
      setLastActivity(Date.now());
      return true;
    }
    return false;
  };

  const updateConfig = (newCfg: Partial<DeviceLockConfig>) => {
    setConfig(prev => ({ ...prev, ...newCfg }));
  };

  return {
    config,
    updateConfig,
    wakeLockSupported,
    isWakeLockActive,
    toggleWakeLock,
    isAppLocked,
    lockAppNow,
    unlockApp,
  };
}
