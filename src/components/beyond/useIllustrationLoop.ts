"use client";

import { useEffect, useRef, type FocusEvent, type MouseEvent, type PointerEvent } from "react";
import { createIllustrationPlayback, type IllustrationPlayback } from "./illustrationPlayback";

export type MotionTrack = {
  element: Element;
  keyframes: Keyframe[];
  options?: KeyframeAnimationOptions;
};

/** Keep build stable; frame zero must match the complete resting SVG artwork. */
export function useIllustrationLoop(
  build: (root: HTMLElement) => MotionTrack[],
  durationMs: number,
) {
  const ref = useRef<HTMLDivElement>(null);
  const playback = useRef<IllustrationPlayback | null>(null);
  const pointerType = useRef<string | null>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || !root.animate || typeof IntersectionObserver === "undefined") return;
    if (!Number.isFinite(durationMs) || durationMs <= 0) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const controller = createIllustrationPlayback({
      durationMs,
      timelineTime: () => {
        const time = document.timeline.currentTime;
        return typeof time === "number" ? time : null;
      },
      createAnimations: () => build(root).map(({ element, keyframes, options }) => {
        const animation = element.animate(keyframes, {
          ...options,
          duration: durationMs,
          delay: 0,
          endDelay: 0,
          iterationStart: 0,
          iterations: 1,
          direction: "normal",
          fill: "both",
        });
        animation.pause();
        animation.currentTime = 0;
        return animation;
      }),
    });
    playback.current = controller;
    controller.setReducedMotion(reducedMotion.matches);
    controller.setSuspended("viewport", true);
    controller.setSuspended("document", document.hidden);

    const observer = new IntersectionObserver(([entry]) => {
      controller.setSuspended("viewport", !entry.isIntersecting);
    }, { threshold: 0 });
    const onVisibility = () => controller.setSuspended("document", document.hidden);
    const onReducedMotion = () => controller.setReducedMotion(reducedMotion.matches);
    observer.observe(root);
    document.addEventListener("visibilitychange", onVisibility);
    reducedMotion.addEventListener("change", onReducedMotion);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      reducedMotion.removeEventListener("change", onReducedMotion);
      controller.dispose();
      playback.current = null;
    };
  }, [build, durationMs]);

  return {
    ref,
    onPointerEnter(event: PointerEvent<HTMLDivElement>) {
      if (event.pointerType === "mouse") playback.current?.setIntent("hover", true);
    },
    onPointerLeave(event: PointerEvent<HTMLDivElement>) {
      if (event.pointerType === "mouse") playback.current?.setIntent("hover", false);
    },
    onPointerDown(event: PointerEvent<HTMLDivElement>) {
      pointerType.current = event.pointerType;
      playback.current?.setIntent("focus", false);
    },
    onPointerCancel() {
      pointerType.current = null;
    },
    onFocus(event: FocusEvent<HTMLDivElement>) {
      if (!pointerType.current && event.target.matches(":focus-visible")) {
        playback.current?.setIntent("focus", true);
      }
    },
    onBlur(event: FocusEvent<HTMLDivElement>) {
      if (!event.currentTarget.contains(event.relatedTarget)) {
        playback.current?.setIntent("focus", false);
        pointerType.current = null;
      }
    },
    onClick(event: MouseEvent<HTMLDivElement>) {
      if (pointerType.current === "touch" || pointerType.current === "pen" || event.detail === 0) {
        playback.current?.playOnce();
      }
      pointerType.current = null;
    },
  };
}
