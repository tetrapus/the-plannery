import { useCallback, useEffect, useState } from "react";

export function useSubscription<T>(
  subscriber: (setState: (value?: T) => void) => void
) {
  const [state, setState] = useState<T>();
  useCallback(subscriber, []);
  useEffect(() => subscriber(setState), [subscriber]);
  return state;
}
