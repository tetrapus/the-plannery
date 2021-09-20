import React from "react";
import { TimerState } from "./RecipeStep";

export function TimerText({
  text,
  context,
  onTimerCreate,
}: {
  text: string;
  context: string;
  onTimerCreate: (t: TimerState) => void;
}) {
  const s = context.replace(/(^[,\s]+|[,\s]+$)/g, "");
  const name = `${s[0].toUpperCase()}${s.slice(1)}`;
  const durationText = text.match(/\d+/);
  if (!durationText) {
    return <>{text}</>;
  }
  const duration = parseInt(durationText[0]) * 60;
  return (
    <b
      onClick={(e) => {
        e.stopPropagation();
        onTimerCreate({
          timer: { name, duration },
          startTime: Date.now(),
        });
      }}
      css={{ cursor: "pointer" }}
    >
      {text}
    </b>
  );
}
