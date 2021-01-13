import { css } from "@emotion/core";
import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import Ingredient from "../../data/ingredients";
import { Flex } from "../../components/atoms/Flex";
import { IngredientList } from "../../components/organisms/IngredientList";
import { Breakpoint } from "../../components/styles/Breakpoint";
import { Stack } from "../../components/atoms/Stack";
import { faPlayCircle, faStopCircle } from "@fortawesome/free-solid-svg-icons";
import { IconButton } from "../../components/atoms/IconButton";
import { RecipeStep as Step, RecipeTimer } from "../../data/recipes";
import ReactTimeAgo from "react-timeago";

interface Props {
  step: Step;
  stepNumber: number;
  ingredients: Ingredient[];
  state?: { state: "done" | "claimed"; by: string };
  users: any;
  [key: string]: any;
}

function TimerText({
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
  const duration = parseInt(durationText[0]);
  return (
    <b
      onClick={() =>
        onTimerCreate({
          timer: { name, duration },
          startTime: Date.now(),
        })
      }
    >
      {text}
    </b>
  );
}

interface TimerState {
  timer: RecipeTimer;
  startTime?: number;
  pauseTime?: number;
  alarmId?: any;
  alarmElem?: HTMLAudioElement;
}

function Countdown({ date }: { date: number }) {
  const [time, setTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setTime(Date.now()), 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  if (time > date) {
    return (
      <span css={{ color: "red" }}>
        <ReactTimeAgo date={date}></ReactTimeAgo>
      </span>
    );
  }
  const remaining = Math.round((date - time) / 1000);
  return (
    <b>
      {`${Math.floor(remaining / 60)}`.padStart(2, "0")}:
      {`${remaining % 60}`.padStart(2, "0")}
    </b>
  );
}

interface TimerProps {
  timer: RecipeTimer;
  startTime?: number;
  pauseTime?: number;
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
}

function soundAlarm() {
  const alarm = new Audio(
    "https://freesound.org/data/previews/250/250629_4486188-lq.mp3"
  );
  alarm.loop = true;
  alarm.play();
  return alarm;
}

function Timer({ timer, startTime, onStart, onStop }: TimerProps) {
  return (
    <Flex css={{ paddingBottom: 4, alignItems: "center" }}>
      {startTime ? (
        <IconButton
          icon={faStopCircle}
          iconSize={24}
          color="crimson"
          onClick={() => onStop()}
        />
      ) : (
        <IconButton
          icon={faPlayCircle}
          iconSize={24}
          onClick={() => onStart()}
        />
      )}
      {timer.name}
      {console.log(timer)}
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
          {fragments.map((value) =>
            value.split(/(\d+(?:-\d+)? minutes?)/).map((fragment) => {
              if (fragment.match(/^(\d+(?:-\d+)? minutes?)$/)) {
                return (
                  <TimerText
                    text={fragment}
                    context={value}
                    onTimerCreate={(timer) => {
                      const idx = timers.length;
                      const alarmId = setTimeout(() => {
                        setTimers((timers) =>
                          timers.map((timer, idx2) =>
                            idx2 === idx
                              ? { ...timer, alarmElem: soundAlarm() }
                              : timer
                          )
                        );
                      }, timer.timer.duration * 1000);
                      setTimers([...timers, { ...timer, alarmId }]);
                    }}
                  />
                );
              }
              return <>{fragment}</>;
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
                    const alarmId = setTimeout(() => {
                      setTimers((timers) =>
                        timers.map((timer, idx2) =>
                          idx2 === idx
                            ? { ...timer, alarmElem: soundAlarm() }
                            : timer
                        )
                      );
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
