import React from "react";
import { Flex } from "./Flex";

export function Tooltip({
  text,
  children,
}: {
  text: string;
  children: React.ReactNode;
}) {
  return (
    <Flex css={{ position: "relative" }}>
      {children}
      <div
        css={{
          display: "none",
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateY(-100%) translateX(-50%)",
          opacity: 0.75,
          width: "max-content",
          background: "black",
          color: "white",
          borderRadius: 4,
          padding: 4,
          fontSize: 13,
          "*:hover > &": { display: "inline-block" },
          "&:after": {
            width: 0,
            height: 0,
            borderLeft: "4px solid transparent",
            borderRight: "4px solid transparent",
            borderTop: "4px solid black",
            content: '""',
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
          },
        }}
      >
        {text}
      </div>
    </Flex>
  );
}
