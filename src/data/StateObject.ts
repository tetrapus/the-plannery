import { Dispatch, SetStateAction, useState } from "react";

interface StateObject<T> {
  value: T;
  set: Dispatch<SetStateAction<T>>;
}

export function useStateObject<T>(initialState: T): StateObject<T> {
  const [value, set] = useState<T>(initialState);
  return { value, set };
}
