import React, { ReactNode } from "react";
import { AnimatedIconButton } from "./AnimatedIconButton";
import { Flex } from "./Flex";
import errorIcon from "animations/error.json";

export function ErrorBanner({ children }: { children: ReactNode }) {
  return (
    <Flex
      css={{
        border: "1px solid red",
        borderTopWidth: 4,
        padding: "4px 8px",
        margin: 8,
        background: "rgba(255,0,0,0.02)",
        boxShadow: "0 0 2px 1px rgb(255 0 0 / 50%)",
      }}
    >
      <AnimatedIconButton
        animation={errorIcon}
        autoplay={true}
        css={{ margin: 4 }}
      />
      <div css={{ margin: "8px 4px" }}>{children}</div>
    </Flex>
  );
}
