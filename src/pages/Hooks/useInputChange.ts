import { VisualNovel } from "./../../Interfaces/visualNovelList";
import { pluck, tap, filter, catchError } from "rxjs/operators";
import { ajax } from "rxjs/ajax";
import { useEffect } from "react";
import { debounceTime, fromEvent, of, switchMap } from "rxjs";
import { updateCaches } from "../../util/updateCaches";
export const useInputChange = (
  inputRef: React.MutableRefObject<HTMLInputElement>,
  url: string,
  setSuggestionList: React.Dispatch<React.SetStateAction<VisualNovel[]>>,
  setIndexActive: React.Dispatch<React.SetStateAction<number | null>>
) => {
  useEffect(() => {
    const subscription = fromEvent(inputRef.current, "input")
      .pipe(
        debounceTime(500),
        pluck("target", "value"),
        tap(() => {
          setSuggestionList([]);
          setIndexActive(null);
        }),
        filter((v) => (v as string).trim() !== ""),
        switchMap((value) =>
          ajax({
            url: url.replace("{text}", value as string),
          }).pipe(
            pluck("response", "message"),
            catchError((error) => of(error).pipe(pluck("response")))
          )
        )
      )
      .subscribe((res) => {
        if (res && !res.error) {
          setSuggestionList(res as VisualNovel[]);
          updateCaches(res as any, "VNs");
        }
      });
    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
