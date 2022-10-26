import { userStore } from './../../store/user';
import { useEffect } from 'react';
export function useInitStore(store = userStore, setState:any){
  useEffect(() => {
    const subscription = store.subscribe(setState);
    return () => {
      subscription.unsubscribe();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])
}