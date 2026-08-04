"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button, type ButtonVariant } from "./Button";
import { IconButton } from "./IconButton";

export type ModalSize = "md" | "lg" | "xl";

export type ModalProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  primaryLabel?: string;
  onPrimary?: () => void;
  primaryVariant?: Extract<ButtonVariant, "primary" | "danger">;
  secondaryVariant?: Extract<ButtonVariant, "secondary" | "ghost">;
  loading?: boolean;
  disabled?: boolean;
  hideClose?: boolean;
  hideFooter?: boolean;
  closeOnBackdrop?: boolean;
  size?: ModalSize;
  className?: string;
  bodyClassName?: string;
};

const SIZE_CLASS: Record<ModalSize, string> = {
  md: "max-w-lg",
  lg: "max-w-xl",
  xl: "max-w-2xl",
};

export function Modal({
  open,
  title,
  children,
  onClose,
  secondaryLabel,
  onSecondary,
  primaryLabel,
  onPrimary,
  primaryVariant = "primary",
  secondaryVariant = "secondary",
  loading = false,
  disabled = false,
  hideClose = false,
  hideFooter = false,
  closeOnBackdrop = true,
  size = "lg",
  className = "",
  bodyClassName = "",
}: Readonly<ModalProps>) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const showFooter =
    !hideFooter && Boolean(secondaryLabel || primaryLabel);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      closeRef.current?.focus();
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !open) return;

    const handleBackdropClick = (event: Event) => {
      if (!closeOnBackdrop || loading) return;
      if (event.target === dialog) onClose?.();
    };

    const handleCancel = (event: Event) => {
      event.preventDefault();
      if (!loading) onClose?.();
    };

    dialog.addEventListener("click", handleBackdropClick);
    dialog.addEventListener("cancel", handleCancel);
    return () => {
      dialog.removeEventListener("click", handleBackdropClick);
      dialog.removeEventListener("cancel", handleCancel);
    };
  }, [open, closeOnBackdrop, loading, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className={`fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border-0 bg-white p-0 shadow-xl backdrop:bg-darkest/50 open:flex open:flex-col ${SIZE_CLASS[size]} ${className}`.trim()}
    >
      <header className="flex items-start justify-between gap-4 px-6 pt-6 pb-2">
        <h2 id={titleId} className="text2 text-darkest">
          {title}
        </h2>
        {!hideClose ? (
          <IconButton
            ref={closeRef}
            icon="mdi:close"
            label="Close"
            variant="soft"
            shape="circle"
            size="sm"
            disabled={loading}
            onClick={onClose}
          />
        ) : null}
      </header>

      <div className={`px-6 py-4 ${bodyClassName}`.trim()}>{children}</div>

      {showFooter ? (
        <footer className="flex flex-wrap items-center justify-end gap-3 px-6 pt-2 pb-6">
          {secondaryLabel ? (
            <Button
              type="button"
              variant={secondaryVariant}
              disabled={loading || disabled}
              onClick={onSecondary ?? onClose}
            >
              {secondaryLabel}
            </Button>
          ) : null}
          {primaryLabel ? (
            <Button
              type="button"
              variant={primaryVariant}
              loading={loading}
              disabled={disabled}
              onClick={onPrimary}
            >
              {primaryLabel}
            </Button>
          ) : null}
        </footer>
      ) : null}
    </dialog>,
    document.body,
  );
}
