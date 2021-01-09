import React from "react";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  value: boolean;
  onChange: (value: boolean) => void;
  [prop: string]: any;
}

export function ToggleButton({ children, value, onChange, ...rest }: Props) {
  return (
    <div
      css={{
        borderRadius: 4,
        padding: "4px 8px",
        fontSize: 16,
        background: value ? "black" : "#aaa",
        color: value ? "white" : "black",
        fontWeight: value ? "bold" : "normal",
        display: "inline-block",
        cursor: "pointer",
      }}
      onClick={() => onChange(!value)}
      {...rest}
    >
      {children}
    </div>
  );
}
