import React, { useEffect, useState } from "react";
import ReactTimeAgo from "react-timeago";

export function Countdown({ date }: { date: number }) {
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
