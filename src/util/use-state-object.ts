import { useState } from "react";

export interface State<T> {
  value: T;
  set: (value: T | ((state: T) => T)) => void;
}

export function useStateObject<T>(defaultValue: T): State<T> {
  const [value, set] = useState<T>(defaultValue);
  return { value, set };
}
