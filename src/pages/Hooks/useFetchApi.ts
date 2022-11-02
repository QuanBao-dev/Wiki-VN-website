import { catchError, delay, filter, mergeMapTo, pluck, retry, tap } from "rxjs/operators";
import { ajax } from "rxjs/ajax";
import { useEffect } from "react";
import { of, timer } from "rxjs";
import { updateCaches } from "../../util/updateCaches";
export function useFetchApi<T>(
  url: string,
  setState: React.Dispatch<React.SetStateAction<T>>,
  type: string,
  array: any[],
  isUpdatingCaches: boolean,
  condition: boolean = true,
  setIsLoading?: React.Dispatch<React.SetStateAction<boolean>>,
  handleError?: any,
  delayTime: number = 0
) {
  useEffect(() => {
    const subscription = timer(0)
      .pipe(
        delay(delayTime),
        tap(() => {
          if (setIsLoading)
            if (condition) {
              setIsLoading(true);
            }
        }),
        filter(() => condition),
        mergeMapTo(
          ajax({
            url: url,
            method: "GET",
          }).pipe(
            retry(5),
            pluck("response", "message"),
            catchError((error) => of(error).pipe(pluck("response")))
          )
        )
      )
      .subscribe((v: any) => {
        if (v && !v.error) {
          if (isUpdatingCaches) updateCaches<T>(v as T[], type);
          if (setIsLoading) setIsLoading(false);
          setState(v as T);
        } else {
          if (handleError) handleError();
        }
      });
    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...array]);
}
