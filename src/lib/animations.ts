import { Transition, Variants } from 'motion/react';

/**
 * Emil Kowalski Animation Principles Easing Blueprint:
 * - ease-out for entering/exiting/user interactions (snappy start, settles gracefully)
 * - ease-in-out for elements already on screen that move or morph
 * - ease for hover/color transitions
 * - Avoid linear for UI (feels robotic)
 * - Never use ease-in for UI (delays visual feedback)
 */
export const EASE_OUT: [number, number, number, number] = [0.165, 0.84, 0.44, 1]; // Quart
export const EASE_OUT_CUBIC: [number, number, number, number] = [0.215, 0.61, 0.355, 1];
export const EASE_IN_OUT: [number, number, number, number] = [0.645, 0.045, 0.355, 1];

// Durations strictly <= 300ms
export const DURATION_FAST = 0.15; // 150ms
export const DURATION_STANDARD = 0.2; // 200ms
export const DURATION_MODAL = 0.25; // 250ms

export const TACTILE_SPRING: Transition = {
  type: 'spring',
  duration: 0.35,
  bounce: 0.15,
};

export const pageTransitionVariants: Variants = {
  initial: {
    opacity: 0,
    y: 6,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION_STANDARD,
      ease: EASE_OUT,
    },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: {
      duration: 0.16, // exits 20% faster
      ease: EASE_OUT,
    },
  },
};

export const staggerContainerVariants = (staggerChildren = 0.04, delayChildren = 0): Variants => ({
  initial: {},
  animate: {
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});

export const fadeUpItemVariants: Variants = {
  initial: {
    opacity: 0,
    y: 12,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION_MODAL,
      ease: EASE_OUT,
    },
  },
};

export const scalePopItemVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95, // starts from 0.95, not 0
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: DURATION_STANDARD,
      ease: EASE_OUT,
    },
  },
};

export const mobileMenuVariants: Variants = {
  closed: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.16,
      ease: EASE_OUT,
    },
  },
  open: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION_STANDARD,
      ease: EASE_OUT,
    },
  },
};

export const backdropVariants: Variants = {
  closed: {
    opacity: 0,
    transition: {
      duration: 0.16,
      ease: EASE_OUT,
    },
  },
  open: {
    opacity: 1,
    transition: {
      duration: DURATION_STANDARD,
      ease: EASE_OUT,
    },
  },
};

export const tooltipVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: DURATION_FAST,
      ease: EASE_OUT,
    },
  },
};
