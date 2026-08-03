"use client";

import { Icon } from "@iconify/react";
import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { IconButton } from "./IconButton";

export type ContextMenuAction = {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  danger?: boolean;
  onSelect?: () => void;
  separator?: false;
};

export type ContextMenuSeparator = {
  id: string;
  separator: true;
};

export type ContextMenuItem = ContextMenuAction | ContextMenuSeparator;

export type ContextMenuProps = {
  items: ContextMenuItem[];
  /** Custom trigger. Defaults to a vertical ⋮ IconButton. */
  children?: ReactNode;
  align?: "start" | "end";
  disabled?: boolean;
  className?: string;
  menuClassName?: string;
  label?: string;
};

function isSeparator(item: ContextMenuItem): item is ContextMenuSeparator {
  return item.separator === true;
}

export function ContextMenu({
  items,
  children,
  align = "end",
  disabled = false,
  className = "",
  menuClassName = "",
  label = "Open menu",
}: Readonly<ContextMenuProps>) {
  const generatedId = useId();
  const menuId = `${generatedId}-menu`;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const toggle = () => {
    if (disabled) return;
    setOpen((current) => !current);
  };

  const menuStyle: CSSProperties =
    align === "end" ? { right: 0 } : { left: 0 };

  let trigger: ReactNode;
  if (children && isValidElement(children)) {
    const child = children as ReactElement<{
      onClick?: (event: ReactMouseEvent) => void;
      "aria-haspopup"?: string | boolean;
      "aria-expanded"?: boolean;
      "aria-controls"?: string;
      disabled?: boolean;
    }>;
    trigger = cloneElement(child, {
      onClick: (event: ReactMouseEvent) => {
        child.props.onClick?.(event);
        if (!event.defaultPrevented) toggle();
      },
      "aria-haspopup": true,
      "aria-expanded": open,
      "aria-controls": menuId,
      disabled: disabled || child.props.disabled,
    });
  } else if (children) {
    trigger = (
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={toggle}
        className="inline-flex cursor-pointer items-center"
      >
        {children}
      </button>
    );
  } else {
    trigger = (
      <IconButton
        icon="mdi:dots-vertical"
        label={label}
        variant="ghost"
        shape="rounded"
        size="sm"
        disabled={disabled}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={toggle}
      />
    );
  }

  return (
    <div
      ref={rootRef}
      className={`relative inline-flex ${className}`.trim()}
    >
      {trigger}
      {open ? (
        <div
          id={menuId}
          role="menu"
          style={menuStyle}
          className={`absolute top-[calc(100%+0.25rem)] z-30 min-w-44 overflow-hidden rounded-[10px] border border-darkest/12 bg-white p-1 shadow-[0_8px_24px_rgba(15,23,42,0.12)] ${menuClassName}`.trim()}
        >
          {items.map((item) => {
            if (isSeparator(item)) {
              return (
                <hr
                  key={item.id}
                  className="my-1 border-0 border-t border-darkest/10"
                />
              );
            }

            return (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  if (item.disabled) return;
                  item.onSelect?.();
                  setOpen(false);
                }}
                className={`flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                  item.danger
                    ? "text-red hover:bg-red/5"
                    : "text-darkest hover:bg-lightgray"
                }`}
              >
                {item.icon ? (
                  <Icon
                    icon={item.icon}
                    width={16}
                    height={16}
                    className="shrink-0"
                    aria-hidden
                  />
                ) : null}
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
