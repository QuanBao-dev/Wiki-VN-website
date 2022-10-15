import { BehaviorSubject } from "rxjs";

export function createStore<T>(initialState: T) {
  const behaviorSubject = new BehaviorSubject(initialState);
  let state = initialState;
  return {
    subscribe: (setState: React.Dispatch<React.SetStateAction<T>>) =>
      behaviorSubject.subscribe(setState),
    currentState: () => {
      let ans = initialState;
      behaviorSubject.subscribe((v) => (ans = v));
      return ans || initialState;
    },
    updateState: (object: Partial<T>) => {
      state = {
        ...state,
        ...object,
      };
      behaviorSubject.next(state);
    },
  };
}
