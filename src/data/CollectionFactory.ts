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
      subject.subscribe(setState);
      if (!loaded) {
        loaded = true;
        init();
      }
    },
    set: (value: T) => {
      const data = JSON.stringify(value);
      localStorage.setItem(key, data);
      state = value;
      subject.next(state);
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
    const response = await fetch("/recipe-data.json");
    state = await response.json();
    subject.next(state);
  };
  return {
    initialState,
    subscribe: (setState: (t: T) => any) => {
      subject.subscribe(setState);
      if (!loaded) {
        loaded = true;
        init();
      }
    },
    get: () => {
      return state;
    },
    init,
  };
}
