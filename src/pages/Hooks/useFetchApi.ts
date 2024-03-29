import {
  catchError,
  delay,
  filter,
  mergeMapTo,
  pluck,
  tap,
} from "rxjs/operators";
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
  delayTime: number = 0,
  setMaxPage?: React.Dispatch<React.SetStateAction<number>>
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
            pluck("response", "message"),
            catchError((error) => of(error).pipe(pluck("response")))
          )
        )
      )
      .subscribe((v: any) => {
        if (v && !v.error) {
          if (setMaxPage) {
            if (isUpdatingCaches) updateCaches<T>(v.data as T[], type);
            if (setState) {
              setState(v.data as T);
              if (v.maxPage === 0) setMaxPage(1);
              if (v.maxPage) {
                updateCaches<T>(v.maxPage as T[], type);
                setMaxPage(v.maxPage);
              }
            }
          } else {
            if (isUpdatingCaches) updateCaches<T>(v as T[], type);
            if (setState) setState(v as T);
          }
        } else {
          if (handleError && typeof handleError === "function")
            handleError(v.error);
        }
        if (setIsLoading) setIsLoading(false);
      });
    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...array]);
}
