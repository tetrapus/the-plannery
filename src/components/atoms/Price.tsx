import React from "react";

interface Props {
  amount: number;
  symbol?: string;
}

export function Price({ amount, symbol = "$" }: Props) {
  return (
    <>
      {symbol}
      {amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    </>
  );
}
