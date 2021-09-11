import React, { useState } from "react";
import Lottie from "react-lottie";

interface IconButtonProps {
  iconSize?: number;
  animation: any;
  autoplay?: boolean;
  active?: boolean;
  [prop: string]: any;
}

export function AnimatedIconButton({
  iconSize,
  animation,
  autoplay = false,
  active = true,
  ...props
}: IconButtonProps) {
  const [isPlaying, setIsPlaying] = useState(autoplay);
  return (
    <div
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
      <div
        css={{
          pointerEvents: "none",
          filter: active ? "inherit" : "grayscale(1)",
        }}
      >
        <Lottie
          options={{
            autoplay: autoplay,
            animationData: animation,
            rendererSettings: {
              preserveAspectRatio: "xMidYMid slice",
            },
          }}
          height={iconSize || 48}
          width={iconSize || 48}
          isStopped={!isPlaying || !active}
          isPaused={false}
        />
      </div>
    </div>
  );
}
