"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const sizes = {
  sm: { box: 32, image: 32 },
  md: { box: 40, image: 40 },
  lg: { box: 56, image: 56 },
  xl: { box: 80, image: 80 },
  hero: { box: 112, image: 112 },
} as const;

type BrandSettings = {
  app_name: string;
  tagline: string;
  logo_url: string;
};

const defaultBrandSettings: BrandSettings = {
  app_name: "InnerLeaf",
  tagline: "Reflect with clarity",
  logo_url: "/logo.png",
};

let cachedSettings: BrandSettings | null = null;
let settingsRequest: Promise<BrandSettings> | null = null;

async function loadBrandSettings() {
  if (cachedSettings) {
    return cachedSettings;
  }

  if (!settingsRequest) {
    settingsRequest = fetch("/api/site-settings")
      .then((response) => (response.ok ? response.json() : defaultBrandSettings))
      .then((settings: Partial<BrandSettings>) => {
        cachedSettings = {
          app_name: settings.app_name || defaultBrandSettings.app_name,
          tagline: settings.tagline || defaultBrandSettings.tagline,
          logo_url: settings.logo_url || defaultBrandSettings.logo_url,
        };

        return cachedSettings;
      })
      .catch(() => defaultBrandSettings);
  }

  return settingsRequest;
}

export function BrandLogo({
  size = "md",
  showWordmark = true,
  href = "/",
  className = "",
}: {
  size?: keyof typeof sizes;
  showWordmark?: boolean;
  href?: string | null;
  className?: string;
}) {
  const { box } = sizes[size];
  const [settings, setSettings] = useState<BrandSettings>(
    cachedSettings ?? defaultBrandSettings
  );

  useEffect(() => {
    let active = true;

    loadBrandSettings().then((nextSettings) => {
      if (active) {
        setSettings(nextSettings);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const content = (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <span
        className="relative shrink-0 overflow-hidden rounded-[22%] bg-cover bg-center shadow-[var(--shadow-md)] ring-1 ring-black/5"
        style={{
          width: box,
          height: box,
          backgroundImage: `url("${settings.logo_url}")`,
        }}
        aria-hidden="true"
      />
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span className="text-[15px] font-semibold tracking-tight text-[var(--foreground)]">
            {settings.app_name}
          </span>
          <span className="mt-0.5 hidden text-[11px] font-medium text-[var(--foreground-subtle)] sm:block">
            {settings.tagline}
          </span>
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="group transition-opacity hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
}
