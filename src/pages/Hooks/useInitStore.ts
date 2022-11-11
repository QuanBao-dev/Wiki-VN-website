import { useEffect } from 'react';
import { Subscription } from 'rxjs';
interface Store<T>{
  subscribe: (setState: React.Dispatch<React.SetStateAction<T>>) => Subscription;
  currentState: () => T;
  updateState: (object: T) => void;
}
export function useInitStore<T>(store:Store<T>, setState:any){
  useEffect(() => {
    const subscription = store.subscribe(setState);
    return () => {
      subscription.unsubscribe();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])
}