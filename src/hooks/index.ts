'use client';

import { useState, useEffect } from 'react';
import type { SideShiftShift } from '@/lib/types';
import { sideShiftClient } from '@/lib/sideshift';

interface UseSideShiftPollingOptions {
  intervalMs?: number;
  enabled?: boolean;
}

export function useSideShiftPolling(
  shiftId: string | null,
  options: UseSideShiftPollingOptions = {}
) {
  const { intervalMs = 10000, enabled = true } = options;
  const [shift, setShift] = useState<SideShiftShift | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!shiftId || !enabled) return;

    let isMounted = true;

    const fetchShift = async () => {
      try {
        setIsLoading(true);
        const data = await sideShiftClient.getShift(shiftId);
        if (isMounted) {
          setShift(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch shift'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Initial fetch
    fetchShift();

    // Set up polling
    const interval = setInterval(fetchShift, intervalMs);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [shiftId, intervalMs, enabled]);

  const refresh = async () => {
    if (!shiftId) return;
    
    try {
      setIsLoading(true);
      const data = await sideShiftClient.getShift(shiftId);
      setShift(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch shift'));
    } finally {
      setIsLoading(false);
    }
  };

  return { shift, isLoading, error, refresh };
}

export function useSmartAccountBalance(address: string | null) {
  const [balance, setBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!address) return;

    const fetchBalance = async () => {
      try {
        setIsLoading(true);
        const { zeroDevClient } = await import('@/lib/zerodev');
        const bal = await zeroDevClient.getBalance(address as `0x${string}`);
        setBalance(bal);
      } catch (err) {
        console.error('Failed to fetch balance:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [address]);

  return { balance, isLoading };
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  };

  return [storedValue, setValue] as const;
}
