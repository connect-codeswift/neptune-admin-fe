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

const VARIANT_CLASS: Record<TextButtonVariant, string> = {
  default: "text-blue-normal hover:text-blue-deep",
  muted: "text-gray hover:text-darkest",
  danger: "text-red hover:text-red/80",
};

const SIZE_CLASS: Record<TextButtonSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
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
      className={`inline-flex cursor-pointer items-center gap-1 bg-transparent p-0 font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-blue-normal/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
        VARIANT_CLASS[variant]
      } ${SIZE_CLASS[size]} ${UNDERLINE_CLASS[underline]} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
