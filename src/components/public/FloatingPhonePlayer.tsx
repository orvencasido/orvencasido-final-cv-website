import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Smartphone, X, GripHorizontal, Sparkles } from 'lucide-react';
import { getSiteSettings } from '../../lib/services';
import { SiteSettings } from '../../types';

// Default Subway Surfers vertical gameplay video
const DEFAULT_SUBWAY_SURFERS_ID = 'zZ7AimPACzc';

export function extractYouTubeId(url?: string | null): string {
  if (!url) return DEFAULT_SUBWAY_SURFERS_ID;
  const trimmed = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  );
  return match ? match[1] : DEFAULT_SUBWAY_SURFERS_ID;
}

interface Position {
  x: number;
  y: number;
}

export const FloatingPhonePlayer: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  const [isScreenTooNarrow, setIsScreenTooNarrow] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth < 768;
  });

  // Separate positions for the floating "Click Me" button and the Phone pop-up
  const [buttonPos, setButtonPos] = useState<Position>({ x: -1, y: -1 });
  const [phonePos, setPhonePos] = useState<Position>({ x: -1, y: -1 });

  // Refs for instantaneous 0ms real-time direct transform updates
  const buttonPosRef = useRef<Position>({ x: -1, y: -1 });
  const phonePosRef = useRef<Position>({ x: -1, y: -1 });

  const buttonRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);

  // Dragging states
  const [isDragging, setIsDragging] = useState(false);
  const dragTargetRef = useRef<'button' | 'phone' | null>(null);
  const dragStartRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number; moved: boolean }>({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
    moved: false,
  });

  // Fetch site settings
  useEffect(() => {
    let isMounted = true;
    getSiteSettings()
      .then((data) => {
        if (isMounted) setSettings(data);
      })
      .catch((err) => {
        console.error('Failed to load site settings for floating player:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute initial positions after mount based on viewport & check screen width
  useEffect(() => {
    const handleScreenSize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const narrow = vw < 768;

      setIsScreenTooNarrow(narrow);

      if (narrow) {
        setIsOpen(false);
        setHasStartedPlaying(false);
        return;
      }

      // Edgeless screen dimensions in 9:16 portrait ratio (~1/4 vw, ~1/2 vh)
      const phoneW = Math.min(290, Math.max(260, Math.floor(vw * 0.25)));
      const phoneH = Math.round((phoneW * 16) / 9);

      const initButtonX = Math.max(16, vw - 86);
      const initButtonY = Math.max(16, vh - 100);
      const initPhoneX = Math.max(16, vw - phoneW - 20);
      const initPhoneY = Math.max(16, vh - phoneH - 20);

      setButtonPos((prev) => {
        if (prev.x !== -1) return prev;
        buttonPosRef.current = { x: initButtonX, y: initButtonY };
        return { x: initButtonX, y: initButtonY };
      });

      setPhonePos((prev) => {
        if (prev.x !== -1) return prev;
        phonePosRef.current = { x: initPhoneX, y: initPhoneY };
        return { x: initPhoneX, y: initPhoneY };
      });
    };

    handleScreenSize();
    window.addEventListener('resize', handleScreenSize);
    return () => window.removeEventListener('resize', handleScreenSize);
  }, []);

  // Drag handler helpers
  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    target: 'button' | 'phone'
  ) => {
    // Only respond to main mouse button or touch
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    dragTargetRef.current = target;
    const currentPos = target === 'button' ? buttonPosRef.current : phonePosRef.current;

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: currentPos.x,
      initialY: currentPos.y,
      moved: false,
    };

    setIsDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!dragTargetRef.current) return;

    const { startX, startY, initialX, initialY } = dragStartRef.current;
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    if (Math.hypot(deltaX, deltaY) > 4) {
      dragStartRef.current.moved = true;
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (dragTargetRef.current === 'button') {
      const btnW = 76;
      const btnH = 76;
      const nextX = Math.min(Math.max(12, initialX + deltaX), vw - btnW - 12);
      const nextY = Math.min(Math.max(12, initialY + deltaY), vh - btnH - 12);
      buttonPosRef.current = { x: nextX, y: nextY };
      if (buttonRef.current) {
        buttonRef.current.style.transform = `translate3d(${nextX}px, ${nextY}px, 0)`;
      }
    } else {
      const phoneW = Math.min(290, Math.max(260, Math.floor(vw * 0.25)));
      const phoneH = Math.round((phoneW * 16) / 9);
      const nextX = Math.min(Math.max(12, initialX + deltaX), vw - phoneW - 12);
      const nextY = Math.min(Math.max(12, initialY + deltaY), vh - phoneH - 12);
      phonePosRef.current = { x: nextX, y: nextY };
      if (phoneRef.current) {
        phoneRef.current.style.transform = `translate3d(${nextX}px, ${nextY}px, 0)`;
      }
    }
  }, []);

  const handlePointerUp = useCallback((e: PointerEvent) => {
    if (!dragTargetRef.current) return;

    const moved = dragStartRef.current.moved;
    const target = dragTargetRef.current;
    dragTargetRef.current = null;
    setIsDragging(false);

    // Sync final position into React state
    if (target === 'button') {
      setButtonPos(buttonPosRef.current);
      // If it wasn't a drag gesture, it was a click
      if (!moved) {
        setIsOpen(true);
        setHasStartedPlaying(true);
      }
    } else {
      setPhonePos(phonePosRef.current);
    }
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove, { passive: true });
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [isDragging, handlePointerMove, handlePointerUp]);

  // Handler to close player and completely free iframe memory
  const handleExit = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    setHasStartedPlaying(false);
  };

  // If explicitly disabled in settings or screen is too narrow (mobile view), do not render
  if (isScreenTooNarrow || (settings && settings.floating_video_enabled === false)) {
    return null;
  }

  const videoId = extractYouTubeId(settings?.floating_video_url);

  // Construct optimized autoplay/loop vertical YouTube embed
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&playsinline=1&controls=1&modestbranding=1&rel=0`;

  return (
    <>
      {/* 1. Minimized Movable "Click Me" Button */}
      {/* Outer container has ZERO transition on transform for instant 1:1 real-time mouse following */}
      <div
        ref={buttonRef}
        onPointerDown={(e) => handlePointerDown(e, 'button')}
        style={{
          transform: `translate3d(${buttonPos.x}px, ${buttonPos.y}px, 0)`,
          touchAction: 'none',
          willChange: 'transform',
        }}
        className={`fixed top-0 left-0 z-50 hidden md:block select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        } ${isOpen ? 'pointer-events-none' : 'pointer-events-auto'}`}
        title="ADHD? I Got You!"
        aria-label="Floating video player launcher"
      >
        {/* Inner element handles show/hide scale and fade transition independently */}
        <div
          className={`transition-all duration-200 ${
            isOpen ? 'opacity-0 scale-75 pointer-events-none' : 'opacity-100 scale-100'
          }`}
        >
          <div className="relative flex flex-col items-center group">
            {/* Animated "Click Me!" Badge */}
            <div className="absolute -top-7 px-2.5 py-0.5 rounded-full bg-linear-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black tracking-wider uppercase shadow-md shadow-amber-900/30 whitespace-nowrap animate-bounce flex items-center gap-1 border border-amber-300/40 pointer-events-none">
              <Sparkles className="w-2.5 h-2.5" /> Click Me!
            </div>

            {/* Glowing Aura Ring */}
            <div className="absolute inset-0 rounded-full bg-matcha-500/30 blur-md group-hover:bg-matcha-400/40 animate-pulse pointer-events-none" />

            {/* Button Body */}
            <div className="relative w-14 h-14 rounded-full bg-linear-to-br from-matcha-800 to-matcha-950 border-2 border-matcha-400/60 shadow-xl shadow-matcha-950/40 flex items-center justify-center text-beige-50 transition-transform duration-150 group-hover:scale-105 active:scale-95">
              <Smartphone className="w-6 h-6 text-matcha-200 transition-transform group-hover:rotate-6" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Edgeless Screen-Only Portrait Video Pop-up */}
      {/* Kept mounted permanently so page routing never interrupts video audio/playback */}
      {/* Outer container has ZERO transition on transform for instant 1:1 real-time mouse following */}
      <div
        ref={phoneRef}
        style={{
          transform: `translate3d(${phonePos.x}px, ${phonePos.y}px, 0)`,
          touchAction: 'none',
          willChange: 'transform',
        }}
        className={`fixed top-0 left-0 z-50 hidden md:block select-none ${
          isOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        {/* Inner container handles open/close fade and scale independently */}
        <div
          className={`transition-all duration-200 ${
            isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-90 pointer-events-none'
          }`}
        >
          {/* Edgeless screen container (9:16 portrait, ~1/4 vw, ~1/2 vh) with rounded corners and clean shadow */}
          <div className="relative w-[260px] sm:w-[280px] h-[462px] sm:h-[498px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-black/80 bg-black border border-white/10 ring-1 ring-black/40 flex flex-col">
            
            {/* Floating Top Controls Overlay */}
            <div
              onPointerDown={(e) => handlePointerDown(e, 'phone')}
              className="absolute top-2.5 left-2.5 right-2.5 z-30 flex items-center justify-between cursor-grab active:cursor-grabbing select-none"
              title="Drag to reposition player"
            >
              {/* Minimalist Drag Grip Icon (No text) */}
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white/80 hover:text-white shadow-md transition">
                <GripHorizontal className="w-4 h-4" />
              </div>

              {/* Control: Exit Only */}
              <div
                onPointerDown={(e) => e.stopPropagation()}
                className="flex items-center bg-black/60 backdrop-blur-md border border-white/20 rounded-full p-1 shadow-md"
              >
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={handleExit}
                  className="p-1 rounded-full hover:bg-red-500/40 text-white/80 hover:text-red-300 transition cursor-pointer"
                  title="Close player"
                  aria-label="Close player"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Edgeless Full-Screen Video Player */}
            <div className="relative w-full h-full bg-black overflow-hidden">
              {/* If user is dragging, render an invisible shield over the iframe so pointer events aren't swallowed by YouTube */}
              {isDragging && <div className="absolute inset-0 z-20 bg-transparent" />}

              {/* Embed Iframe - Only mounted when open to ensure zero memory consumption when closed */}
              {isOpen && hasStartedPlaying ? (
                <iframe
                  title="Subway Surfers Floating Player"
                  src={embedUrl}
                  className="w-full h-full object-cover border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-neutral-400 bg-black">
                  <Smartphone className="w-10 h-10 text-matcha-500 mb-2 animate-pulse" />
                  <p className="text-xs font-bold text-neutral-200">Subway Surfers Player</p>
                  <p className="text-[10px] text-neutral-400 mt-1">Tap launcher to start playback</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
