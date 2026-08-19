import React from "react";

export type TextType =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "p"
  | "span"
  | "div"
  | "label"
  | "a"
  | "li"
  | "strong"
  | "em"
  | "blockquote"
  | "code"
  | "pre"
  | "small"
  | "sub"
  | "sup"
  | "abbr"
  | "cite"
  | "q"
  | "mark"
  | "del"
  | "ins";

export type TextProps = Readonly<
  Omit<React.HTMLAttributes<HTMLElement>, "children"> & {
    as: TextType;
    family?: "font-satoshi";
    /** Single text child only, e.g. `<Text as="p">Example</Text>` */
    children: string;
  }
>;

type AriaAttributes = Readonly<Record<string, string>>;

/**
 * Adds the right aria (or title) attribute per element type.
 * Value is always the same as `children` — the visible text is the accessible name.
 */
function getAriaAttributes(as: TextType, text: string): AriaAttributes {
  switch (as) {
    case "abbr":
      return { title: text };
    case "blockquote":
    case "pre":
      return { "aria-label": text };
    case "del":
    case "ins":
      return { "aria-label": text };
    default:
      return {};
  }
}

export function Text(props: Readonly<TextProps>) {
  const { as, family, children, className = "", ...rest } = props;
  const ariaAttributes = getAriaAttributes(as, children);
  const classes = [family, className].filter(Boolean).join(" ");

  return React.createElement(
    as,
    { className: classes || undefined, ...ariaAttributes, ...rest },
    children,
  );
}
