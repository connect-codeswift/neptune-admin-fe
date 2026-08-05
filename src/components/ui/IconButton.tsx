"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";

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
};

const SIZE_CLASS: Record<IconButtonSize, { box: string; icon: number }> = {
  sm: { box: "size-8", icon: 16 },
  md: { box: "size-10", icon: 20 },
  lg: { box: "size-12", icon: 22 },
};

const SHAPE_CLASS: Record<IconButtonShape, string> = {
  rounded: "rounded-[10px]",
  circle: "rounded-full",
};

const VARIANT_CLASS: Record<IconButtonVariant, string> = {
  soft: "border border-darkest/10 bg-lightgray text-darkest hover:bg-blue-lightest hover:text-blue-deep",
  solid: "bg-blue-normal text-white hover:opacity-95",
  ghost:
    "border border-transparent bg-transparent text-gray hover:border-darkest/10 hover:bg-lightgray hover:text-darkest",
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
    type = "button",
    onClick,
    children,
    ...props
  },
  ref,
) {
  const router = useRouter();
  const sizeToken = SIZE_CLASS[size];

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || disabled || !href) return;
    router.push(href);
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      aria-label={label}
      title={label}
      onClick={handleClick}
      className={`inline-flex cursor-pointer items-center justify-center outline-none transition-colors focus-visible:ring-2 focus-visible:ring-blue-normal/30 disabled:cursor-not-allowed disabled:opacity-60 ${
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
});
