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
  ehsIconButtonGhostClass,
  ehsIconButtonPrimaryClass,
  ehsIconButtonTertiaryClass,
} from "@/lib/ehs-classes";

export type IconButtonVariant = "soft" | "solid" | "ghost";
export type IconButtonShape = "rounded" | "circle";
export type IconButtonSize = "sm" | "md" | "lg";

export type IconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "type" | "children"
> & {
  type?: "button" | "submit" | "reset";
  icon: string;
  label: string;
  variant?: IconButtonVariant;
  shape?: IconButtonShape;
  size?: IconButtonSize;
  href?: string;
  children?: ReactNode;
  /**
   * Why this control is disabled. See the note on `Button.disabledReason` —
   * `disabled:pointer-events-none` stops a disabled button from ever showing
   * its own `title`, so the reason needs an enabled wrapper to live on.
   *
   * It is appended to the accessible name too: on an icon-only control the
   * label is the *only* thing announced, and "Delete site" with no explanation
   * of why it does nothing is worse here than on a button with visible text.
   */
  disabledReason?: string;
};

/**
 * `ehsIconButtonBaseClass` without its box: that recipe is a fixed 40px
 * rounded-lg square, and this button's `size` / `shape` props own those two
 * axes. Declaring a radius or a width twice leaves the winner to stylesheet
 * order rather than to the props the call site passed.
 */
const BASE_CLASS =
  "inline-flex shrink-0 cursor-pointer items-center justify-center transition-colors outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ehs-normal-blue/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50";

const SIZE_CLASS: Record<IconButtonSize, { box: string; icon: number }> = {
  sm: { box: "size-8", icon: 16 },
  md: { box: "size-10", icon: 20 },
  lg: { box: "size-12", icon: 22 },
};

const SHAPE_CLASS: Record<IconButtonShape, string> = {
  rounded: "rounded-2.5",
  circle: "rounded-full",
};

/**
 * `soft` — the default, and the one that sits on glass cards and table rows —
 * takes the EHSS *tertiary* recipe rather than the light-blue *secondary* one:
 * it is the frosted neutral chip, which is what `soft` has always been here.
 */
const VARIANT_CLASS: Record<IconButtonVariant, string> = {
  soft: ehsIconButtonTertiaryClass,
  solid: ehsIconButtonPrimaryClass,
  ghost: ehsIconButtonGhostClass,
};

export const IconButton = forwardRef<
  HTMLButtonElement,
  Readonly<IconButtonProps>
>(function IconButton(
  {
    icon,
    label,
    variant = "soft",
    shape = "rounded",
    size = "md",
    href,
    className = "",
    disabled,
    disabledReason,
    type = "button",
    onClick,
    children,
    ...props
  },
  ref,
) {
  const router = useRouter();
  const sizeToken = SIZE_CLASS[size];
  const shownReason = disabled ? disabledReason : undefined;
  const accessibleName = shownReason ? `${label} — ${shownReason}` : label;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || disabled || !href) return;
    router.push(href);
  };

  const button = (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      aria-label={accessibleName}
      title={accessibleName}
      onClick={handleClick}
      className={`${BASE_CLASS} ${
        VARIANT_CLASS[variant]
      } ${SHAPE_CLASS[shape]} ${sizeToken.box} ${className}`.trim()}
      {...props}
    >
      {children ?? (
        <Icon
          icon={icon}
          width={sizeToken.icon}
          height={sizeToken.icon}
          aria-hidden
        />
      )}
    </button>
  );

  if (!shownReason) return button;

  // An enabled wrapper, purely so the tooltip has something that receives
  // hover. `inline-flex` keeps the button's box and alignment unchanged.
  return (
    <span title={accessibleName} className="inline-flex">
      {button}
    </span>
  );
});
