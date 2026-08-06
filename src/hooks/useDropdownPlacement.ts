"use client";

import { useLayoutEffect, useState, type RefObject } from "react";

export type DropdownPlacement = "bottom" | "top";

const DROPDOWN_GAP_PX = 4;
const DEFAULT_MAX_MENU_HEIGHT_PX = 240;

type PlacementState = {
  placement: DropdownPlacement;
  maxHeight: number;
};

function measurePlacement(
  trigger: HTMLElement,
  menu: HTMLElement | null,
): PlacementState {
  const triggerRect = trigger.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const menuHeight = Math.min(
    menu?.offsetHeight ?? DEFAULT_MAX_MENU_HEIGHT_PX,
    DEFAULT_MAX_MENU_HEIGHT_PX,
  );

  const spaceBelow = viewportHeight - triggerRect.bottom - DROPDOWN_GAP_PX;
  const spaceAbove = triggerRect.top - DROPDOWN_GAP_PX;
  const opensUpward =
    spaceBelow < menuHeight && spaceAbove > spaceBelow;

  if (opensUpward) {
    return {
      placement: "top",
      maxHeight: Math.max(Math.min(spaceAbove, DEFAULT_MAX_MENU_HEIGHT_PX), 120),
    };
  }

  return {
    placement: "bottom",
    maxHeight: Math.max(Math.min(spaceBelow, DEFAULT_MAX_MENU_HEIGHT_PX), 120),
  };
}

export function useDropdownPlacement(
  open: boolean,
  triggerRef: RefObject<HTMLElement | null>,
  listboxRef: RefObject<HTMLElement | null>,
  deps: unknown[] = [],
): PlacementState & { menuPositionClassName: string } {
  const [state, setState] = useState<PlacementState>({
    placement: "bottom",
    maxHeight: DEFAULT_MAX_MENU_HEIGHT_PX,
  });

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) {
      setState({
        placement: "bottom",
        maxHeight: DEFAULT_MAX_MENU_HEIGHT_PX,
      });
      return;
    }

    const updatePlacement = () => {
      if (!triggerRef.current) return;
      setState(measurePlacement(triggerRef.current, listboxRef.current));
    };

    updatePlacement();
    window.addEventListener("resize", updatePlacement);
    window.addEventListener("scroll", updatePlacement, true);
    return () => {
      window.removeEventListener("resize", updatePlacement);
      window.removeEventListener("scroll", updatePlacement, true);
    };
  }, [open, triggerRef, listboxRef, ...deps]);

  const menuPositionClassName =
    state.placement === "top" ? "bottom-full mb-1" : "top-full mt-1";

  return {
    ...state,
    menuPositionClassName,
  };
}
