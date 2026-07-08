"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "../lib/utils";

type EmotionStatus = "dimmed" | "lit" | "veined" | "mapped" | "learned";

type EmotionLeaf = {
  id: string;
  label: string;
  status: EmotionStatus;
  x: number;
  y: number;
  rotate: number;
  size: number;
  explanation: string;
  commonTrigger: string;
  commonStory: string;
  commonUrge: string;
  whatHelped: string;
};

export type EmotionTreeProps = {
  activeEmotion?: string;
  className?: string;
  emotions?: EmotionLeaf[];
};

const sampleEmotionLeaves: EmotionLeaf[] = [
  {
    id: "anxiety",
    label: "Anxiety",
    status: "lit",
    x: 188,
    y: 92,
    rotate: -28,
    size: 34,
    explanation: "A signal that your mind is trying to predict risk before you have enough information.",
    commonTrigger: "Uncertainty, delayed replies, unclear expectations.",
    commonStory: "Something is wrong, and I need to solve it now.",
    commonUrge: "Check, reread, ask for reassurance, or mentally replay.",
    whatHelped: "Separate one fact from one assumption before responding.",
  },
  {
    id: "overwhelmed",
    label: "Overwhelmed",
    status: "veined",
    x: 258,
    y: 138,
    rotate: 24,
    size: 38,
    explanation: "A sign that too many demands are competing for attention at once.",
    commonTrigger: "Workload pressure, deadlines, too many open loops.",
    commonStory: "If I cannot do all of it, I am already failing.",
    commonUrge: "Freeze, avoid starting, or jump between tasks.",
    whatHelped: "Choose one 10-minute starting action and stop there.",
  },
  {
    id: "disappointed",
    label: "Disappointed",
    status: "mapped",
    x: 136,
    y: 158,
    rotate: -52,
    size: 32,
    explanation: "A response to the gap between what you hoped for and what happened.",
    commonTrigger: "Plans changing, effort not being noticed, expectations not met.",
    commonStory: "This means it mattered more to me than to them.",
    commonUrge: "Withdraw, go quiet, or dismiss the need as too much.",
    whatHelped: "Name the need without blaming yourself for having it.",
  },
  {
    id: "jealous",
    label: "Jealous",
    status: "dimmed",
    x: 310,
    y: 78,
    rotate: 46,
    size: 30,
    explanation: "A signal that comparison may be pointing toward a need or fear.",
    commonTrigger: "Seeing someone else receive progress, attention, or ease.",
    commonStory: "They are moving ahead, and I am falling behind.",
    commonUrge: "Keep checking the comparison source or collect more evidence.",
    whatHelped: "Step away from the comparison source and return to one personal need.",
  },
  {
    id: "frustrated",
    label: "Frustrated",
    status: "learned",
    x: 218,
    y: 206,
    rotate: 8,
    size: 36,
    explanation: "A sign that something feels blocked, unfair, or harder than expected.",
    commonTrigger: "Miscommunication, repeated obstacles, feeling unheard.",
    commonStory: "This should not be this difficult.",
    commonUrge: "Push harder, send a sharp message, or shut down.",
    whatHelped: "Pause before acting and clarify the specific request.",
  },
];

const statusStyles: Record<
  EmotionStatus,
  {
    fill: string;
    stroke: string;
    opacity: number;
    glow: string;
  }
> = {
  dimmed: {
    fill: "rgba(126,143,134,0.28)",
    stroke: "rgba(81,99,91,0.24)",
    opacity: 0.68,
    glow: "drop-shadow(0 0 0 rgba(31,155,143,0))",
  },
  lit: {
    fill: "rgba(130,199,176,0.84)",
    stroke: "rgba(17,111,104,0.42)",
    opacity: 1,
    glow: "drop-shadow(0 0 14px rgba(31,155,143,0.22))",
  },
  veined: {
    fill: "rgba(155,207,184,0.78)",
    stroke: "rgba(17,111,104,0.48)",
    opacity: 1,
    glow: "drop-shadow(0 0 10px rgba(31,155,143,0.16))",
  },
  mapped: {
    fill: "rgba(184,212,158,0.78)",
    stroke: "rgba(103,128,65,0.42)",
    opacity: 1,
    glow: "drop-shadow(0 0 10px rgba(217,179,74,0.14))",
  },
  learned: {
    fill: "rgba(217,205,130,0.8)",
    stroke: "rgba(128,100,31,0.38)",
    opacity: 1,
    glow: "drop-shadow(0 0 12px rgba(217,179,74,0.18))",
  },
};

