import React from "react";
import { Flex } from "../../../components/atoms/Flex";
import { faPlayCircle, faStopCircle } from "@fortawesome/free-solid-svg-icons";
import { IconButton } from "../../../components/atoms/IconButton";
import { Countdown } from "./Countdown";
import { RecipeTimer } from "../../../data/recipes";

export interface TimerProps {
  timer: RecipeTimer;
  startTime?: number;
  pauseTime?: number;
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
}

export function Timer({ timer, startTime, onStart, onStop }: TimerProps) {
  console.log(timer);
  return (
    <Flex css={{ paddingBottom: 4, alignItems: "center" }}>
      {startTime ? (
        <IconButton
          icon={faStopCircle}
          iconSize={24}
          color="crimson"
          onClick={(e) => {
            e.stopPropagation();
            onStop();
          }}
        />
      ) : (
        <IconButton
          icon={faPlayCircle}
          iconSize={24}
          onClick={(e) => {
            e.stopPropagation();
            onStart();
          }}
        />
      )}
      {timer.name}
      {startTime ? (
        <div css={{ marginLeft: "auto" }}>
          <Countdown date={startTime + timer.duration * 1000}></Countdown>
        </div>
      ) : (
        <></>
      )}
    </Flex>
  );
}
