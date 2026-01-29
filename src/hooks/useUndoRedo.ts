import { useState, useCallback, useEffect } from 'react';

interface UndoRedoState<T> {
  past: T[];
  present: T | null;
  future: T[];
}

export const useUndoRedo = <T>(
  initialState: T | null,
  maxHistory: number = 50
) => {
  const [state, setState] = useState<UndoRedoState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  // Update present when external state changes (but don't add to history)
  const setPresent = useCallback((newPresent: T | null) => {
    setState(prev => ({
      ...prev,
      present: newPresent,
    }));
  }, []);

  // Push a new state to history
  const pushState = useCallback((newState: T) => {
    setState(prev => {
      if (!prev.present) {
        return {
          past: [],
          present: newState,
          future: [],
        };
      }

      // Don't add duplicate states
      if (JSON.stringify(prev.present) === JSON.stringify(newState)) {
        return prev;
      }

      const newPast = [...prev.past, prev.present].slice(-maxHistory);
      return {
        past: newPast,
        present: newState,
        future: [], // Clear future on new action
      };
    });
  }, [maxHistory]);

  // Undo - go back one step
  const undo = useCallback(() => {
    setState(prev => {
      if (prev.past.length === 0) return prev;

      const previous = prev.past[prev.past.length - 1];
      const newPast = prev.past.slice(0, -1);

      return {
        past: newPast,
        present: previous,
        future: prev.present ? [prev.present, ...prev.future] : prev.future,
      };
    });
  }, []);

  // Redo - go forward one step
  const redo = useCallback(() => {
    setState(prev => {
      if (prev.future.length === 0) return prev;

      const next = prev.future[0];
      const newFuture = prev.future.slice(1);

      return {
        past: prev.present ? [...prev.past, prev.present] : prev.past,
        present: next,
        future: newFuture,
      };
    });
  }, []);

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifierKey = isMac ? e.metaKey : e.ctrlKey;

      if (modifierKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (modifierKey && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      } else if (modifierKey && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
    present: state.present,
    pushState,
    setPresent,
    undo,
    redo,
    canUndo,
    canRedo,
  };
};
