import { css } from "@emotion/core";
import React, { Fragment, useState } from "react";
import ReactMarkdown from "react-markdown";
import Ingredient from "data/ingredients";
import { Flex } from "../../../components/atoms/Flex";
import { IngredientList } from "../../../components/organisms/IngredientList";
import { Breakpoint } from "../../../components/styles/Breakpoint";
import { Stack } from "../../../components/atoms/Stack";
import { RecipeStep as Step, RecipeTimer } from "../../../data/recipes";
import { Timer } from "./Timer";
import { TimerText } from "./TimerText";
import { ImageContent } from "../../../components/atoms/ImageContent";
import { Notable } from "../Notable";

interface Props {
  step: Step;
  stepNumber: number;
  ingredients: Ingredient[];
  recipeSlug: string;
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
  recipeSlug,
  ...rest
}: Props) {
  const [timers, setTimers] = useState<TimerState[]>(
    step.timers.map((timer) => ({ timer }))
  );
  console.log(timers);

  const renderers = {
    p: ({ children }: { children: React.ReactNode[] }) => {
      const fragments = children
        ?.map((value) => {
          if (value && typeof value === "string") {
            return value.split(/(then|\.)/i);
          } else {
            return value;
          }
        })
        .flat();

      return (
        <>
          {fragments.map((value, idx) => {
            if (value && typeof value === "string") {
              return value
                .split(/(\d+(?:[-–]\d+)? minutes?)/)
                .map((fragment) => {
                  if (fragment.match(/^(\d+(?:[-–]\d+)? minutes?)$/)) {
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
                          setTimers([
                            ...timers,
                            { ...timer, alarmId, alarmElem },
                          ]);
                        }}
                      />
                    );
                  }
                  return <Fragment key={idx}>{fragment}</Fragment>;
                });
            } else {
              return value;
            }
          })}
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
      {step.images.length ? (
        <div css={{ marginRight: "8px" }}>
          {step.images.map((img) => (
            <ImageContent
              key={img}
              src={img}
              css={{ width: 250, borderRadius: 8 }}
              alt=""
            ></ImageContent>
          ))}
        </div>
      ) : null}
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
        <Notable
          slug={recipeSlug}
          field={["step", stepNumber.toString()]}
          value={step.method}
        >
          {(value) => (
            <ReactMarkdown components={renderers}>{value}</ReactMarkdown>
          )}
        </Notable>
        <Stack>
          {console.log("timers", timers)}
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
