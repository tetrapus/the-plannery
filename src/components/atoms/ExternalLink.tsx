import React from "react";

export function ExternalLink(
  props: React.DetailedHTMLProps<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    HTMLAnchorElement
  >
) {
  return (
    <a
      href="https://www.woolworths.com.au/"
      target="_blank"
      rel="noopener noreferrer"
      css={{ fontWeight: "bold", color: "#007fed" }}
      {...props}
    >
      {props.children}
    </a>
  );
}
