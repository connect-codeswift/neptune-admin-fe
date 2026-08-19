"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";
import {
  ehsButtonDangerClass,
  ehsButtonPrimaryClass,
  ehsButtonSecondaryClass,
  ehsButtonTertiaryClass,
} from "@/lib/ehs-classes";

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
  /**
   * Why this button is disabled, surfaced on hover and to assistive tech.
   *
   * `disabled:pointer-events-none` in BASE_CLASS means a disabled button never
   * receives hover, so its own `title` can never appear — the browser only
   * shows a tooltip for an element that gets pointer events. Explaining a
   * disabled control therefore needs a wrapper that is *not* disabled, which
   * several call sites had each hand-rolled as a `<span title>`.
   *
   * Passing this wraps the button in that span and adds an `sr-only` note, so
   * the reason reaches a mouse user and a screen-reader user alike. Ignored
   * unless the button is actually disabled.
   */
  disabledReason?: string;
};

/**
 * The shared half of `ehsButtonBaseClass`, minus everything that describes a
 * size.
 *
 * The EHSS recipe is a one-size button, so it bakes `rounded-lg px-4 py-2.5
 * text-sm font-semibold` into its base. This Button carries a `size` prop, so
 * radius, padding and type scale come from SIZE_CLASS below instead. They
 * cannot be declared in both places: two `px-*` utilities on one element are
 * resolved by stylesheet order, not by the order they appear in the class
 * string, so the winner would be whichever Tailwind happened to emit last.
 */
const BASE_CLASS =
  "inline-flex cursor-pointer items-center justify-center transition-colors outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ehs-normal-blue/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50";

/**
 * The four tiers of the glass system. This app's `ghost` is the EHSS
 * `tertiary` recipe — the frosted, quiet tier — under the name dozens of call
 * sites already pass.
 */
const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: ehsButtonPrimaryClass,
  secondary: ehsButtonSecondaryClass,
  danger: ehsButtonDangerClass,
  ghost: ehsButtonTertiaryClass,
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: "h-9 gap-1.5 rounded-lg px-3 text5",
  md: "h-11 gap-2 rounded-2.5 px-4 text5",
  lg: "h-12 gap-2 rounded-2.5 px-5 text5",
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
      disabledReason,
      type = "button",
      onClick,
      ...props
    },
    ref,
  ) {
    const router = useRouter();
    const isDisabled = disabled || loading;
    // Only while genuinely disabled, and never for a loading button — "why is
    // this off?" is not a question a spinner raises.
    const shownReason = disabled && !loading ? disabledReason : undefined;

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented || isDisabled || !href) return;
      router.push(href);
    };

    const button = (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        onClick={handleClick}
        className={`${BASE_CLASS} ${
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
              className="animate-spin motion-reduce:animate-none"
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

    if (!shownReason) return button;

    // `inline-flex` rather than a bare span so `fullWidth` still fills, and
    // the wrapper does not become a line-box of its own between other controls.
    return (
      <span
        title={shownReason}
        className={fullWidth ? "inline-flex w-full" : "inline-flex"}
      >
        {button}
        <span className="sr-only">{shownReason}</span>
      </span>
    );
  },
);
