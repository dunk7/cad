"use client";

import {
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type ReactNode,
} from "react";

type Particle = {
  id: number;
  angle: number;
  dist: number;
  color: string;
  size: number;
  delay: number;
  kind: "dot" | "spark";
};

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
  children: ReactNode;
  /** Runs after the reward animation finishes. */
  onReward?: () => void;
  /**
   * Optional gate. Return false to skip the reward and not call onReward
   * (use for validation failures). When omitted, reward always plays.
   */
  shouldReward?: () => boolean;
  /** Animation length before advancing. */
  rewardMs?: number;
  /** Visual intensity preset. */
  intensity?: "next" | "add";
};

const COLORS = ["#c9a227", "#ffbb29", "#10b981", "#34d399", "#fde68a", "#ffffff", "#059669"];

function makeParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: (360 / count) * i + (Math.random() * 22 - 11),
    dist: 52 + Math.random() * 64,
    color: COLORS[i % COLORS.length],
    size: 3.5 + Math.random() * 5.5,
    delay: Math.random() * 55,
    kind: i % 4 === 0 ? "spark" : "dot",
  }));
}

function vibrateWin() {
  try {
    navigator.vibrate?.([12, 28, 18, 22, 36]);
  } catch {
    /* ignore unsupported / blocked */
  }
}

/**
 * Primary CTA that fires a casino-style win burst on every successful press —
 * particle spray, gold/emerald flash, punch scale, and a short haptic pulse.
 */
export default function RewardButton({
  children,
  onReward,
  shouldReward,
  rewardMs = 520,
  intensity = "next",
  className = "",
  disabled,
  type = "button",
  ...rest
}: Props) {
  const [playing, setPlaying] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const lock = useRef(false);

  function handleClick() {
    if (disabled || lock.current || playing) return;
    if (shouldReward && !shouldReward()) return;

    lock.current = true;
    vibrateWin();
    setParticles(makeParticles(intensity === "add" ? 18 : 16));
    setPlaying(true);

    window.setTimeout(() => {
      setPlaying(false);
      setParticles([]);
      lock.current = false;
      onReward?.();
    }, rewardMs);
  }

  const defaultIdle =
    intensity === "add"
      ? "inline-flex items-center justify-center gap-2 border border-black bg-black px-12 py-4 text-base font-medium text-white transition hover:bg-neutral-800 sm:px-14 sm:py-5 sm:text-lg"
      : "border border-black bg-black px-8 py-3 text-sm font-medium text-white transition hover:bg-white hover:text-black disabled:opacity-40";

  const idleClass = className || defaultIdle;
  const keepFullWidth = /\bw-full\b/.test(idleClass);

  const playingClass =
    intensity === "add"
      ? `animate-reward-hit-add inline-flex items-center justify-center gap-2 border border-emerald-400 bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-700 px-12 py-4 text-base font-semibold text-white sm:px-14 sm:py-5 sm:text-lg ${keepFullWidth ? "w-full" : ""}`
      : `animate-reward-hit border border-amber-300 bg-gradient-to-b from-amber-300 via-emerald-400 to-emerald-700 px-8 py-3 text-sm font-semibold text-white disabled:opacity-100 ${keepFullWidth ? "w-full" : ""}`;

  return (
    <button
      type={type}
      disabled={disabled || playing}
      onClick={handleClick}
      className={`relative isolate overflow-visible ${playing ? playingClass : idleClass}`}
      {...rest}
    >
      {playing && (
        <>
          <span
            className="animate-reward-ring pointer-events-none absolute left-1/2 top-1/2 z-0 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-amber-300"
            aria-hidden="true"
          />
          <span
            className="animate-reward-ring-slow pointer-events-none absolute left-1/2 top-1/2 z-0 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-300"
            aria-hidden="true"
          />
          <span
            className="animate-reward-sheen pointer-events-none absolute inset-0 z-[1] overflow-hidden"
            aria-hidden="true"
          >
            <span className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent" />
          </span>
          {particles.map((p) => {
            const style = {
              width: p.size,
              height: p.kind === "spark" ? p.size * 2.2 : p.size,
              background: p.color,
              animationDelay: `${p.delay}ms`,
              ["--reward-angle" as string]: `${p.angle}deg`,
              ["--reward-dist" as string]: `${p.dist}px`,
              boxShadow: `0 0 8px ${p.color}`,
              borderRadius: p.kind === "spark" ? "1px" : "9999px",
            } as CSSProperties;
            return (
              <span
                key={p.id}
                className="animate-reward-particle pointer-events-none absolute left-1/2 top-1/2 z-[2]"
                style={style}
                aria-hidden="true"
              />
            );
          })}
          <span
            className="animate-reward-plus pointer-events-none absolute left-1/2 top-0 z-[3] -translate-x-1/2 text-xs font-bold tracking-wide text-amber-200"
            aria-hidden="true"
          >
            {intensity === "add" ? "+ ITEM" : "NICE"}
          </span>
        </>
      )}
      <span className={`relative z-10 ${playing ? "drop-shadow-sm" : ""}`}>{children}</span>
    </button>
  );
}
