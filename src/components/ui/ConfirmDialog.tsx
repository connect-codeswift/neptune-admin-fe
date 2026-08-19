"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button, type ButtonVariant } from "./Button";

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: ReactNode;
  cancelLabel?: string;
  confirmLabel?: string;
  confirmVariant?: Extract<ButtonVariant, "danger" | "primary">;
  loading?: boolean;
  disabled?: boolean;
  onCancel?: () => void;
  onConfirm?: () => void;
  /** Close when clicking the dimmed backdrop. Defaults to true. */
  closeOnBackdrop?: boolean;
  className?: string;
};

export function ConfirmDialog({
  open,
  title,
  description,
  cancelLabel = "Cancel",
  confirmLabel = "Confirm",
  confirmVariant = "danger",
  loading = false,
  disabled = false,
  onCancel,
  onConfirm,
  closeOnBackdrop = true,
  className = "",
}: Readonly<ConfirmDialogProps>) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      cancelRef.current?.focus();
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
      if (event.target === dialog) onCancel?.();
    };

    const handleCancel = (event: Event) => {
      event.preventDefault();
      if (!loading) onCancel?.();
    };

    dialog.addEventListener("click", handleBackdropClick);
    dialog.addEventListener("cancel", handleCancel);
    return () => {
      dialog.removeEventListener("click", handleBackdropClick);
      dialog.removeEventListener("cancel", handleCancel);
    };
  }, [open, closeOnBackdrop, loading, onCancel]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      className={`bg-ehs-surface backdrop:bg-ehs-overlay fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border-0 p-6 shadow-(--ehs-shadow-modal) backdrop:backdrop-blur-[2px] open:flex open:flex-col ${className}`.trim()}
    >
      <h2 id={titleId} className="text3 text-ehs-darker">
        {title}
      </h2>

      {description ? (
        <div
          id={descriptionId}
          className="text4 text-ehs-gray [&_strong]:text-ehs-darker mt-3 leading-6 [&_strong]:font-bold"
        >
          {description}
        </div>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center justify-end gap-3">
        <Button
          ref={cancelRef}
          type="button"
          variant="secondary"
          disabled={loading || disabled}
          onClick={onCancel}
        >
          {cancelLabel}
        </Button>
        <Button
          type="button"
          variant={confirmVariant}
          loading={loading}
          disabled={disabled}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </dialog>,
    document.body,
  );
}
