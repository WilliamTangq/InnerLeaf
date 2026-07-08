"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { EmotionLeaf, emotionLeaves } from "./emotionLeaves";

type EmotionTreeProps = {
  activeEmotionId?: string;
};

function getLeafOpacity(status: EmotionLeaf["status"]) {
  if (status === "dimmed") return 0.22;
  return 1;
}

function getLeafGlow(status: EmotionLeaf["status"]) {
  if (status === "dimmed") return "none";
  if (status === "learned") return "url(#strongGlow)";
  return "url(#softGlow)";
}

export default function EmotionTree({ activeEmotionId = "anxiety" }: EmotionTreeProps) {
  const [selectedLeaf, setSelectedLeaf] = useState<EmotionLeaf | null>(null);

  const leaves = useMemo(() => {
    return emotionLeaves.map((leaf) => {
      if (leaf.id === activeEmotionId) {
        return {
          ...leaf,
          status: leaf.status === "dimmed" ? "lit" : leaf.status,
          count: Math.max(leaf.count, 1)
        };
      }

      return leaf;
    });
  }, [activeEmotionId]);

  return (
    <section className="mx-auto max-w-5xl rounded-3xl border border-emerald-100 bg-[#F8FBF6] p-6 shadow-sm">
      <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="mb-2 text-sm font-medium text-emerald-700">
            Inner Tree
          </p>

          <h2 className="text-2xl font-semibold tracking-tight text-stone-900 md:text-3xl">
            See the pattern behind your emotional reactions.
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-6 text-stone-600">
            Every reflection lights up one part of your Inner Tree. Over time,
            InnerLeaf helps you see what triggers each emotion, what story your
            mind adds, how you tend to react, and what actually helps.
          </p>

          <div className="mt-6 overflow-hidden rounded-3xl bg-white p-4 shadow-inner">
            <svg
              viewBox="0 0 460 420"
              role="img"
              aria-label="Inner Tree emotion map"
              className="h-auto w-full"
            >
              <defs>
                <filter id="softGlow" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="5" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                <filter id="strongGlow" x="-60%" y="-60%" width="220%" height="220%">
                  <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Background circle */}
              <circle cx="230" cy="205" r="170" fill="#EEF7EA" />

              {/* Tree trunk */}
              <path
                d="M226 365 C220 305, 223 260, 230 220 C236 180, 228 150, 215 120"
                fill="none"
                stroke="#9A6B45"
                strokeWidth="18"
                strokeLinecap="round"
              />

              {/* Branches */}
              <path
                d="M225 245 C190 220, 165 195, 145 160"
                fill="none"
                stroke="#9A6B45"
                strokeWidth="9"
                strokeLinecap="round"
              />
              <path
                d="M232 230 C265 205, 295 180, 325 145"
                fill="none"
                stroke="#9A6B45"
                strokeWidth="9"
                strokeLinecap="round"
              />
              <path
                d="M230 285 C190 270, 160 255, 125 230"
                fill="none"
                stroke="#9A6B45"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <path
                d="M232 280 C270 270, 305 255, 340 230"
                fill="none"
                stroke="#9A6B45"
                strokeWidth="7"
                strokeLinecap="round"
              />

              {/* Leaves */}
              {leaves.map((leaf) => {
                const isActive = leaf.id === activeEmotionId;
                const opacity = getLeafOpacity(leaf.status);
                const glow = getLeafGlow(leaf.status);

                return (
                  <motion.g
                    key={leaf.id}
                    initial={{ scale: 0.92, opacity: 0 }}
                    animate={{
                      scale: isActive ? [1, 1.12, 1] : 1,
                      opacity
                    }}
                    transition={{
                      duration: isActive ? 1.2 : 0.4,
                      ease: "easeOut"
                    }}
                    style={{
                      transformBox: "fill-box",
                      transformOrigin: "center"
                    }}
                    onClick={() => setSelectedLeaf(leaf)}
                    className="cursor-pointer"
                  >
                    <motion.ellipse
                      cx={leaf.x}
                      cy={leaf.y}
                      rx={22 * leaf.size}
                      ry={36 * leaf.size}
                      transform={`rotate(${leaf.rotate} ${leaf.x} ${leaf.y})`}
                      fill={leaf.color}
                      filter={glow}
                      stroke={leaf.status === "dimmed" ? "#D6DED2" : "#ffffff"}
                      strokeWidth="2"
                      whileHover={{ scale: 1.08 }}
                    />

                    {leaf.status !== "dimmed" && (
                      <motion.path
                        d={`M ${leaf.x} ${leaf.y - 24 * leaf.size} C ${leaf.x - 3} ${leaf.y - 5}, ${leaf.x + 3} ${leaf.y + 8}, ${leaf.x} ${leaf.y + 25 * leaf.size}`}
                        stroke="rgba(255,255,255,0.75)"
                        strokeWidth="1.6"
                        fill="none"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                      />
                    )}
                  </motion.g>
                );
              })}
            </svg>
          </div>
        </div>

        <aside className="rounded-3xl bg-white p-5 shadow-sm">
          {selectedLeaf ? (
            <div>
              <p className="text-sm font-medium text-emerald-700">
                You named
              </p>

              <h3 className="mt-1 text-2xl font-semibold text-stone-900">
                {selectedLeaf.label}
              </h3>

              <p className="mt-3 text-sm leading-6 text-stone-600">
                {selectedLeaf.explanation}
              </p>

              <div className="mt-5 space-y-3 text-sm">
                {selectedLeaf.commonTrigger && (
                  <InfoRow label="Often around" value={selectedLeaf.commonTrigger} />
                )}

                {selectedLeaf.commonStory && (
                  <InfoRow label="Mind may add" value={selectedLeaf.commonStory} />
                )}

                {selectedLeaf.commonUrge && (
                  <InfoRow label="Common urge" value={selectedLeaf.commonUrge} />
                )}

                {selectedLeaf.whatHelped && (
                  <InfoRow label="What helped" value={selectedLeaf.whatHelped} />
                )}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-emerald-700">
                Reflection progress
              </p>

              <h3 className="mt-1 text-2xl font-semibold text-stone-900">
                One leaf at a time.
              </h3>

              <p className="mt-3 text-sm leading-6 text-stone-600">
                Complete a reflection, confirm the emotion, and a leaf lights up.
                Click a leaf to see what InnerLeaf is learning from your patterns.
              </p>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-emerald-50 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
        {label}
      </p>
      <p className="mt-1 text-stone-700">{value}</p>
    </div>
  );
}