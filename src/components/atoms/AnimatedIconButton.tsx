import React, { useState } from "react";
import Lottie from "react-lottie";

interface IconButtonProps {
  iconSize?: number;
  animation: any;
  autoplay?: boolean;
}

export function AnimatedIconButton({
  iconSize,
  animation,
  autoplay = false,
}: IconButtonProps) {
  const [isPlaying, setIsPlaying] = useState(autoplay);
  return (
    <div
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
      <Lottie
        css={{ pointerEvents: "none" }}
        options={{
          autoplay: autoplay,
          animationData: animation,
          rendererSettings: {
            preserveAspectRatio: "xMidYMid slice",
          },
        }}
        height={iconSize || 48}
        width={iconSize || 48}
        isStopped={!isPlaying}
        isPaused={false}
      />
    </div>
  );
}
