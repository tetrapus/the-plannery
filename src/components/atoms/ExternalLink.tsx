import { Darkmode } from "components/styles/Darkmode";
import React from "react";

export function ExternalLink(
  props: React.DetailedHTMLProps<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    HTMLAnchorElement
  >
) {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      css={{
        fontWeight: "bold",
        color: "#2259b5",
        textDecoration: "none",
        [Darkmode]: { color: "#56c7ff" },
      }}
      {...props}
    >
      {props.children}
    </a>
  );
}
