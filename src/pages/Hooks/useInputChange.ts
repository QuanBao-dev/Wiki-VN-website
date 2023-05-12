import { homeStore } from "./../../store/home";
import { VisualNovel } from "./../../Interfaces/visualNovelList";
import { pluck, tap, catchError, filter } from "rxjs/operators";
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
    const subscription = fromEvent(inputRef.current, "keyup")
      .pipe(
        debounceTime(500),
        pluck("target", "value"),
        tap((v) => {
          if (v !== homeStore.currentState().textSearch) {
            setSuggestionList([]);
            setIndexActive(0);
          }
        }),
        filter(
          (v) =>
            (v as string).trim() !== "" &&
            v !== homeStore.currentState().textSearch
        ),
        tap((v) => {
          homeStore.updateState({
            textSearch: v as string,
          });
        }),
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
          // console.log(inputRef.current.value);
          if (inputRef.current.value === "") return;
          setSuggestionList(res as VisualNovel[]);
          updateCaches(res as any, "VNs");
        }
      });
    return () => {
      subscription.unsubscribe();
      homeStore.updateState({
        textSearch: "",
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
