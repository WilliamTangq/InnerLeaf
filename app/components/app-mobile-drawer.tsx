"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

export function AppMobileDrawer({
  children,
  label,
  onClose,
  open,
}: {
  children: ReactNode;
  label: string;
  onClose: () => void;
  open: boolean;
}) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, open]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[99990] lg:hidden" role="presentation">
      <button
        type="button"
        aria-label={label}
        onClick={onClose}
        className="absolute inset-0 bg-[rgba(18,28,25,0.38)] backdrop-blur-[3px] motion-safe:animate-[drawerBackdropIn_180ms_ease-out]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="absolute z-[1] motion-safe:animate-[drawerSheetIn_220ms_cubic-bezier(.2,.8,.2,1)]"
        style={{
          top: "max(0.55rem, env(safe-area-inset-top))",
          bottom: "max(0.55rem, env(safe-area-inset-bottom))",
          left: "max(0.55rem, env(safe-area-inset-left))",
          width:
            "min(334px, calc(100vw - 1.1rem - env(safe-area-inset-left) - env(safe-area-inset-right)))",
        }}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
