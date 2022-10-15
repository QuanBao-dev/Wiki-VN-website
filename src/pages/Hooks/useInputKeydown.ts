import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fromEvent } from "rxjs";

export const useInputKeydown = (
  inputSearchRef: React.MutableRefObject<HTMLInputElement>,
  setIndexActive: React.Dispatch<React.SetStateAction<number | null>>,
  indexActive: number | null,
  suggestionListContainerRef: React.MutableRefObject<HTMLUListElement>,
  maxLength:number
) => {
  const navigate = useNavigate();
  useEffect(() => {
    const subscription = fromEvent(inputSearchRef.current, "keydown").subscribe(
      (e) => {
        if ((e as any).keyCode === 13 && indexActive !== null) {
          navigate(
            (
              suggestionListContainerRef.current.children[
                indexActive - 1
              ] as HTMLAnchorElement
            ).href.replace(window.location.href, "")
          );
        }
        if ((e as any).keyCode === 38 && indexActive !== null) {
          e.preventDefault();
          if (indexActive - 1 > 0) setIndexActive(indexActive - 1);
        }
        if ((e as any).keyCode === 40) {
          e.preventDefault();
          if (indexActive === null) return setIndexActive(1);
          if (indexActive + 1 <= maxLength) setIndexActive(indexActive + 1);
        }
      }
    );
    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indexActive]);
};
