import { BehaviorSubject } from "rxjs";

export function ExternalCollectionFactory<T>(url: string, initialState: T) {
  const subject = new BehaviorSubject<T>(initialState);
  let state: T = initialState;
  let loaded = false;
  const init = async () => {
    const cache = await caches.open("recipe-cache");
    const cachedResponse = await cache.match(url);
    let response;
    if (!cachedResponse) {
      response = await fetch(url);
      await cache.put(url, response);
      response = await cache.match(url);
    } else {
      response = cachedResponse;
    }

    state = await response?.json();
    subject.next(state);
  };
  return {
    initialState,
    subscribe: (setState: (t: T) => any) => {
      const subscription = subject.subscribe(setState);
      if (!loaded) {
        loaded = true;
        init();
      }
      return () => subscription.unsubscribe();
    },
    get: () => {
      return state;
    },
    init,
  };
}
