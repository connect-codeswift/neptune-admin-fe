"use client";

import { Icon } from "@iconify/react";
import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
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

type MenuCoords = {
  top: number;
  left: number;
  placement: "above" | "below";
};

function isSeparator(item: ContextMenuItem): item is ContextMenuSeparator {
  return item.separator === true;
}

function measureMenu(menu: HTMLElement): { width: number; height: number } {
  const rect = menu.getBoundingClientRect();
  return {
    width: rect.width || menu.offsetWidth,
    height: rect.height || menu.offsetHeight,
  };
}

function computeMenuCoords(
  triggerRect: DOMRect,
  menuWidth: number,
  menuHeight: number,
  align: "start" | "end",
): MenuCoords {
  const gap = 4;
  const viewportPadding = 8;

  const spaceBelow =
    window.innerHeight - triggerRect.bottom - viewportPadding;
  const spaceAbove = triggerRect.top - viewportPadding;
  const requiredHeight = menuHeight + gap;

  const fitsBelow = requiredHeight <= spaceBelow;
  const fitsAbove = requiredHeight <= spaceAbove;

  let placement: MenuCoords["placement"] = "below";
  if (!fitsBelow && (fitsAbove || spaceAbove > spaceBelow)) {
    placement = "above";
  }

  let top =
    placement === "above"
      ? triggerRect.top - menuHeight - gap
      : triggerRect.bottom + gap;

  let left = align === "end" ? triggerRect.right - menuWidth : triggerRect.left;

  left = Math.max(
    viewportPadding,
    Math.min(left, window.innerWidth - menuWidth - viewportPadding),
  );

  top = Math.max(
    viewportPadding,
    Math.min(top, window.innerHeight - menuHeight - viewportPadding),
  );

  return { top, left, placement };
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
  const [coords, setCoords] = useState<MenuCoords | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open || !rootRef.current || !menuRef.current) return;

    const updatePosition = () => {
      const trigger = rootRef.current;
      const menu = menuRef.current;
      if (!trigger || !menu) return;

      const triggerRect = trigger.getBoundingClientRect();
      const { width, height } = measureMenu(menu);
      if (height <= 0) return;

      setCoords(
        computeMenuCoords(triggerRect, width, height, align),
      );
    };

    updatePosition();
    const frame = requestAnimationFrame(updatePosition);

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, align, items]);

  useEffect(() => {
    if (!open) {
      setCoords(null);
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
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

  const menu =
    open && typeof document !== "undefined" ? (
      <div
        ref={menuRef}
        id={menuId}
        role="menu"
        style={{
          position: "fixed",
          top: coords?.top ?? 0,
          left: coords?.left ?? 0,
          visibility: coords ? "visible" : "hidden",
        }}
        className={`border-ehs-border-ink/10 bg-ehs-surface z-50 min-w-44 overflow-hidden rounded-2.5 border p-1 shadow-(--ehs-shadow-popover) ${menuClassName}`.trim()}
      >
        {items.map((item) => {
          if (isSeparator(item)) {
            return (
              <hr
                key={item.id}
                className="border-ehs-border-ink/10 my-1 border-0 border-t"
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
              className={`text4 flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                item.danger
                  ? "text-ehs-red hover:bg-ehs-red/10"
                  : "text-ehs-darker hover:bg-ehs-surface-raised"
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
    ) : null;

  return (
    <div ref={rootRef} className={`inline-flex ${className}`.trim()}>
      {trigger}
      {menu ? createPortal(menu, document.body) : null}
    </div>
  );
}
