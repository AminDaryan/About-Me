type Intent = "hover" | "focus";
type Suspension = "viewport" | "document";

type PlaybackOptions = {
  durationMs: number;
  createAnimations: () => Animation[];
  timelineTime: () => number | null;
};

/** Coordinates browser timelines; React never participates in frame updates. */
export function createIllustrationPlayback({
  durationMs,
  createAnimations,
  timelineTime,
}: PlaybackOptions) {
  const intents = new Set<Intent>();
  const suspensions = new Set<Suspension>();
  let animations: Animation[] = [];
  let active = false;
  let paused = false;
  let requestedCycle = false;
  let reducedMotion = false;
  let disposed = false;

  function cancel() {
    for (const animation of animations) {
      animation.onfinish = null;
      animation.cancel();
    }
    animations = [];
    active = false;
    paused = false;
  }

  function playTogether(time: number) {
    const now = timelineTime();
    for (const animation of animations) {
      animation.currentTime = time;
      animation.play();
      if (now !== null) animation.startTime = now - time;
    }
    paused = false;
  }

  function applyBoundary() {
    const currentTime = animations[0]?.currentTime;
    const elapsed = typeof currentTime === "number" ? currentTime : 0;
    // A finite iteration count lets the browser stop exactly at the loop seam.
    const iterations = intents.size > 0
      ? Infinity
      : Math.max(1, Math.ceil(elapsed / durationMs));
    for (const animation of animations) {
      animation.effect?.updateTiming({ iterations });
    }
  }

  function reconcile() {
    if (disposed || reducedMotion) return;

    if (!active) {
      if (suspensions.size > 0 || (!intents.size && !requestedCycle)) return;
      animations = createAnimations();
      requestedCycle = false;
      if (!animations.length) return;
      active = true;
      animations[0].onfinish = () => {
        if (!active || disposed || intents.size > 0 || animations[0]?.playState !== "finished") return;
        cancel();
      };
      applyBoundary();
      playTogether(0);
      return;
    }

    requestedCycle = false;
    applyBoundary();
    if (suspensions.size > 0) {
      if (!paused) {
        for (const animation of animations) animation.pause();
        paused = true;
      }
    } else if (paused) {
      const time = animations[0].currentTime;
      playTogether(typeof time === "number" ? time : 0);
    }
  }

  return {
    setIntent(intent: Intent, enabled: boolean) {
      if (disposed) return;
      if (enabled) intents.add(intent);
      else intents.delete(intent);
      reconcile();
    },
    playOnce() {
      if (disposed || reducedMotion) return;
      requestedCycle = true;
      reconcile();
    },
    setSuspended(reason: Suspension, suspended: boolean) {
      if (disposed) return;
      if (suspended) suspensions.add(reason);
      else suspensions.delete(reason);
      reconcile();
    },
    setReducedMotion(reduced: boolean) {
      if (disposed) return;
      reducedMotion = reduced;
      if (reduced) {
        requestedCycle = false;
        cancel();
      } else {
        reconcile();
      }
    },
    dispose() {
      disposed = true;
      intents.clear();
      requestedCycle = false;
      cancel();
    },
  };
}

export type IllustrationPlayback = ReturnType<typeof createIllustrationPlayback>;