function normalizeEmotion(value?: string) {
  return value?.trim().toLowerCase().replace(/\s+/g, "_") ?? "";
}

function leafPath(size: number) {
  const width = size * 0.72;
  return `M 0 ${-size} C ${width} ${-size * 0.78} ${width} ${size * 0.36} 0 ${size} C ${-width} ${size * 0.36} ${-width} ${-size * 0.78} 0 ${-size} Z`;
}

function EmotionLeafShape({
  leaf,
  active,
  selected,
  onSelect,
}: {
  leaf: EmotionLeaf;
  active: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const styles = statusStyles[leaf.status];
  const shouldPulse = active && !reduceMotion;

  return (
    <motion.g
      role="button"
      tabIndex={0}
      aria-label={`Select ${leaf.label}`}
      transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.rotate})`}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      initial={false}
      animate={
        shouldPulse
          ? {
              scale: [1, 1.055, 1],
              filter: [
                styles.glow,
                "drop-shadow(0 0 20px rgba(31,155,143,0.28))",
                styles.glow,
              ],
            }
          : {
              scale: selected ? 1.035 : 1,
              filter: selected ? "drop-shadow(0 0 18px rgba(31,155,143,0.24))" : styles.glow,
            }
      }
      transition={{
        duration: shouldPulse ? 2.8 : 0.28,
        repeat: shouldPulse ? Infinity : 0,
        ease: [0.2, 0.8, 0.2, 1],
      }}
      whileHover={reduceMotion ? undefined : { scale: 1.04 }}
      className="cursor-pointer outline-none"
    >
      <motion.path
        d={leafPath(leaf.size)}
        fill={styles.fill}
        stroke={selected ? "rgba(17,111,104,0.72)" : styles.stroke}
        strokeWidth={selected ? 2.4 : 1.7}
        opacity={styles.opacity}
      />
      {(leaf.status === "veined" ||
        leaf.status === "mapped" ||
        leaf.status === "learned" ||
        selected) && (
        <path
          d={`M 0 ${-leaf.size * 0.72} C ${leaf.size * 0.08} ${-leaf.size * 0.24} ${leaf.size * 0.05} ${leaf.size * 0.36} 0 ${leaf.size * 0.76}`}
          fill="none"
          stroke="rgba(17,111,104,0.34)"
          strokeWidth={1.3}
          strokeLinecap="round"
        />
      )}
      {leaf.status === "learned" && (
        <circle
          cx={leaf.size * 0.2}
          cy={leaf.size * 0.1}
          r={2.2}
          fill="rgba(255,254,248,0.72)"
        />
      )}
    </motion.g>
  );
}

export function EmotionTree({
  activeEmotion,
  className,
  emotions = sampleEmotionLeaves,
}: EmotionTreeProps) {
  const activeId = normalizeEmotion(activeEmotion);
  const initialLeaf = useMemo(
    () =>
      emotions.find((leaf) => normalizeEmotion(leaf.label) === activeId) ??
      emotions[0],
    [activeId, emotions]
  );
  const [selectedId, setSelectedId] = useState(initialLeaf.id);
  const selectedLeaf =
    emotions.find((leaf) => leaf.id === selectedId) ?? initialLeaf;

  return (
    <section
      className={cn(
        "overflow-hidden rounded-[2rem] border border-[rgba(40,80,60,0.1)] bg-[linear-gradient(135deg,rgba(255,254,248,0.96),rgba(232,246,241,0.56),rgba(255,248,226,0.22))] p-5 shadow-[var(--shadow-lg)] sm:rounded-[2.35rem] sm:p-7 lg:p-8",
        className
      )}
      aria-labelledby="emotion-tree-heading"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(300px,0.72fr)] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--foreground-subtle)]">
            Inner Tree
          </p>
          <h2
            id="emotion-tree-heading"
            className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-[2.15rem] sm:leading-tight"
          >
            See the pattern behind your emotional reactions.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--foreground-muted)] sm:text-base">
            Every reflection lights up one part of your Inner Tree. Over time,
            InnerLeaf helps you see what triggers each emotion, what story your
            mind adds, how you tend to react, and what actually helps.
          </p>

          <div className="mt-6 rounded-[1.75rem] border border-[rgba(31,155,143,0.12)] bg-[rgba(255,254,248,0.62)] p-3 shadow-[var(--shadow-soft)]">
            <svg
              viewBox="0 0 430 330"
              role="img"
              aria-label="A calm tree showing emotional reflection patterns"
              className="h-auto w-full"
            >
              <defs>
                <linearGradient id="inner-tree-trunk" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="rgba(116,94,62,0.88)" />
                  <stop offset="100%" stopColor="rgba(66,85,63,0.86)" />
                </linearGradient>
              </defs>

              <path
                d="M210 302 C214 254 212 222 208 190 C204 158 205 122 224 84"
                fill="none"
                stroke="url(#inner-tree-trunk)"
                strokeWidth="18"
                strokeLinecap="round"
              />
              <path
                d="M214 184 C180 160 152 132 132 96"
                fill="none"
                stroke="rgba(78,96,70,0.58)"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                d="M214 156 C252 146 286 120 316 82"
                fill="none"
                stroke="rgba(78,96,70,0.56)"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <path
                d="M210 220 C244 214 276 196 305 166"
                fill="none"
                stroke="rgba(78,96,70,0.46)"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <path
                d="M208 224 C180 212 154 192 132 166"
                fill="none"
                stroke="rgba(78,96,70,0.42)"
                strokeWidth="6"
                strokeLinecap="round"
              />

              <ellipse
                cx="212"
                cy="306"
                rx="76"
                ry="12"
                fill="rgba(40,80,60,0.08)"
              />

              {emotions.map((leaf) => (
                <EmotionLeafShape
                  key={leaf.id}
                  leaf={leaf}
                  active={normalizeEmotion(leaf.label) === activeId}
                  selected={selectedLeaf.id === leaf.id}
                  onSelect={() => setSelectedId(leaf.id)}
                />
              ))}
            </svg>
          </div>
        </div>

        <aside className="rounded-[1.75rem] border border-[rgba(40,80,60,0.1)] bg-[rgba(255,254,248,0.82)] p-5 shadow-[var(--shadow-md)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground-subtle)]">
                Selected leaf
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                {selectedLeaf.label}
              </h3>
            </div>
            <span className="rounded-full border border-[rgba(31,155,143,0.16)] bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--brand-teal-deep)]">
              {selectedLeaf.status}
            </span>
          </div>

          <p className="mt-4 text-sm leading-7 text-[var(--foreground-muted)]">
            {selectedLeaf.explanation}
          </p>

          <div className="mt-5 grid gap-3">
            {[
              ["Common trigger", selectedLeaf.commonTrigger],
              ["Common story", selectedLeaf.commonStory],
              ["Common urge", selectedLeaf.commonUrge],
              ["What helped", selectedLeaf.whatHelped],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-[1.1rem] border border-[rgba(40,80,60,0.075)] bg-[rgba(246,242,233,0.52)] px-3.5 py-3"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[var(--foreground-subtle)]">
                  {label}
                </p>
                <p className="mt-1.5 text-sm leading-6 text-[var(--foreground-muted)]">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
