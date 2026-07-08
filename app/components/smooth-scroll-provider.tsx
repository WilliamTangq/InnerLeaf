"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

const disabledPathPrefixes = [
  "/login",
  "/register",
  "/reset-password",
  "/dashboard",
  "/quick",
  "/guided",
  "/history",
  "/summary",
  "/account",
  "/admin",
  "/feedback",
  "/app",
];

function shouldDisableSmoothScroll(pathname: string) {
  return disabledPathPrefixes.some((prefix) => pathname.startsWith(prefix));
}

export function SmoothScrollProvider() {
  const pathname = usePathname();

  useEffect(() => {
    if (shouldDisableSmoothScroll(pathname)) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      wheelMultiplier: 0.8,
      touchMultiplier: 1,
    });

    let frame = 0;

    function raf(time: number) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    }

    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [pathname]);

  return null;
}
