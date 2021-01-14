import { css } from "@emotion/core";
import React, { Fragment, useState } from "react";
import ReactMarkdown from "react-markdown";
import Ingredient from "data/ingredients";
import { Flex } from "components/atoms/Flex";
import { IngredientList } from "components/organisms/IngredientList";
import { Breakpoint } from "components/styles/Breakpoint";
import { Stack } from "components/atoms/Stack";
import { RecipeStep as Step, RecipeTimer } from "../../../data/recipes";
import { Timer } from "./Timer";
import { TimerText } from "./TimerText";

interface Props {
  step: Step;
  stepNumber: number;
  ingredients: Ingredient[];
  state?: { state: "done" | "claimed"; by: string };
  users: any;
  [key: string]: any;
}

export interface TimerState {
  timer: RecipeTimer;
  startTime?: number;
  pauseTime?: number;
  alarmId?: any;
  alarmElem?: HTMLAudioElement;
}

function soundAlarm(alarm: HTMLAudioElement) {
  alarm.src = "https://freesound.org/data/previews/250/250629_4486188-lq.mp3";
  alarm.loop = true;
  alarm.play();
}

export function RecipeStep({
  step,
  stepNumber,
  ingredients,
  state,
  users,
  ...rest
}: Props) {
  const [timers, setTimers] = useState<TimerState[]>(
    step.timers.map((timer) => ({ timer }))
  );

  const renderers = {
    text: ({ value }: { value: string }) => {
      const fragments = value.split(/(then|\.)/i);

      return (
        <>
          {fragments.map((value, idx) =>
            value.split(/(\d+(?:-\d+)? minutes?)/).map((fragment) => {
              if (fragment.match(/^(\d+(?:-\d+)? minutes?)$/)) {
                return (
                  <TimerText
                    key={idx}
                    text={fragment}
                    context={value}
                    onTimerCreate={(timer) => {
                      const alarmElem = new Audio();
                      alarmElem.play();
                      const alarmId = setTimeout(() => {
                        soundAlarm(alarmElem);
                      }, timer.timer.duration * 1000);
                      setTimers([...timers, { ...timer, alarmId, alarmElem }]);
                    }}
                  />
                );
              }
              return <Fragment key={idx}>{fragment}</Fragment>;
            })
          )}
        </>
      );
    },
  };

  return (
    <Flex
      css={{
        marginBottom: 16,
        marginLeft: 16,
        minHeight: 100,
        alignItems: "center",
        position: "relative",
        "&:not(:last-child)": {
          borderBottom: "1px solid #eee",
          paddingBottom: 8,
        },
        [Breakpoint.MOBILE]: {
          flexDirection: "column",
        },
        opacity: state?.state === "done" ? 0.5 : 1,
      }}
      {...rest}
    >
      <h1
        css={{
          position: "absolute",
          left: -56,
          margin: 0,

          [Breakpoint.TABLET]: {
            left: -12,
          },
        }}
      >
        {stepNumber}
      </h1>
      <div css={{ marginRight: "8px" }}>
        {step.images.map((img) => (
          <img
            key={img}
            src={img}
            css={css`
              width: 250px;
            `}
            alt=""
          ></img>
        ))}
      </div>
      <div
        css={css`
          padding: 16px 8px;
        `}
      >
        {state && state.state === "claimed" ? (
          <Flex css={{ alignItems: "center", fontWeight: "bold" }}>
            <img
              src={users[state.by].photoURL}
              css={{ width: 32, marginRight: 8 }}
              alt=""
            />
            {users[state.by].displayName}
          </Flex>
        ) : null}
        <ReactMarkdown renderers={renderers}>{step.method}</ReactMarkdown>
        <Stack>
          {timers.map(({ timer, startTime }, idx) => (
            <Timer
              key={idx}
              timer={timer}
              startTime={startTime}
              onStart={() => {
                setTimers(
                  timers.map((timerState, idx2) => {
                    if (idx2 !== idx) {
                      return timerState;
                    }
                    const alarmElem = new Audio();
                    alarmElem.play();
                    const alarmId = setTimeout(() => {
                      soundAlarm(alarmElem);
                    }, timer.duration * 1000);
                    return {
                      ...timerState,
                      startTime: Date.now(),
                      alarmId,
                    };
                  })
                );
              }}
              onPause={() => null}
              onStop={() => {
                setTimers(
                  timers.map((timerState, idx2) => {
                    if (idx2 !== idx) {
                      return timerState;
                    }
                    if (timerState.alarmId) {
                      clearTimeout(timerState.alarmId);
                    }
                    if (timerState.alarmElem) {
                      timerState.alarmElem.pause();
                    }
                    return {
                      ...timerState,
                      startTime: undefined,
                      alarmId: undefined,
                      alarmElem: undefined,
                    };
                  })
                );
              }}
            />
          ))}
        </Stack>
        <IngredientList ingredients={ingredients} />
      </div>
    </Flex>
  );
}
