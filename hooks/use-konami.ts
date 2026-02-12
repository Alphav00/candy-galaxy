'use client';

import { useEffect, useCallback } from 'react';

// Konami Code: Up Up Down Down Left Right Left Right B A
const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'KeyB',
  'KeyA',
];

interface UseKonamiCodeOptions {
  onActivate: () => void;
}

export function useKonamiCode({ onActivate }: UseKonamiCodeOptions) {
  const checkCode = useCallback((inputSequence: string[]) => {
    if (inputSequence.length === KONAMI_CODE.length) {
      const match = inputSequence.every((key, index) => key === KONAMI_CODE[index]);
      return match;
    }
    return false;
  }, []);

  useEffect(() => {
    const inputSequence: string[] = [];

    const handleKeyDown = (event: KeyboardEvent) => {
      // Add the key to the sequence
      inputSequence.push(event.code);

      // Keep only the last N keys
      if (inputSequence.length > KONAMI_CODE.length) {
        inputSequence.shift();
      }

      // Check if the sequence matches
      if (checkCode(inputSequence)) {
        onActivate();
        inputSequence.length = 0; // Clear after activation
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onActivate, checkCode]);
}
