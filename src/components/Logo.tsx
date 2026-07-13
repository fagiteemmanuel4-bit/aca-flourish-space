import { Link } from "@tanstack/react-router";

/**
 * Lumio whale mark — matches /public/favicon.svg exactly.
 * A small friendly whale in royal blue with a soft spout.
 */
export function LumioMark({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className={`inline-block select-none transition-transform duration-300 hover:scale-105 active:scale-95 ${className}`}
      style={{ minWidth: size, minHeight: size }}
    >
      <defs>
        <linearGradient id="lumioWhale" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <filter id="lumioGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <g fill="none" stroke="#60a5fa" strokeWidth={1.5} strokeLinecap="round" opacity={0.95}>
        <path d="M15.5 4 q1 2 0 4" />
        <path d="M13 5 q0 1.5 -1 2.5" />
        <path d="M18 5 q0 1.5 1 2.5" />
      </g>
      <path
        d="M6 20 C6 13, 14 10, 20 12 L26 10 L24 15 C27 17, 27 22, 22 24 C15 27, 8 25, 6 20 Z"
        fill="url(#lumioWhale)"
        filter="url(#lumioGlow)"
      />
      <path
        d="M8 21 C10 24, 16 25, 20 23 C17 24, 12 24, 9 22 Z"
        fill="#93c5fd"
        opacity={0.85}
      />
      <circle cx="14" cy="17" r="1.1" fill="#ffffff" className="animate-pulse" />
    </svg>
  );
}

export function LumioWordmark({ to = "/", className = "" }: { to?: string; className?: string }) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl px-1 py-0.5 transition-all duration-200 hover:opacity-95 ${className}`}
    >
      <span className="transition-all duration-300 group-hover:rotate-[10deg] group-hover:scale-110 drop-shadow-[0_2px_8px_rgba(59,130,246,0.3)]">
        <LumioMark size={30} />
      </span>
      <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 via-blue-500 to-blue-600 bg-clip-text text-transparent group-hover:from-indigo-600 group-hover:to-blue-700 dark:from-indigo-400 dark:via-blue-400 dark:to-blue-500 transition-all duration-300 font-display">
        Lumio
      </span>
    </Link>
  );
}
