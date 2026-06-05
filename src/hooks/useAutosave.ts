import { useState, useEffect, useRef, useCallback } from 'react';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

/**
 * Custom React hook to handle debounced auto-saves.
 * Prevents redundant writes and coordinates saving states.
 * 
 * @param saveFn The asynchronous save function to execute
 * @param delay Debounce interval in milliseconds (default 5000ms)
 */
export function useAutosave<T>(
  saveFn: (data: T) => Promise<void>,
  delay: number = 5000
) {
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const dataRef = useRef<T | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveFnRef = useRef(saveFn);

  // Keep reference to latest save function to avoid resetting timers
  useEffect(() => {
    saveFnRef.current = saveFn;
  }, [saveFn]);

  // Performs actual save
  const executeSave = useCallback(async () => {
    if (dataRef.current === null) return;
    
    setSaveState('saving');
    try {
      await saveFnRef.current(dataRef.current);
      setSaveState('saved');
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Autosave execution failed:', error);
      setSaveState('error');
    }
  }, []);

  // Triggers when data changes
  const triggerSave = useCallback((newData: T) => {
    dataRef.current = newData;
    setHasUnsavedChanges(true);
    setSaveState('idle');

    // Reset previous timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set new timer
    timerRef.current = setTimeout(() => {
      executeSave();
    }, delay);
  }, [delay, executeSave]);

  // Clean up timers on unmount and save any pending changes
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Save immediately on demand (e.g. user navigation or manual click)
  const forceSave = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (hasUnsavedChanges && dataRef.current !== null) {
      await executeSave();
    }
  }, [hasUnsavedChanges, executeSave]);

  return {
    saveState,
    hasUnsavedChanges,
    triggerSave,
    forceSave,
  };
}
