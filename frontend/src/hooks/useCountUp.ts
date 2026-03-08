"use client";

/**
 * useCountUp — animates a number from 0 to a target value.
 *
 * Uses `requestAnimationFrame` for smooth 60fps animation that
 * respects `prefers-reduced-motion`.
 *
 * @param target  The final value to count up to.
 * @param durationMs  Animation duration in milliseconds (default 1200).
 * @returns The current animated value.
 */

import { useEffect, useRef, useState } from "react";

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function useCountUp(target: number, durationMs = 1200): number {
  const [value, setValue] = useState(0);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  useEffect(() => {
    const effectiveDuration = prefersReducedMotion.current ? 0 : durationMs;
    let frameId: number;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(
        effectiveDuration > 0 ? elapsed / effectiveDuration : 1,
        1,
      );
      const eased = easeOutCubic(progress);

      setValue(eased * target);

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    }

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [target, durationMs]);

  return value;
}
