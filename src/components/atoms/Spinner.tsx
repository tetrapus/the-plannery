import React, { useEffect, useState } from "react";
import { AnimatedIconButton } from "./AnimatedIconButton";
import foodIcons from "animations/foods.json";
import { keyframes } from "@emotion/core";

const fadeInOut = keyframes`
  0% {
    transform: scale(0) translateX(50%);
  }

  10% {
    transform: scale(0.3) translateX(40%);
  }

  20% {
      transform: scale(0.5) translateX(30%);
  }

  30% {
      transform: scale(0.6) translateX(20%);
  }

  40% {
    transform: scale(0.8)  translateX(10%);
  }

  50% {
    transform: scale(1) translateX(0%);
    opacity: 1;
  }

  90% {
    transform: scale(0.3) translateX(-40%);
  }

  100% {
    opacity: 0;
    transform: scale(0) translateX(-50%);
  }
`;

export function Spinner(
  props: JSX.IntrinsicAttributes &
    React.ClassAttributes<HTMLDivElement> &
    React.HTMLAttributes<HTMLDivElement> & { size?: number }
) {
  const [icons, setIcons] = useState<any[]>([]);
  const [iconIdx, setIconIdx] = useState<number>(0);
  useEffect(() => {
    const array = foodIcons as any[];
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    setIcons(array);
  }, []);

  if (!icons.length) {
    return null;
  }

  return (
    <div
      css={{
        margin: "auto",
        animation: `${fadeInOut} 2.5s infinite linear`,
        animationDelay: "0.75s",
        transform: "scale(0) translateX(50%)",
      }}
      {...props}
      onAnimationIteration={() => setIconIdx((iconIdx + 1) % icons.length)}
    >
      <AnimatedIconButton
        animation={icons[iconIdx].data}
        autoplay={true}
        iconSize={props.size || 128}
      />
    </div>
  );
}
