"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { PlayCircle } from "lucide-react";
import { Card, SectionLabel } from "./ui";
import { useLanguage } from "./language-provider";

export function VideoBlock({
  youtubeId,
  fallback,
}: {
  youtubeId?: string;
  fallback: ReactNode;
}) {
  const { t } = useLanguage();
  const [hasLocalVideo, setHasLocalVideo] = useState(false);

  useEffect(() => {
    fetch("/demo.mp4", { method: "HEAD" })
      .then((response) => setHasLocalVideo(response.ok))
      .catch(() => setHasLocalVideo(false));
  }, []);

  if (hasLocalVideo) {
    return (
      <Card variant="elevated" className="overflow-hidden p-0">
        <video
          className="aspect-video w-full bg-[var(--surface-muted)] object-cover"
          controls
          preload="metadata"
        >
          <source src="/demo.mp4" type="video/mp4" />
        </video>
      </Card>
    );
  }

  if (youtubeId) {
    return (
      <Card variant="elevated" className="overflow-hidden p-0">
        <div className="aspect-video w-full">
          <iframe
            className="h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
            title={t.demo.videoTitle}
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
        <p className="border-t border-[var(--border)] px-5 py-3 text-xs text-[var(--foreground-subtle)]">
          {t.demo.videoHosted}
        </p>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className="overflow-hidden">
      <div className="mb-5 flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--brand-teal-deep)]">
          <PlayCircle aria-hidden="true" size={20} strokeWidth={1.8} />
        </span>
        <div>
          <SectionLabel>{t.demo.videoTitle}</SectionLabel>
          <p className="mt-1 text-sm font-medium text-[var(--foreground)]">
            {t.demo.videoFallback}
          </p>
        </div>
      </div>
      {fallback}
    </Card>
  );
}
