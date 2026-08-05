"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "type"
> & {
  type?: "button" | "submit" | "reset";
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  loading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  children?: ReactNode;
};

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-normal text-white hover:opacity-95 disabled:bg-blue-normal/60",
  secondary:
    "border border-darkest/12 bg-white text-darkest hover:bg-lightgray disabled:opacity-60",
  danger: "bg-red text-white hover:opacity-95 disabled:bg-red/60",
  ghost:
    "bg-transparent text-darkest hover:bg-darkest/5 disabled:opacity-60",
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: "h-9 gap-1.5 rounded-lg px-3 text5",
  md: "h-11 gap-2 rounded-[10px] px-4 text5",
  lg: "h-12 gap-2 rounded-[10px] px-5 text5",
};

export const Button = forwardRef<HTMLButtonElement, Readonly<ButtonProps>>(
  function Button(
    {
      children,
      variant = "primary",
      size = "md",
      href,
      loading = false,
      loadingText,
      fullWidth = false,
      leftIcon,
      rightIcon,
      className = "",
      disabled,
      type = "button",
      onClick,
      ...props
    },
    ref,
  ) {
    const router = useRouter();
    const isDisabled = disabled || loading;

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented || isDisabled || !href) return;
      router.push(href);
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        onClick={handleClick}
        className={`inline-flex cursor-pointer items-center justify-center font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-blue-normal/30 disabled:cursor-not-allowed ${
          VARIANT_CLASS[variant]
        } ${SIZE_CLASS[size]} ${fullWidth ? "w-full" : ""} ${className}`.trim()}
        {...props}
      >
        {loading ? (
          <>
            <Icon
              icon="mdi:loading"
              width={18}
              height={18}
              className="animate-spin"
              aria-hidden
            />
            <span>{loadingText ?? "Please wait…"}</span>
          </>
        ) : (
          <>
            {leftIcon ? (
              <Icon icon={leftIcon} width={18} height={18} aria-hidden />
            ) : null}
            {children}
            {rightIcon ? (
              <Icon icon={rightIcon} width={18} height={18} aria-hidden />
            ) : null}
          </>
        )}
      </button>
    );
  },
);
