"use client";

import { useRouter } from "next/navigation";
import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from "react";

export type TextButtonVariant = "default" | "muted" | "danger";
export type TextButtonSize = "sm" | "md" | "lg";

export type TextButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "type"
> & {
  type?: "button" | "submit" | "reset";
  variant?: TextButtonVariant;
  size?: TextButtonSize;
  href?: string;
  underline?: "always" | "hover" | "none";
  children?: ReactNode;
};

/**
 * `ehsTextButtonClass` with its colour and type scale lifted out: that recipe
 * hardcodes the brand ink and `text-sm`, and this button has `variant` and
 * `size` props for both. A second `text-*` colour appended after it would win
 * or lose on stylesheet order rather than on the variant the caller asked for,
 * so the shared half lives here and the tiers below restate the ink.
 */
const BASE_CLASS =
  "inline-flex cursor-pointer items-center gap-1 rounded bg-transparent p-0 transition-colors outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ehs-normal-blue/20 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50";

const VARIANT_CLASS: Record<TextButtonVariant, string> = {
  default: "text-ehs-normal-blue hover:text-ehs-normal-blue-hover",
  muted: "text-ehs-gray hover:text-ehs-darker",
  danger: "text-ehs-red hover:text-ehs-red-ink-soft",
};

const SIZE_CLASS: Record<TextButtonSize, string> = {
  sm: "text8",
  md: "text4",
  lg: "text5",
};

const UNDERLINE_CLASS = {
  always: "underline underline-offset-2",
  hover: "hover:underline hover:underline-offset-2",
  none: "no-underline",
} as const;

export function TextButton({
  children,
  variant = "default",
  size = "md",
  href,
  underline = "hover",
  className = "",
  disabled,
  type = "button",
  onClick,
  ...props
}: Readonly<TextButtonProps>) {
  const router = useRouter();

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || disabled || !href) return;
    router.push(href);
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={handleClick}
      className={`${BASE_CLASS} ${
        VARIANT_CLASS[variant]
      } ${SIZE_CLASS[size]} ${UNDERLINE_CLASS[underline]} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
