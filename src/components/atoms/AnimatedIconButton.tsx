import { Darkmode } from "components/styles/Darkmode";
import React, { useState } from "react";
import Lottie from "react-lottie";
import { Flex } from "./Flex";
import { TextButton } from "./TextButton";

interface IconButtonProps {
  iconSize?: number;
  animation: any;
  autoplay?: boolean;
  active?: boolean;
  floating?: boolean;
  [prop: string]: any;
}

export function AnimatedIconButton({
  iconSize,
  animation,
  autoplay = false,
  active = true,
  floating = false,
  ...props
}: IconButtonProps) {
  const [isPlaying, setIsPlaying] = useState(autoplay);
  iconSize = iconSize ? iconSize : props.children ? 40 : 48;
  const icon = (
    <div
      css={{
        display: "inline-block",
        pointerEvents: "none",
        filter: active ? "inherit" : "grayscale(1)",
        [Darkmode]: {
          filter: active
            ? "invert(0.8) hue-rotate(180deg)"
            : "invert(1)  hue-rotate(180deg) grayscale(1)",
        },
        ...(floating
          ? {
              background: "white",
              borderRadius: iconSize / 2,
              boxShadow: "2px 2px 8px 2px #c0c0c0",
            }
          : {}),
      }}
    >
      <Lottie
        options={{
          autoplay: autoplay,
          loop: false,
          animationData: animation,
          rendererSettings: {
            preserveAspectRatio: "xMidYMid slice",
          },
        }}
        height={iconSize}
        width={iconSize}
        isStopped={!isPlaying || !active}
        isPaused={false}
      />
    </div>
  );
  return (
    <div
      css={{ cursor: "pointer" }}
      {...props}
      onMouseEnter={() => {
        if (!isPlaying) {
          setIsPlaying(true);
        }
      }}
      onMouseLeave={() => {
        if (isPlaying) {
          setIsPlaying(false);
        }
      }}
    >
      {props.children ? (
        <TextButton css={{ padding: "0 8px 0 0" }}>
          <Flex css={{ alignItems: "center" }}>
            {icon} {props.children}
          </Flex>
        </TextButton>
      ) : (
        icon
      )}
    </div>
  );
}
