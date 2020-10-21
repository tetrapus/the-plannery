import { BehaviorSubject } from "rxjs";

export function CollectionFactory<T>(key: string, initialState: T) {
  const subject = new BehaviorSubject<T>(initialState);
  let state: T;
  let loaded = false;
  const init = () => {
    const data = localStorage.getItem(key);
    if (data) {
      state = JSON.parse(data);
    } else {
      state = initialState;
    }
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
      return subscription.unsubscribe;
    },
    set: (value: T) => {
      state = value;
      subject.next(state);
      const data = JSON.stringify(value);
      localStorage.setItem(key, data);
    },
    get: () => {
      return state;
    },
    init,
  };
}

export function ExternalCollectionFactory<T>(url: string, initialState: T) {
  const subject = new BehaviorSubject<T>(initialState);
  let state: T = initialState;
  let loaded = false;
  const init = async () => {
    const response = await fetch(url);
    state = await response.json();
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
      return subscription.unsubscribe;
    },
    get: () => {
      return state;
    },
    init,
  };
}
