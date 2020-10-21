import { faCookieBite } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

export function Spinner(
  props: JSX.IntrinsicAttributes &
    React.ClassAttributes<HTMLDivElement> &
    React.HTMLAttributes<HTMLDivElement>
) {
  return (
    <div css={{ fontSize: 128, margin: "auto", opacity: 0.5 }} {...props}>
      <FontAwesomeIcon icon={faCookieBite} spin />
    </div>
  );
}
