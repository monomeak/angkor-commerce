"use client";

import { useCallback, useEffect, useRef, useState } from "react";
interface UseTypewriterBufferOptions {
  /** Minimum characters revealed per tick. */
  minCharsPerTick?: number;
  /** Maximum characters revealed per tick when the buffer is backed up. */
  maxCharsPerTick?: number;
  /** Milliseconds between reveal ticks. */
  intervalMs?: number;
}

interface UseTypewriterBufferResult {
  /**
   * the text currently visible - grows smoothly regardless of chunk size / timing.
   */
  displayedText: string;

  /**
   * feed newly-arrived text into the reveal queue.
   */
  push: (chunk: string) => void;
  /**
   * Clear everything - call before starting a new generation.
   */
  reset: () => void;
  /**
   * True while queued text is still being revealed - stays true even
   * after the network stream itself has already finished, until the buffer caches up visually
   */
  isRevealing: boolean;
}

/**
 * Real AI streaming responses arrive in uneven chunks over the network —
 * sometimes a whole sentence at once, sometimes a pause, sometimes one
 * word. Rendering exactly as it arrives looks jumpy. This hook decouples
 * "when text arrives" from "when it's shown": incoming chunks go into a
 * queue, and a fixed-interval timer reveals a few characters at a time,
 * producing a steady, natural typing cadence no matter how the network
 * actually delivered it.
 */

export function useTypewriterBuffer(
  options: UseTypewriterBufferOptions = {},
): UseTypewriterBufferResult {
  const {
    minCharsPerTick = 1,
    maxCharsPerTick = 8,
    intervalMs = 20,
  } = options;
  const [displayedText, setDisplayedText] = useState("");
  const [isRevealing, setIsRevealing] = useState(false);

  const queueRef = useRef("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    if (timerRef.current) return;
    setIsRevealing(true);

    timerRef.current = setInterval(() => {
      if (queueRef.current.length === 0) {
        stopTimer();
        setIsRevealing(false);
        return;
      }
      // Catch up progressively when a large network chunk arrives.
      const adaptiveCount = Math.ceil(queueRef.current.length / 40);
      const charsToReveal = Math.min(
        maxCharsPerTick,
        Math.max(minCharsPerTick, adaptiveCount),
      );
      const take = queueRef.current.slice(0, charsToReveal);
      queueRef.current = queueRef.current.slice(charsToReveal);
      setDisplayedText((prev) => prev + take);
    }, intervalMs);
  }, [intervalMs, maxCharsPerTick, minCharsPerTick, stopTimer]);

  const push = useCallback(
    (chunk: string) => {
      queueRef.current += chunk;
      startTimer();
    },
    [startTimer],
  );

  const reset = useCallback(() => {
    stopTimer();
    queueRef.current = "";
    setDisplayedText("");
    setIsRevealing(false);
  }, [stopTimer]);

  // Stop the interval if the component unmounts mid-reveal.

  useEffect(() => stopTimer, [stopTimer]);

  return { displayedText, push, reset, isRevealing };
}
