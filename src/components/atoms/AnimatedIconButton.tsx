import React, { useState } from "react";
import Lottie from "react-lottie";
import paperbag from "./animations/paper-bag.json";
import reverseclock from "./animations/reverse-clock.json";
import pasta from "./animations/pasta.json";

type IconButtonProps = {
  iconSize?: number;
  iconType: "paperbag" | "reverseclock" | "pasta";
};

const icons = {
  paperbag,
  reverseclock,
  pasta,
};

export function AnimatedIconButton(props: IconButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
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
          autoplay: false,
          animationData: icons[props.iconType],
          rendererSettings: {
            preserveAspectRatio: "xMidYMid slice",
          },
        }}
        height={props.iconSize || 48}
        width={props.iconSize || 48}
        isStopped={!isPlaying}
        isPaused={false}
      />
    </div>
  );
}
