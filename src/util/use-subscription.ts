import { useCallback, useEffect, useState } from "react";

export function useSubscription<T>(
  subscriberFn: (setState: (value?: T) => void) => void
) {
  const [state, setState] = useState<T>();
  const subscriber = useCallback(subscriberFn, []);
  useEffect(() => subscriber(setState), [subscriber]);
  return state;
}
