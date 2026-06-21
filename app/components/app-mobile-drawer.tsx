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
        className="absolute inset-0 bg-[rgba(18,28,25,0.42)] backdrop-blur-[3px] motion-safe:animate-[drawerBackdropIn_180ms_ease-out]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="absolute inset-y-3 left-3 z-[1] w-[min(342px,calc(100vw-24px))] motion-safe:animate-[drawerSheetIn_220ms_cubic-bezier(.2,.8,.2,1)]"
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
